import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Obj } from '../obj';
import { HttpQuery } from './HttpQuery';

describe('HttpQuery', () => {
  let query: HttpQuery;

  beforeEach(() => {
    query = new HttpQuery();
  });

  afterEach(() => {
    query.clear();
    vi.useRealTimers();
  });

  it('handle returns a Result and keys with Obj.identity', async () => {
    const handler = vi.fn(async () => [{ id: 1 }]);
    const [data, error] = await query.handle(['items'], handler, {
      ttl: '5m',
    });
    expect(error).toBeNull();
    expect(data).toEqual([{ id: 1 }]);
    expect(handler).toHaveBeenCalledWith(
      ['items'],
      Obj.identity(['items']),
      undefined,
    );
  });

  it('passes the provided signal to the handler', async () => {
    const controller = new AbortController();
    const handler = vi.fn(async () => 'ok');
    await query.handle(['items'], handler, { signal: controller.signal });
    expect(handler).toHaveBeenCalledWith(
      ['items'],
      Obj.identity(['items']),
      controller.signal,
    );
  });

  it('dedupes in-flight requests with the same params', async () => {
    const handler = vi.fn(
      () => new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 20)),
    );
    const [a, b] = await Promise.all([
      query.handle(['items'], handler),
      query.handle(['items'], handler),
    ]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(a).toEqual(['ok', null]);
    expect(b).toEqual(['ok', null]);
  });

  it('reuses a successful result within ttl', async () => {
    const handler = vi.fn(async () => 'once');
    await query.handle(['items'], handler, { ttl: '5m' });
    await query.handle(['items'], handler, { ttl: '5m' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('wraps a thrown handler as Result.fail and retries after invalidate', async () => {
    const handler = vi
      .fn()
      .mockRejectedValueOnce('nope')
      .mockResolvedValueOnce('ok');

    const [, error] = await query.handle(['items'], handler);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('nope');

    await Promise.resolve();
    const [data, retryError] = await query.handle(['items'], handler);
    expect(retryError).toBeNull();
    expect(data).toBe('ok');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('invalidate drops one key so the next handle runs again', async () => {
    const handler = vi.fn(async (params: readonly unknown[]) => params[1]);
    await query.handle(['user', 1], handler, { ttl: '5m' });
    query.invalidate(['user', 1]);
    await query.handle(['user', 1], handler, { ttl: '5m' });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('invalidatePrefix on ["user"] drops ["user", 1] and not ["user-admin", 1]', async () => {
    const users = vi.fn(async () => 'user');
    const nested = vi.fn(async () => 'nested');
    const admin = vi.fn(async () => 'admin');

    await query.handle(['user'], users, { ttl: '5m' });
    await query.handle(['user', 1], nested, { ttl: '5m' });
    await query.handle(['user-admin', 1], admin, { ttl: '5m' });

    query.invalidatePrefix(['user']);

    await query.handle(['user'], users, { ttl: '5m' });
    await query.handle(['user', 1], nested, { ttl: '5m' });
    await query.handle(['user-admin', 1], admin, { ttl: '5m' });

    expect(users).toHaveBeenCalledTimes(2);
    expect(nested).toHaveBeenCalledTimes(2);
    expect(admin).toHaveBeenCalledTimes(1);
  });

  it('clear removes every cached result', async () => {
    const handler = vi.fn(async () => 1);
    await query.handle(['a'], handler, { ttl: '5m' });
    await query.handle(['b'], handler, { ttl: '5m' });
    query.clear();
    await query.handle(['a'], handler, { ttl: '5m' });
    await query.handle(['b'], handler, { ttl: '5m' });
    expect(handler).toHaveBeenCalledTimes(4);
  });

  it('does not run the handler when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const handler = vi.fn(async () => 'nope');
    const [, error] = await query.handle(['items'], handler, {
      signal: controller.signal,
    });
    expect(handler).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe('AbortError');
  });

  it('fails this waiter and drops the key when the signal aborts in flight', async () => {
    const controller = new AbortController();
    const handler = vi.fn(() => new Promise<string>(() => {}));
    const pending = query.handle(['items'], handler, {
      signal: controller.signal,
    });
    await Promise.resolve();
    controller.abort();

    const [, error] = await pending;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).name).toBe('AbortError');
    expect(handler).toHaveBeenCalledTimes(1);

    const next = vi.fn(async () => 'ok');
    const [data, nextError] = await query.handle(['items'], next);
    expect(nextError).toBeNull();
    expect(data).toBe('ok');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('abort of one waiter does not fail another sharing the same in-flight work', async () => {
    let resolveHandler!: (value: string) => void;
    const handler = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveHandler = resolve;
        }),
    );
    const firstController = new AbortController();
    const first = query.handle(['items'], handler, {
      signal: firstController.signal,
    });
    const second = query.handle(['items'], handler);
    await Promise.resolve();

    firstController.abort();
    const [, firstError] = await first;
    expect(firstError).toBeInstanceOf(Error);
    expect((firstError as Error).name).toBe('AbortError');

    resolveHandler('ok');
    const [data, secondError] = await second;
    expect(secondError).toBeNull();
    expect(data).toBe('ok');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('expired ttl runs the handler again', async () => {
    vi.useFakeTimers();
    const handler = vi.fn(async () => 'v');
    const pending = query.handle(['items'], handler, { ttl: 100 });
    await vi.advanceTimersByTimeAsync(0);
    await pending;
    await vi.advanceTimersByTimeAsync(100);
    await query.handle(['items'], handler, { ttl: 100 });
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
