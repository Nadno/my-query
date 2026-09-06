import {
  SerializableStore,
  StoreAdapter,
  StoreFieldDescriptor,
  StoreType,
} from './serializable-store';

// ─── Cookie helpers ────────────────────────────────────────────────────────

export type CookieOptions = {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

const parseCookies = (): Record<string, string> =>
  document.cookie.split(';').reduce(
    (acc, pair) => {
      const eqIndex = pair.indexOf('=');
      if (eqIndex < 0) return acc;
      const key = decodeURIComponent(pair.slice(0, eqIndex).trim());
      const value = decodeURIComponent(pair.slice(eqIndex + 1).trim());
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

const buildCookieString = (
  key: string,
  value: string,
  options: CookieOptions = {}
): string => {
  let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  if (options.expires != null) {
    const maxAge = Math.floor(options.expires * 86400);
    cookie += `; Max-Age=${maxAge}`;
  }
  if (options.path) cookie += `; Path=${options.path}`;
  else cookie += `; Path=/`;
  if (options.domain) cookie += `; Domain=${options.domain}`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.secure) cookie += `; Secure`;
  return cookie;
};

const expireCookie = (key: string): void => {
  document.cookie = buildCookieString(key, '', { expires: -1 });
};

// ─── Adapters ──────────────────────────────────────────────────────────────

const createWebStorageAdapter = (storage: Storage): StoreAdapter => ({
  get: key => storage.getItem(key),
  set: (key, value) => storage.setItem(key, value),
  delete: key => storage.removeItem(key),
});

const cookieAdapter: StoreAdapter = {
  get: key => parseCookies()[key] ?? null,
  set: (key, value) => {
    document.cookie = buildCookieString(key, value);
  },
  delete: key => expireCookie(key),
};

// ─── CookieStore: extends SerializableStore with cookie options ────────────

class CookieStore extends SerializableStore {
  private _pendingCookieOptions: Map<string, CookieOptions> = new Map();

  set<T>(field: StoreFieldDescriptor<T>, value: T, options?: CookieOptions): this;
  set(key: string, value: unknown, options?: CookieOptions): this;
  set<T>(
    keyOrField: string | StoreFieldDescriptor<T>,
    value: T | unknown,
    options?: CookieOptions
  ): this {
    const key =
      typeof keyOrField === 'string' ? keyOrField : keyOrField.key;
    if (options) this._pendingCookieOptions.set(key, options);
    return super.set(keyOrField as string, value);
  }

  commit(): void {
    this._cache.forEach(({ type, value }, key) => {
      const storeType = this._types[type];
      if (!storeType)
        throw new Error(
          `CookieStore: no serializer for type "${type}" (key "${key}")`
        );

      const serialized = `${type}::${storeType.serializer(value as never, type)}`;
      const options = this._pendingCookieOptions.get(key);
      document.cookie = buildCookieString(key, serialized, options ?? {});

      this._subscribers.get(key)?.forEach(cb => cb(value));
      this._globalSubscribers.forEach(cb => cb(key, value));
    });
    this._pendingCookieOptions.clear();
  }
}

// ─── Namespace adapter (for schema models) ─────────────────────────────────

const createNamespacedAdapter = (
  base: StoreAdapter,
  namespace: string
): StoreAdapter => ({
  get: key => base.get(`${namespace}::${key}`),
  set: (key, value) => base.set(`${namespace}::${key}`, value),
  delete: key => base.delete(`${namespace}::${key}`),
});

// ─── BrowserStore ──────────────────────────────────────────────────────────

const localAdapter = createWebStorageAdapter(localStorage);
const sessionAdapter = createWebStorageAdapter(sessionStorage);

const localStore = new SerializableStore(localAdapter);
const sessionStore = new SerializableStore(sessionAdapter);
const cookieStore = new CookieStore(cookieAdapter);

// Cross-tab sync: localStorage storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (e.storageArea !== localStorage || !e.key) return;

    // Invalidate cache so next get() reads fresh value from adapter
    localStore['_cache'].delete(e.key);

    // Emit pub/sub for this key with the new value
    if (e.newValue) {
      const raw = e.newValue;
      const match = raw.match(/^([a-z]+)::/i);
      if (match) {
        const type = match[1] as string;
        const storeTypes = localStore['_types'];
        const storeType = storeTypes[type];
        if (storeType) {
          const serializedValue = raw.slice(match[0].length);
          const deserialized = storeType.deserializer(serializedValue, type);
          localStore['_subscribers'].get(e.key)?.forEach(cb => cb(deserialized));
          localStore['_globalSubscribers'].forEach(cb => cb(e.key!, deserialized));
        }
      }
    } else {
      // Key was deleted
      localStore['_subscribers'].get(e.key)?.forEach(cb => cb(undefined));
      localStore['_globalSubscribers'].forEach(cb => cb(e.key!, undefined));
    }
  });
}

