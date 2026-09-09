const TAG = {
  NULL: 'null',
  UNDEFINED: 'undefined',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  BIGINT: 'bigint',
  SYMBOL: 'symbol',
  FUNCTION: 'function',
  ARRAY: 'array',
  DATE: 'date',
  REGEXP: 'regexp',
  MAP: 'map',
  SET: 'set',
  OBJECT: 'object',
} as const;

export type TypeTag = (typeof TAG)[keyof typeof TAG];

export type TypeTagMap = {
  [TAG.NULL]: null;
  [TAG.UNDEFINED]: undefined;
  [TAG.STRING]: string;
  [TAG.NUMBER]: number;
  [TAG.BOOLEAN]: boolean;
  [TAG.BIGINT]: bigint;
  [TAG.SYMBOL]: symbol;
  [TAG.FUNCTION]: (...args: unknown[]) => unknown;
  [TAG.ARRAY]: unknown[];
  [TAG.DATE]: Date;
  [TAG.REGEXP]: RegExp;
  [TAG.MAP]: Map<unknown, unknown>;
  [TAG.SET]: Set<unknown>;
  [TAG.OBJECT]: Record<string, unknown>;
};

const tagOf = (v: unknown): string =>
  Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isDate(v: unknown): v is Date {
  return v instanceof Date && !Number.isNaN(v.getTime());
}

/** Plain object (record): not null, array, Date, Map, … */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return tagOf(v) === TAG.OBJECT;
}

const isObject = isPlainObject;

const assert = Object.assign(
  (condition: boolean, msg?: string): asserts condition => {
    if (!condition) throw new TypeError(msg ?? 'Assertion failed');
  },
  {
    string(v: unknown, msg?: string): asserts v is string {
      if (!isString(v)) throw new TypeError(msg ?? `Expected string, got ${tagOf(v)}`);
    },
    number(v: unknown, msg?: string): asserts v is number {
      if (!isNumber(v)) throw new TypeError(msg ?? `Expected number, got ${tagOf(v)}`);
    },
    boolean(v: unknown, msg?: string): asserts v is boolean {
      if (!isBoolean(v))
        throw new TypeError(msg ?? `Expected boolean, got ${tagOf(v)}`);
    },
    array(v: unknown, msg?: string): asserts v is unknown[] {
      if (!isArray(v)) throw new TypeError(msg ?? `Expected array, got ${tagOf(v)}`);
    },
    date(v: unknown, msg?: string): asserts v is Date {
      if (!isDate(v)) throw new TypeError(msg ?? `Expected date, got ${tagOf(v)}`);
    },
    object(v: unknown, msg?: string): asserts v is Record<string, unknown> {
      if (!isPlainObject(v))
        throw new TypeError(msg ?? `Expected object, got ${tagOf(v)}`);
    },
  },
);

export class Type {
  private constructor() {}

  static readonly NULL = TAG.NULL;
  static readonly UNDEFINED = TAG.UNDEFINED;
  static readonly STRING = TAG.STRING;
  static readonly NUMBER = TAG.NUMBER;
  static readonly BOOLEAN = TAG.BOOLEAN;
  static readonly BIGINT = TAG.BIGINT;
  static readonly SYMBOL = TAG.SYMBOL;
  static readonly FUNCTION = TAG.FUNCTION;
  static readonly ARRAY = TAG.ARRAY;
  static readonly DATE = TAG.DATE;
  static readonly REGEXP = TAG.REGEXP;
  static readonly MAP = TAG.MAP;
  static readonly SET = TAG.SET;
  static readonly OBJECT = TAG.OBJECT;

  static of(v: unknown): TypeTag {
    return tagOf(v) as TypeTag;
  }

  static is<K extends TypeTag>(v: unknown, tag: K): v is TypeTagMap[K] {
    return Type.of(v) === tag;
  }

  static isOneOf<const T extends readonly TypeTag[]>(
    v: unknown,
    tags: T,
  ): v is TypeTagMap[T[number]] {
    return tags.some((t) => Type.of(v) === t);
  }

  static isString = isString;
  static isNumber = isNumber;
  static isBoolean = isBoolean;
  static isArray = isArray;
  static isDate = isDate;
  static isPlainObject = isPlainObject;
  static isObject = isObject;

  static isNullOrUndefined(v: unknown): v is null | undefined {
    return v === null || v === undefined;
  }

  static readonly assert = assert;
}
