const tagOf = (v: unknown): string =>
  Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

export class Obj {
  private constructor() {}

  static identity(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) {
      return `[${value.map((item) => Obj.identity(item)).join(',')}]`;
    }

    const tag = tagOf(value);
    if (tag === 'map') {
      const map = value as Map<unknown, unknown>;
      const entries = [...map.entries()].map(
        ([k, v]) => `${Obj.identity(k)}:${Obj.identity(v)}`,
      );
      return `#Map:{${entries.join(',')}}`;
    }
    if (tag === 'set') {
      const set = value as Set<unknown>;
      const items = [...set.values()].map((v) => Obj.identity(v));
      return `#Set:[${items.join(',')}]`;
    }
    if (tag === 'regexp') {
      return `#RegExp:${(value as RegExp).toString()}`;
    }
    if (tag !== 'object') {
      const encoded = JSON.stringify(value);
      return encoded === undefined ? '' : encoded;
    }

    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${Obj.identity(record[key])}`).join(',')}}`;
  }

  static isEmpty(value: object | null | undefined): boolean {
    return value == null || Object.keys(value).length === 0;
  }

  static omit<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[],
  ): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  static pick<T extends object, K extends keyof T>(
    obj: T,
    keys: readonly K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      result[key] = obj[key];
    }
    return result;
  }

  static merge<T extends object>(
    target: T | null | undefined,
    source: Partial<T> | null | undefined,
  ): T {
    if (target == null) return { ...(source ?? {}) } as T;
    if (source == null) return target;

    const result = { ...target } as Record<string, unknown>;

    for (const key of Object.keys(source)) {
      const srcVal = (source as Record<string, unknown>)[key];
      const tgtVal = result[key];

      if (tagOf(srcVal) === 'object' && tagOf(tgtVal) === 'object') {
        result[key] = Obj.merge(
          tgtVal as object,
          srcVal as object,
        );
      } else {
        result[key] = srcVal;
      }
    }

    return result as T;
  }

  static omitBy<T extends object>(
    obj: T,
    predicate: (value: T[keyof T], key: keyof T) => boolean,
  ): Partial<T> {
    const result = {} as Partial<T>;
    for (const key of Object.keys(obj) as Array<keyof T>) {
      const value = obj[key];
      if (!predicate(value, key)) {
        result[key] = value;
      }
    }
    return result;
  }

  static isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (Number.isNaN(a) && Number.isNaN(b)) return true;

    const tagA = tagOf(a);
    const tagB = tagOf(b);
    if (tagA !== tagB) return false;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (a instanceof RegExp && b instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !Obj.isEqual(value, b.get(key))) return false;
      }
      return true;
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (const value of a) {
        let found = false;
        for (const other of b) {
          if (Obj.isEqual(value, other)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!Obj.isEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (tagA === 'object' && a != null && b != null) {
      const keysA = Object.keys(a as object);
      const keysB = Object.keys(b as object);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!Object.hasOwn(b as object, key)) return false;
        if (!Obj.isEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
      }
      return true;
    }

    return false;
  }

  static clone<T>(value: T): T {
    if (value == null) return value;

    const tag = tagOf(value);

    if (tag === 'date') {
      const date = value as unknown as Date;
      return new Date(date.getTime()) as unknown as T;
    }

    if (tag === 'regexp') {
      const r = value as unknown as RegExp;
      return new RegExp(r.source, r.flags) as unknown as T;
    }

    if (tag === 'map') {
      const map = value as unknown as Map<unknown, unknown>;
      const cloned = new Map<unknown, unknown>();
      for (const [k, v] of map) {
        cloned.set(Obj.clone(k), Obj.clone(v));
      }
      return cloned as unknown as T;
    }

    if (tag === 'set') {
      const set = value as unknown as Set<unknown>;
      const cloned = new Set<unknown>();
      for (const v of set) {
        cloned.add(Obj.clone(v));
      }
      return cloned as unknown as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => Obj.clone(item)) as unknown as T;
    }

    if (tag === 'object') {
      const record = value as Record<string, unknown>;
      const cloned: Record<string, unknown> = {};
      for (const key of Object.keys(record)) {
        cloned[key] = Obj.clone(record[key]);
      }
      return cloned as T;
    }

    return value;
  }
}
