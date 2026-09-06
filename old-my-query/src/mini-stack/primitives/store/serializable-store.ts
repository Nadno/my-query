export type StoreType<TValue> = {
  serializer: (value: TValue, type: string) => string;
  deserializer: (value: string, type: string) => TValue;
};

export type DefaultStoreTypes = {
  undefined: StoreType<undefined>;
  boolean: StoreType<boolean>;
  string: StoreType<string>;
  number: StoreType<number>;
  object: StoreType<object>;
};

export type StoreAdapter = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
};

export type StoreFieldDescriptor<T> = {
  readonly key: string;
  readonly type: abstract new (...args: any[]) => T;
  readonly defaultValue?: T;
};

const typedSerializedDataRegex = /^(?:([a-z]+)::)/i;
const _toString = (value: unknown) => String(value);

const STORE_DEFAULT_TYPES: DefaultStoreTypes = {
  undefined: {
    serializer: _toString,
    deserializer: () => undefined,
  },
  boolean: {
    serializer: _toString,
    deserializer: value => value === 'true',
  },
  string: {
    serializer: value => value,
    deserializer: value => value,
  },
  number: {
    serializer: _toString,
    deserializer: value =>
      value.includes('.') ? parseFloat(value) : parseInt(value),
  },
  object: {
    serializer: value => JSON.stringify(value),
    deserializer: value => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    },
  },
};

type CacheEntry = { type: string; value: unknown };
type Subscribers = Map<string, Set<(value: unknown) => void>>;

export class SerializableStore {
  // ─── Statics: field definition ──────────────────────────────────────────

  static field<T>(
    key: string,
    type: abstract new (...args: any[]) => T,
    defaultValue?: T
  ): StoreFieldDescriptor<T>;
  static field<T>(
    key: string,
    options: { type: abstract new (...args: any[]) => T; default?: T }
  ): StoreFieldDescriptor<T>;
  static field<T>(
    key: string,
    typeOrOptions:
      | (abstract new (...args: any[]) => T)
      | { type: abstract new (...args: any[]) => T; default?: T },
    defaultValue?: T
  ): StoreFieldDescriptor<T> {
    if (typeof typeOrOptions === 'function') {
      return { key, type: typeOrOptions, defaultValue };
    }
    return {
      key,
      type: typeOrOptions.type,
      defaultValue: typeOrOptions.default,
    };
  }

  // ─── Instance ──────────────────────────────────────────────────────────

  protected readonly _adapter: StoreAdapter;
  protected readonly _types: Record<string, StoreType<any>>;
  protected readonly _cache: Map<string, CacheEntry> = new Map();
  protected readonly _subscribers: Subscribers = new Map();
  protected readonly _globalSubscribers: Set<
    (key: string, value: unknown) => void
  > = new Set();

  constructor(
    adapter: StoreAdapter,
    options?: { types?: Record<string, StoreType<any>> }
  ) {
    this._adapter = adapter;
    this._types = { ...STORE_DEFAULT_TYPES, ...(options?.types ?? {}) };
  }

  // ─── get ────────────────────────────────────────────────────────────────

  get<T>(field: StoreFieldDescriptor<T>): T;
  get(key: string): unknown;
  get<T>(keyOrField: string | StoreFieldDescriptor<T>): T | unknown {
    const key =
      typeof keyOrField === 'string' ? keyOrField : keyOrField.key;
    const defaultValue =
      typeof keyOrField === 'string' ? undefined : keyOrField.defaultValue;

    if (this._cache.has(key)) return this._cache.get(key)!.value as T;

    const raw = this._adapter.get(key);
    if (!raw || !typedSerializedDataRegex.test(raw)) return defaultValue;

    const [, serializedType, serializedValue] = raw.split(
      typedSerializedDataRegex
    ) as [string, keyof DefaultStoreTypes, string];

    const storeType = this._types[serializedType];
    if (!storeType)
      throw new Error(
        `SerializableStore: unknown type "${serializedType}" for key "${key}"`
      );

    const value = storeType.deserializer(serializedValue, serializedType) as T;
    this._cache.set(key, { type: serializedType, value });
    return value;
  }

  // ─── set ────────────────────────────────────────────────────────────────

  set<T>(field: StoreFieldDescriptor<T>, value: T): this;
  set(key: string, value: unknown): this;
  set<T>(
    keyOrField: string | StoreFieldDescriptor<T>,
    value: T | unknown
  ): this {
    const key =
      typeof keyOrField === 'string' ? keyOrField : keyOrField.key;
    const type = typeof value;
    this._cache.set(key, { type, value });
    return this;
  }

  // ─── commit ─────────────────────────────────────────────────────────────

  commit(): void {
    this._cache.forEach(({ type, value }, key) => {
      const storeType = this._types[type];
      if (!storeType)
        throw new Error(
          `SerializableStore: no serializer for type "${type}" (key "${key}")`
        );

      const serialized = `${type}::${storeType.serializer(value as never, type)}`;
      this._adapter.set(key, serialized);

      const deserialized = value;
      this._subscribers.get(key)?.forEach(cb => cb(deserialized));
      this._globalSubscribers.forEach(cb => cb(key, deserialized));
    });
  }

  // ─── delete / clear ─────────────────────────────────────────────────────

  delete(keyOrField: string | StoreFieldDescriptor<any>): void {
    const key =
      typeof keyOrField === 'string' ? keyOrField : keyOrField.key;
    this._cache.delete(key);
    this._adapter.delete(key);
  }

  clear(): void {
    this._cache.clear();
  }

  // ─── pub/sub ────────────────────────────────────────────────────────────

  on<T>(field: StoreFieldDescriptor<T>, cb: (value: T) => void): () => void;
  on(key: string, cb: (value: unknown) => void): () => void;
  on<T>(
    keyOrField: string | StoreFieldDescriptor<T>,
    cb: (value: T | unknown) => void
  ): () => void {
    const key =
      typeof keyOrField === 'string' ? keyOrField : keyOrField.key;

    if (!this._subscribers.has(key)) this._subscribers.set(key, new Set());
    this._subscribers.get(key)!.add(cb as (value: unknown) => void);

    return () => this._subscribers.get(key)?.delete(cb as (value: unknown) => void);
  }

  onChange(cb: (key: string, value: unknown) => void): () => void {
    this._globalSubscribers.add(cb);
    return () => this._globalSubscribers.delete(cb);
  }
}
