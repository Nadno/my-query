import { Cache, type CacheOptions } from '../cache';
import { Obj } from '../obj';
import { Result, type AnyResult } from '../result';

export type HttpQueryHandler<TData, TParams extends readonly unknown[]> = (
  params: TParams,
  key: string,
  signal?: AbortSignal,
) => Promise<TData>;

export type HttpQueryOptions = CacheOptions & {
  signal?: AbortSignal;
};

function abortError(signal: AbortSignal): Error {
  if (signal.reason instanceof Error) return signal.reason;
  return new DOMException('This operation was aborted.', 'AbortError');
}

export class HttpQuery {
  private readonly cache = new Cache<Promise<AnyResult<unknown>>>();

  async handle<TParams extends readonly unknown[], TData>(
    params: TParams,
    handler: HttpQueryHandler<TData, TParams>,
    options?: HttpQueryOptions,
  ): Promise<AnyResult<TData>> {
    const { signal, ttl } = options ?? {};
    const cacheOptions = ttl == null ? undefined : { ttl };

    if (signal?.aborted) {
      return Result.fail(abortError(signal));
    }

    const key = Obj.identity(params);

    const work = this.cache.getOrSet(
      key,
      async () => {
        const result = await Result.tryAsync(handler(params, key, signal));
        if (result[1] !== null) {
          queueMicrotask(() => this.cache.invalidate(key));
        }
        return result;
      },
      cacheOptions,
    ) as Promise<AnyResult<TData>>;

    if (!signal) return work;

    return this.awaitWorkOrAbort(work, key, signal);
  }

  private awaitWorkOrAbort<T>(
    work: Promise<AnyResult<T>>,
    key: string,
    signal: AbortSignal,
  ): Promise<AnyResult<T>> {
    return new Promise((resolve) => {
      let settled = false;

      const finish = (result: AnyResult<T>) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener('abort', onAbort);
        resolve(result);
      };

      const onAbort = () => {
        this.cache.invalidate(key);
        finish(Result.fail(abortError(signal)));
      };

      signal.addEventListener('abort', onAbort, { once: true });
      if (signal.aborted) {
        onAbort();
        return;
      }

      work.then(finish);
    });
  }

  invalidate(params: readonly unknown[]): void {
    this.cache.invalidate(Obj.identity(params));
  }

  invalidatePrefix(params: readonly unknown[]): void {
    const identity = Obj.identity(params);
    this.cache.invalidate(identity);
    if (identity.startsWith('[')) {
      this.cache.invalidatePrefix(`${identity.slice(0, -1)},`);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  dispose(): void {
    this.cache.dispose();
  }
}
