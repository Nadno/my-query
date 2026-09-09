import { Obj } from '@/$stdlib/obj';
import { Result } from '@/$stdlib/result';
import { Type } from '@/$stdlib/type';

export type StorageState = 'defaults' | 'persisted';

export type CookieOptions = {
  path?: string;
  domain?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  /** Seconds. Omit for a session cookie. */
  maxAge?: number;
};

export type NamespacedStorage<T extends Record<string, unknown>> = {
  storageState(): StorageState;
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): NamespacedStorage<T>;
  patch(partial: Partial<T>): NamespacedStorage<T>;
  clear(): NamespacedStorage<T>;
};

export type CookieNamespacedStorage<T extends Record<string, unknown>> = {
  storageState(): StorageState;
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(
    key: K,
    value: T[K],
    options?: CookieOptions,
  ): CookieNamespacedStorage<T>;
  patch(
    partial: Partial<T>,
    options?: CookieOptions,
  ): CookieNamespacedStorage<T>;
  clear(options?: CookieOptions): CookieNamespacedStorage<T>;
};

type StorageAdapter = {
  get(key: string): string | null;
  set(key: string, value: string, options?: CookieOptions): void;
  delete(key: string, options?: CookieOptions): void;
};

const COOKIE_MAX_BYTES = 3500;

function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function patchValue<T>(current: T, next: T): T {
  if (Type.isPlainObject(current) && Type.isPlainObject(next)) {
    return clone(Obj.merge(current, next)) as T;
  }
  return clone(next);
}

function defaultSecure(): boolean {
  return globalThis.location?.protocol === 'https:';
}

type ResolvedCookie = {
  path: string;
  domain?: string;
  sameSite: NonNullable<CookieOptions['sameSite']>;
  secure: boolean;
  maxAge?: number;
};

function resolveCookieOptions(opts?: CookieOptions): ResolvedCookie {
  return {
    path: opts?.path ?? '/',
    domain: opts?.domain,
    sameSite: opts?.sameSite ?? 'Lax',
    secure: opts?.secure ?? defaultSecure(),
    maxAge: opts?.maxAge,
  };
}

function mergeCookieWrite(
  identity: ResolvedCookie,
  write?: CookieOptions,
): ResolvedCookie {
  return {
    path: identity.path,
    domain: identity.domain,
    sameSite: write?.sameSite ?? identity.sameSite,
    secure: write?.secure ?? identity.secure,
    maxAge: write?.maxAge ?? identity.maxAge,
  };
}

function buildCookieString(
  key: string,
  value: string,
  opts: ResolvedCookie,
  expire = false,
): string {
  let cookie = `${encodeURIComponent(key)}=${
    expire ? '' : encodeURIComponent(value)
  }`;
  cookie += `; Path=${opts.path}`;
  if (opts.domain) cookie += `; Domain=${opts.domain}`;
  cookie += `; SameSite=${opts.sameSite}`;
  if (opts.secure) cookie += '; Secure';
  if (expire) {
    cookie += '; Max-Age=0';
  } else if (opts.maxAge != null) {
    cookie += `; Max-Age=${Math.floor(opts.maxAge)}`;
  }
  return cookie;
}

function assertCookieSize(cookie: string): void {
  if (cookie.length > COOKIE_MAX_BYTES) {
    throw new RangeError(
      `Cookie too large: ${cookie.length} bytes (max ${COOKIE_MAX_BYTES})`,
    );
  }
}

function parseCookies(): Record<string, string> {
  const raw = document.cookie;
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split(';')) {
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    try {
      const key = decodeURIComponent(pair.slice(0, eq).trim());
      const value = decodeURIComponent(pair.slice(eq + 1).trim());
      out[key] = value;
    } catch {
      continue;
    }
  }
  return out;
}

function createWebStorageAdapter(
  webStorage: globalThis.Storage,
): StorageAdapter {
  return {
    get(key) {
      return webStorage.getItem(key);
    },
    set(key, value) {
      webStorage.setItem(key, value);
    },
    delete(key) {
      webStorage.removeItem(key);
    },
  };
}

function createCookieAdapter(): StorageAdapter {
  return {
    get(key) {
      return parseCookies()[key] ?? null;
    },
    set(key, value, options) {
      const opts = resolveCookieOptions(options);
      const cookie = buildCookieString(key, value, opts);
      assertCookieSize(cookie);
      document.cookie = cookie;
    },
    delete(key, options) {
      const opts = resolveCookieOptions(options);
      document.cookie = buildCookieString(key, '', opts, true);
    },
  };
}

type ReadResult =
  | { storageState: 'persisted'; value: unknown }
  | { storageState: 'defaults' };

function readSlot(
  adapter: StorageAdapter,
  key: string,
  deleteOptions?: CookieOptions,
): ReadResult {
  const raw = adapter.get(key);
  if (raw == null || raw === '') return { storageState: 'defaults' };

  const [value, error] = Result.try(() => JSON.parse(raw) as unknown);
  if (error !== null) {
    adapter.delete(key, deleteOptions);
    return { storageState: 'defaults' };
  }
  return { storageState: 'persisted', value };
}