// ─── Store.schema() ────────────────────────────────────────────────────────

type SchemaPropSimple = abstract new (...args: any[]) => any;
type SchemaPropOptions<T = any> = {
  type: abstract new (...args: any[]) => T;
  default?: T;
};
type SchemaDef = Record<string, SchemaPropSimple | SchemaPropOptions>;

type InferSchemaType<T extends SchemaPropSimple | SchemaPropOptions> =
  T extends SchemaPropSimple
    ? InstanceType<T>
    : T extends SchemaPropOptions<infer V>
      ? V
      : never;

type SchemaInstance<TSchema extends SchemaDef> = {
  get<K extends keyof TSchema>(key: K): InferSchemaType<TSchema[K]>;
  set<K extends keyof TSchema>(
    key: K,
    value: InferSchemaType<TSchema[K]>
  ): SchemaInstance<TSchema>;
  commit(): void;
  delete(key: keyof TSchema): void;
  clear(): void;
  on<K extends keyof TSchema>(
    key: K,
    cb: (value: InferSchemaType<TSchema[K]>) => void
  ): () => void;
  onChange(cb: (key: string, value: unknown) => void): () => void;
};

function schema<TSchema extends SchemaDef>(options: {
  storage: 'local' | 'session' | 'cookie';
  namespace: string;
  schema: TSchema;
  types?: Record<string, StoreType<any>>;
}): SchemaInstance<TSchema> {
  const baseAdapter =
    options.storage === 'local'
      ? localAdapter
      : options.storage === 'session'
        ? sessionAdapter
        : cookieAdapter;

  const namespacedAdapter = createNamespacedAdapter(
    baseAdapter,
    options.namespace
  );

  // Build field descriptors from schema definition
  const fields = Object.entries(options.schema).reduce(
    (acc, [key, def]) => {
      if (typeof def === 'function') {
        acc[key] = SerializableStore.field(key, def as SchemaPropSimple);
      } else {
        acc[key] = SerializableStore.field(key, {
          type: def.type,
          default: def.default,
        });
      }
      return acc;
    },
    {} as Record<string, StoreFieldDescriptor<any>>
  );

  const store = new SerializableStore(namespacedAdapter, {
    types: options.types,
  });

  const changeTrackingKey = '__changesProps';
  const changedKeys = new Set<string>();

  const instance: SchemaInstance<TSchema> = {
    get<K extends keyof TSchema>(key: K) {
      return store.get(fields[key as string]) as InferSchemaType<TSchema[K]>;
    },
    set<K extends keyof TSchema>(
      key: K,
      value: InferSchemaType<TSchema[K]>
    ): SchemaInstance<TSchema> {
      store.set(fields[key as string], value);
      changedKeys.add(key as string);
      return instance;
    },
    commit() {
      // Track changed keys in storage for cross-tab granular updates
      if (changedKeys.size > 0) {
        store.set(changeTrackingKey, [...changedKeys]);
      }
      store.commit();
      changedKeys.clear();
    },
    delete(key: keyof TSchema) {
      store.delete(fields[key as string]);
    },
    clear() {
      store.clear();
    },
    on<K extends keyof TSchema>(
      key: K,
      cb: (value: InferSchemaType<TSchema[K]>) => void
    ) {
      return store.on(
        fields[key as string],
        cb as (value: unknown) => void
      );
    },
    onChange(cb) {
      return store.onChange(cb);
    },
  };

  return instance;
}

// ─── Export ────────────────────────────────────────────────────────────────

export const Store = {
  local: localStore,
  session: sessionStore,
  cookie: cookieStore,
  schema,
};
