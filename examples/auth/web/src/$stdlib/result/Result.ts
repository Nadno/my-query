export type Ok<T> = [value: T, error: null];
export type Fail<E> = [value: null, error: E];
export type AnyResult<T, E = Error> = Ok<T> | Fail<E>;

function toError(e: unknown): Error {
  if (e instanceof Error) return e;
  return new Error(String(e));
}

export class Result {
  private constructor() {}

  static ok<T>(value: T): Ok<T> {
    return [value, null];
  }

  static fail<E = Error>(error: E): Fail<E> {
    return [null, error];
  }

  static try<T>(fn: () => T): AnyResult<T> {
    try {
      return Result.ok(fn());
    } catch (e) {
      return Result.fail(toError(e));
    }
  }

  static async tryAsync<T>(promise: Promise<T>): Promise<AnyResult<T>> {
    try {
      return Result.ok(await promise);
    } catch (e) {
      return Result.fail(toError(e));
    }
  }

  static unwrap<T>(result: AnyResult<T>): T {
    const [value, error] = result;
    if (error !== null) throw error;
    return value as T;
  }

  static or<T>(result: AnyResult<T>, fallback: T): T {
    const [value, error] = result;
    return error !== null ? fallback : (value as T);
  }
}
