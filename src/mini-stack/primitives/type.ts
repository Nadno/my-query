/**
 * Type — Deep typeof, type guards, existence checks e asserções
 */

// ========== TIPOS EXPORTADOS ==========

export type TypeTagMap = {
  null:      null;
  undefined: undefined;
  string:    string;
  number:    number;
  boolean:   boolean;
  bigint:    bigint;
  symbol:    symbol;
  function:  (...args: unknown[]) => unknown;
  array:     unknown[];
  date:      Date;
  regexp:    RegExp;
  map:       Map<unknown, unknown>;
  set:       Set<unknown>;
  object:    Record<string, unknown>;
};

export type TypeTag = keyof TypeTagMap;

// ========== HELPER INTERNO ==========

const _tag = (v: unknown): string =>
  Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

// ========== GUARDS (módulo-nível, reutilizados internamente) ==========

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v);
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function isFunction(v: unknown): v is (...args: unknown[]) => unknown {
  return typeof v === 'function';
}

function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function isDate(v: unknown): v is Date {
  return v instanceof Date && !Number.isNaN(v.getTime());
}

function isObject(v: unknown): v is Record<string, unknown> {
  return _tag(v) === 'object';
}

// ========== ASSERT (função + métodos) ==========

const _assert = Object.assign(
  (condition: boolean, msg?: string): asserts condition => {
    if (!condition) throw new Error(msg ?? 'Assertion failed');
  },
  {
    isString(v: unknown, msg?: string): asserts v is string {
      if (!isString(v)) throw new Error(msg ?? `Expected string, got ${_tag(v)}`);
    },
    isNumber(v: unknown, msg?: string): asserts v is number {
      if (!isNumber(v)) throw new Error(msg ?? `Expected number, got ${_tag(v)}`);
    },
    isBoolean(v: unknown, msg?: string): asserts v is boolean {
      if (!isBoolean(v)) throw new Error(msg ?? `Expected boolean, got ${_tag(v)}`);
    },
    isFunction(v: unknown, msg?: string): asserts v is (...args: unknown[]) => unknown {
      if (!isFunction(v)) throw new Error(msg ?? `Expected function, got ${_tag(v)}`);
    },
    isArray(v: unknown, msg?: string): asserts v is unknown[] {
      if (!isArray(v)) throw new Error(msg ?? `Expected array, got ${_tag(v)}`);
    },
    isDate(v: unknown, msg?: string): asserts v is Date {
      if (!isDate(v)) throw new Error(msg ?? `Expected date, got ${_tag(v)}`);
    },
    isObject(v: unknown, msg?: string): asserts v is Record<string, unknown> {
      if (!isObject(v)) throw new Error(msg ?? `Expected object, got ${_tag(v)}`);
    },
  },
);

// ========== CLASSE ==========

export class Type {
  private constructor() {}

  // --- Deep typeof ---

  static of(v: unknown): TypeTag {
    return _tag(v) as TypeTag;
  }

  // --- Guards básicos ---

  static isString = isString;
  static isNumber = isNumber;
  static isBoolean = isBoolean;
  static isFunction = isFunction;

  // --- Guards de objetos ---

  static isArray = isArray;
  static isDate = isDate;
  static isMap(v: unknown): v is Map<unknown, unknown> {
    return v instanceof Map;
  }
  static isSet(v: unknown): v is Set<unknown> {
    return v instanceof Set;
  }
  static isRegExp(v: unknown): v is RegExp {
    return v instanceof RegExp;
  }
  static isObject = isObject;

  // --- Null / Undefined ---

  static isNullOrUndefined(v: unknown): v is null | undefined {
    return v === null || v === undefined;
  }

  // --- Existência ---

  static isEmpty(v: unknown): boolean {
    if (v === null || v === undefined) return true;
    if (typeof v === 'string') return v.length === 0;
    if (Array.isArray(v)) return v.length === 0;
    if (v instanceof Map || v instanceof Set) return v.size === 0;
    if (_tag(v) === 'object') return Object.keys(v as Record<string, unknown>).length === 0;
    return false;
  }

  static hasValue<T>(v: T | null | undefined): v is NonNullable<T> {
    return !Type.isEmpty(v);
  }

  // --- Number type guards ---

  static isInteger(v: unknown): v is number {
    return Number.isInteger(v);
  }

  static isFloat(v: unknown): v is number {
    return typeof v === 'number' && Number.isFinite(v) && !Number.isInteger(v);
  }

  static isFinite(v: unknown): v is number {
    return Number.isFinite(v);
  }

  // --- Asserções ---

  static readonly assert = _assert;
}