function mergeSchema<T extends Record<string, unknown>>(
  defaults: T,
  parsed: unknown,
): T | null {
  if (!Type.isPlainObject(parsed)) return null;
  const state = clone(defaults);
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      state[key] = clone(parsed[key as string]) as T[keyof T];
    }
  }
  return state;
}

function persistDocument(
  adapter: StorageAdapter,
  key: string,
  state: Record<string, unknown>,
  options?: CookieOptions,
): void {
  adapter.set(key, JSON.stringify(state), options);
}

function createNamespacedStorage<T extends Record<string, unknown>>(
  adapter: StorageAdapter,
  namespace: string,
  defaults: T,
  cookieIdentity?: ResolvedCookie,
): NamespacedStorage<T> & CookieNamespacedStorage<T> {
  const template = clone(defaults);
  const slot = readSlot(adapter, namespace, cookieIdentity);
  let slotState: StorageState = slot.storageState;
  let state: T;

  if (slot.storageState === 'persisted') {
    const merged = mergeSchema(template, slot.value);
    if (merged == null) {
      adapter.delete(namespace, cookieIdentity);
      slotState = 'defaults';
      state = clone(template);
    } else {
      state = merged;
    }
  } else {
    state = clone(template);
  }

  const writeOpts = (write?: CookieOptions): CookieOptions | undefined => {
    if (!cookieIdentity) return undefined;
    return mergeCookieWrite(cookieIdentity, write);
  };

  const persist = (options?: CookieOptions) => {
    persistDocument(adapter, namespace, state, writeOpts(options));
    slotState = 'persisted';
  };

  const api: NamespacedStorage<T> & CookieNamespacedStorage<T> = {
    storageState() {
      return slotState;
    },
    get(key) {
      return clone(state[key]);
    },
    set(key, value, options?: CookieOptions) {
      state[key] = clone(value);
      persist(options);
      return api;
    },
    patch(partial, options?: CookieOptions) {
      for (const key of Object.keys(partial) as (keyof T)[]) {
        if (!Object.prototype.hasOwnProperty.call(template, key)) continue;
        const next = partial[key];
        if (next === undefined) continue;
        state[key] = patchValue(state[key], next as T[keyof T]);
      }
      persist(options);
      return api;
    },
    clear(options?: CookieOptions) {
      adapter.delete(namespace, writeOpts(options) ?? options);
      state = clone(template);
      slotState = 'defaults';
      return api;
    },
  };

  return api;
}

type BagApi = {
  get<T>(key: string): T | undefined;
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  storageState(key: string): StorageState;
  create<T extends Record<string, unknown>>(
    namespace: string,
    defaults: T,
  ): NamespacedStorage<T>;
};

type CookieBagApi = {
  get<T>(key: string): T | undefined;
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown, options?: CookieOptions): void;
  delete(key: string, options?: CookieOptions): void;
  storageState(key: string): StorageState;
  create<T extends Record<string, unknown>>(
    namespace: string,
    defaults: T,
    cookieOpts?: CookieOptions,
  ): CookieNamespacedStorage<T>;
};

function bagGet<T>(
  adapter: StorageAdapter,
  key: string,
  fallback?: T,
  hasFallback = false,
): T | undefined {
  const slot = readSlot(adapter, key);
  if (slot.storageState === 'persisted') return clone(slot.value) as T;
  if (hasFallback) return fallback;
  return undefined;
}

function createStorageApi(adapter: StorageAdapter): BagApi {
  return {
    create(namespace, defaults) {
      return createNamespacedStorage(adapter, namespace, defaults);
    },
    get<T>(key: string, fallback?: T): T | undefined {
      return bagGet(adapter, key, fallback, arguments.length >= 2);
    },
    set(key, value) {
      adapter.set(key, JSON.stringify(value));
    },
    delete(key) {
      adapter.delete(key);
    },
    storageState(key) {
      return readSlot(adapter, key).storageState;
    },
  };
}

function createCookieApi(adapter: StorageAdapter): CookieBagApi {
  return {
    create(namespace, defaults, cookieOpts) {
      return createNamespacedStorage(
        adapter,
        namespace,
        defaults,
        resolveCookieOptions(cookieOpts),
      );
    },
    get<T>(key: string, fallback?: T): T | undefined {
      return bagGet(adapter, key, fallback, arguments.length >= 2);
    },
    set(key, value, options) {
      adapter.set(key, JSON.stringify(value), options);
    },
    delete(key, options) {
      adapter.delete(key, options);
    },
    storageState(key) {
      return readSlot(adapter, key).storageState;
    },
  };
}

function localAdapter(): StorageAdapter {
  return createWebStorageAdapter(localStorage);
}

function sessionAdapter(): StorageAdapter {
  return createWebStorageAdapter(sessionStorage);
}

export const Storage = {
  get local(): BagApi {
    return createStorageApi(localAdapter());
  },
  get session(): BagApi {
    return createStorageApi(sessionAdapter());
  },
  get cookie(): CookieBagApi {
    return createCookieApi(createCookieAdapter());
  },
};
