type LazyResult<R, T> = R | ((value: T) => R);
type LazyThunk<R> = R | (() => R);

function resolveLazy<R, T>(result: LazyResult<R, T>, value: T): R {
  return typeof result === 'function'
    ? (result as (value: T) => R)(value)
    : result;
}

function resolveThunk<R>(result: LazyThunk<R>): R {
  return typeof result === 'function' ? (result as () => R)() : result;
}

export class Pattern {
  static match<T, R>(
    value: T,
    cases: Record<string | number, LazyResult<R, T>> & { _?: LazyResult<R, T> },
  ): R | undefined {
    const key = String(value);

    if (Object.hasOwn(cases, key)) {
      return resolveLazy(cases[key as keyof typeof cases] as LazyResult<R, T>, value);
    }

    if (Object.hasOwn(cases, '_') && cases._ != null) {
      return resolveLazy(cases._, value);
    }

    return undefined;
  }

  static when<T>(value: T): PatternWhen<T>;
  static when<R, D = never>(
    branches: ReadonlyArray<{ when: () => boolean; then: LazyThunk<R> }>,
    defaultValue?: D,
  ): R | D;
  static when(
    valueOrBranches: unknown,
    defaultValue?: unknown,
  ): unknown {
    if (Array.isArray(valueOrBranches)) {
      for (const branch of valueOrBranches) {
        if (branch.when()) {
          return resolveThunk(branch.then);
        }
      }

      return defaultValue;
    }

    return new PatternWhen(valueOrBranches);
  }
}

class PatternWhen<T> {
  private matched: LazyResult<unknown, T>[] = [];
  private readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  is<R>(predicate: (value: T) => boolean, result: LazyResult<R, T>): this {
    if (this.matched.length === 0 && predicate(this.value)) {
      this.matched.push(result);
    }

    return this;
  }

  else<R>(result: LazyResult<R, T>): R {
    return this.matched.length > 0
      ? (resolveLazy(this.matched[0] as LazyResult<R, T>, this.value) as R)
      : resolveLazy(result, this.value);
  }

  or = this.else.bind(this);
  default = this.else.bind(this);
}
