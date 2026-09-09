import { describe, expect, it } from 'vitest';

import { Result } from './Result';

describe('Result', () => {
  it('ok and fail are Go-style tuples', () => {
    expect(Result.ok('hello')).toEqual(['hello', null]);
    const err = new Error('nope');
    expect(Result.fail(err)).toEqual([null, err]);
  });

  it('try returns ok or fail from thrown errors', () => {
    expect(Result.try(() => 2 + 2)).toEqual([4, null]);
    const [value, error] = Result.try(() => {
      throw new Error('boom');
    });
    expect(value).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('boom');
  });

  it('try wraps a non-Error throw in Error', () => {
    const [, error] = Result.try(() => {
      throw 'nope';
    });
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('nope');
  });

  it('tryAsync awaits then wraps like try', async () => {
    await expect(Result.tryAsync(Promise.resolve(1))).resolves.toEqual([
      1,
      null,
    ]);
    const [, error] = await Result.tryAsync(Promise.reject(new Error('no')));
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('no');
  });

  it('unwrap returns the value or throws the error', () => {
    expect(Result.unwrap(Result.ok(9))).toBe(9);
    expect(() => Result.unwrap(Result.fail(new Error('x')))).toThrow('x');
  });

  it('or returns the value or the fallback', () => {
    expect(Result.or(Result.ok('a'), 'b')).toBe('a');
    expect(Result.or(Result.fail(new Error('x')), 'b')).toBe('b');
  });
});
