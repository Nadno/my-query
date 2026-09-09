import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TimeSpan } from '../time-span';
import { Cache } from './Cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
  });

  afterEach(() => {
    cache.clear();
    vi.useRealTimers();
  });

  it('set, get and has round-trip a value', () => {
    cache.set('k', 1);
    expect(cache.get('k')).toBe(1);
    expect(cache.has('k')).toBe(true);
    expect(cache.get('missing')).toBeUndefined();
    expect(cache.has('missing')).toBe(false);
  });

  it('DEFAULT_TTL is five minutes', () => {
    expect(Cache.DEFAULT_TTL).toBe(TimeSpan.fromMinutes(5).totalMilliseconds);
  });

  it('ttl accepts milliseconds or a TimeSpan string', () => {
    vi.useFakeTimers();
    cache.set('ms', 'a', { ttl: 1_000 });
    cache.set('str', 'b', { ttl: '5m' });

    vi.advanceTimersByTime(999);
    expect(cache.get('ms')).toBe('a');
    expect(cache.has('str')).toBe(true);

    vi.advanceTimersByTime(1);
    expect(cache.get('ms')).toBeUndefined();
    expect(cache.has('ms')).toBe(false);

    vi.advanceTimersByTime(TimeSpan.fromMinutes(5).totalMilliseconds - 1_000);
    expect(cache.get('str')).toBeUndefined();
  });

  it('invalid ttl string throws', () => {
    expect(() => cache.set('k', 1, { ttl: 'nope' })).toThrow(
      /Invalid TimeSpan format/,
    );
  });

  it('omitted ttl does not expire', () => {
    vi.useFakeTimers();
    cache.set('k', 1);
    vi.advanceTimersByTime(TimeSpan.fromDays(1).totalMilliseconds);
    expect(cache.get('k')).toBe(1);
  });

  it('getOrSet calls the factory once while fresh', () => {
    const or = vi.fn(() => 'v');
    expect(cache.getOrSet('k', or, { ttl: '5m' })).toBe('v');
    expect(cache.getOrSet('k', or, { ttl: '5m' })).toBe('v');
    expect(or).toHaveBeenCalledTimes(1);
  });

  it('getOrSet calls the factory again after expiry', () => {
    vi.useFakeTimers();
    const or = vi.fn(() => 'v');
    cache.getOrSet('k', or, { ttl: 100 });
    vi.advanceTimersByTime(100);
    cache.getOrSet('k', () => 'next', { ttl: 100 });
    expect(cache.get('k')).toBe('next');
    expect(or).toHaveBeenCalledTimes(1);
  });

  it('invalidate removes one key', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.invalidate('a');
    expect(cache.has('a')).toBe(false);
    expect(cache.get('b')).toBe(2);
  });

  it('invalidatePrefix only matches string keys that start with the prefix', () => {
    cache.set('user:1', 1);
    cache.set('user:2', 2);
    cache.set('admin:1', 3);
    cache.set(1, 'numeric');
    cache.invalidatePrefix('user:');
    expect(cache.has('user:1')).toBe(false);
    expect(cache.has('user:2')).toBe(false);
    expect(cache.get('admin:1')).toBe(3);
    expect(cache.get(1)).toBe('numeric');
  });

  it('clear and dispose empty the store', () => {
    cache.set('a', 1);
    cache.clear();
    expect(cache.has('a')).toBe(false);

    cache.set('b', 2);
    cache.dispose();
    expect(cache.has('b')).toBe(false);
  });

  describe('memoize', () => {
    it('caches results by argument identity', () => {
      const fn = vi.fn((x: number, y: string) => `${x}-${y}`);
      const memo = Cache.memoize(fn);

      expect(memo(1, 'a')).toBe('1-a');
      expect(memo(1, 'a')).toBe('1-a');
      expect(fn).toHaveBeenCalledTimes(1);

      expect(memo(2, 'a')).toBe('2-a');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('uses a custom key function when provided', () => {
      const fn = vi.fn((x: { id: number }) => x.id * 2);
      const memo = Cache.memoize(fn, { keyFn: (x) => String(x.id) });

      expect(memo({ id: 1 })).toBe(2);
      expect(memo({ id: 1, extra: true })).toBe(2);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('respects ttl', () => {
      vi.useFakeTimers();
      const fn = vi.fn(() => 'v');
      const memo = Cache.memoize(fn, { ttl: 100 });

      expect(memo()).toBe('v');
      expect(memo()).toBe('v');
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(memo()).toBe('v');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('clear invalidates the entire memoized cache', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memo = Cache.memoize(fn);

      memo(1);
      memo.clear();
      memo(1);

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
