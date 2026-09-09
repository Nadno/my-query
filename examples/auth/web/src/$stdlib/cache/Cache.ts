import { Obj } from '../obj';
import { TimeSpan, type TimeInput } from '../time-span';

type CacheEntry<T> = {
  value: T;
  expiresAt?: number;
};

export type CacheOptions = {
  ttl?: TimeInput;
};

export type CacheProperty = string | symbol | number;

function toExpiresAt(ttl: TimeInput | undefined): number | undefined {
  if (ttl == null) return undefined;
  return Date.now() + TimeSpan.from(ttl).totalMilliseconds;
}

export class Cache<TEntry = unknown> {
  static readonly DEFAULT_TTL = TimeSpan.fromMinutes(5).totalMilliseconds;

  private readonly store = new Map<CacheProperty, CacheEntry<TEntry>>();

  private isFresh(entry: CacheEntry<TEntry>): boolean {
    return entry.expiresAt == null || entry.expiresAt > Date.now();
  }

  has(key: CacheProperty): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (!this.isFresh(entry)) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  set<T extends TEntry>(
    key: CacheProperty,
    value: T,
    { ttl }: CacheOptions = {},
  ): void {
    this.store.set(key, {
      value,
      expiresAt: toExpiresAt(ttl),
    });
  }

  get<T extends TEntry>(key: CacheProperty): T | undefined {
    const found = this.store.get(key) as CacheEntry<T> | undefined;
    if (!found) return undefined;
    if (!this.isFresh(found)) {
      this.invalidate(key);
      return undefined;
    }
    return found.value;
  }

  getOrSet<T extends TEntry>(
    key: CacheProperty,
    or: () => T,
    options?: CacheOptions,
  ): T {
    const found = this.store.get(key) as CacheEntry<T> | undefined;
    if (found && this.isFresh(found)) {
      return found.value;
    }
    if (found) this.store.delete(key);

    const value = or();
    this.set(key, value, options);
    return value;
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  invalidate(key: CacheProperty): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  dispose(): void {
    this.clear();
  }

  static memoize<T extends (...args: never[]) => unknown>(
    fn: T,
    {
      keyFn,
      ttl,
    }: {
      keyFn?: (...args: Parameters<T>) => string;
      ttl?: TimeInput;
    } = {},
  ): ((...args: Parameters<T>) => ReturnType<T>) & { clear: () => void } {
    const cache = new Cache<ReturnType<T>>();
    const buildKey = keyFn ?? ((...args: Parameters<T>) => Obj.identity(args));

    const memoized = ((...args: Parameters<T>): ReturnType<T> => {
      const key = buildKey(...args);
      return cache.getOrSet(key, () => fn(...args) as ReturnType<T>, { ttl });
    }) as ((...args: Parameters<T>) => ReturnType<T>) & { clear: () => void };

    memoized.clear = () => cache.clear();
    return memoized;
  }
}
