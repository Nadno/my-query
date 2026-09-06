import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Type } from '@/mini-stack/primitives/type';

// ========== TYPE.OF ==========

describe('Type.of', () => {
  it('null', () => assert.equal(Type.of(null), 'null'));
  it('undefined', () => assert.equal(Type.of(undefined), 'undefined'));
  it('string', () => assert.equal(Type.of('hello'), 'string'));
  it('number', () => assert.equal(Type.of(42), 'number'));
  it('boolean', () => assert.equal(Type.of(true), 'boolean'));
  it('bigint', () => assert.equal(Type.of(1n), 'bigint'));
  it('symbol', () => assert.equal(Type.of(Symbol()), 'symbol'));
  it('function', () => assert.equal(Type.of(() => {}), 'function'));
  it('array', () => assert.equal(Type.of([1, 2]), 'array'));
  it('date', () => assert.equal(Type.of(new Date()), 'date'));
  it('regexp', () => assert.equal(Type.of(/re/), 'regexp'));
  it('map', () => assert.equal(Type.of(new Map()), 'map'));
  it('set', () => assert.equal(Type.of(new Set()), 'set'));
  it('object', () => assert.equal(Type.of({}), 'object'));
  it('NaN is still "number" tag', () => assert.equal(Type.of(NaN), 'number'));
});

// ========== GUARDS BÁSICOS ==========

describe('Type.isString', () => {
  it('true for string', () => assert.equal(Type.isString('x'), true));
  it('true for empty string', () => assert.equal(Type.isString(''), true));
  it('false for number', () => assert.equal(Type.isString(1), false));
  it('false for null', () => assert.equal(Type.isString(null), false));
  it('false for undefined', () => assert.equal(Type.isString(undefined), false));
});

describe('Type.isNumber', () => {
  it('true for integer', () => assert.equal(Type.isNumber(42), true));
  it('true for float', () => assert.equal(Type.isNumber(3.14), true));
  it('true for zero', () => assert.equal(Type.isNumber(0), true));
  it('true for negative', () => assert.equal(Type.isNumber(-5), true));
  it('false for NaN', () => assert.equal(Type.isNumber(NaN), false));
  it('false for Infinity', () => assert.equal(Type.isNumber(Infinity), false));
  it('false for -Infinity', () => assert.equal(Type.isNumber(-Infinity), false));
  it('false for string', () => assert.equal(Type.isNumber('42'), false));
  it('false for null', () => assert.equal(Type.isNumber(null), false));
});

describe('Type.isBoolean', () => {
  it('true for true', () => assert.equal(Type.isBoolean(true), true));
  it('true for false', () => assert.equal(Type.isBoolean(false), true));
  it('false for 1', () => assert.equal(Type.isBoolean(1), false));
  it('false for null', () => assert.equal(Type.isBoolean(null), false));
  it('false for "true"', () => assert.equal(Type.isBoolean('true'), false));
});

describe('Type.isFunction', () => {
  it('true for arrow fn', () => assert.equal(Type.isFunction(() => {}), true));
  it('true for function declaration', () => assert.equal(Type.isFunction(function() {}), true));
  it('true for class', () => assert.equal(Type.isFunction(class {}), true));
  it('false for object', () => assert.equal(Type.isFunction({}), false));
  it('false for null', () => assert.equal(Type.isFunction(null), false));
});

// ========== GUARDS DE OBJETOS ==========

describe('Type.isArray', () => {
  it('true for []', () => assert.equal(Type.isArray([]), true));
  it('true for [1, 2]', () => assert.equal(Type.isArray([1, 2]), true));
  it('false for {}', () => assert.equal(Type.isArray({}), false));
  it('false for "str"', () => assert.equal(Type.isArray('str'), false));
  it('false for null', () => assert.equal(Type.isArray(null), false));
});

describe('Type.isDate', () => {
  it('true for valid Date', () => assert.equal(Type.isDate(new Date()), true));
  it('true for specific date', () => assert.equal(Type.isDate(new Date('2024-01-01')), true));
  it('false for invalid Date', () => assert.equal(Type.isDate(new Date('invalid')), false));
  it('false for string', () => assert.equal(Type.isDate('2024-01-01'), false));
  it('false for null', () => assert.equal(Type.isDate(null), false));
});

describe('Type.isMap', () => {
  it('true for Map', () => assert.equal(Type.isMap(new Map()), true));
  it('false for {}', () => assert.equal(Type.isMap({}), false));
  it('false for Set', () => assert.equal(Type.isMap(new Set()), false));
  it('false for null', () => assert.equal(Type.isMap(null), false));
});

describe('Type.isSet', () => {
  it('true for Set', () => assert.equal(Type.isSet(new Set()), true));
  it('false for Map', () => assert.equal(Type.isSet(new Map()), false));
  it('false for []', () => assert.equal(Type.isSet([]), false));
});

describe('Type.isRegExp', () => {
  it('true for /re/', () => assert.equal(Type.isRegExp(/re/), true));
  it('true for new RegExp', () => assert.equal(Type.isRegExp(new RegExp('x')), true));
  it('false for string', () => assert.equal(Type.isRegExp('re'), false));
  it('false for null', () => assert.equal(Type.isRegExp(null), false));
});

describe('Type.isObject', () => {
  it('true for {}', () => assert.equal(Type.isObject({}), true));
  it('true for { a: 1 }', () => assert.equal(Type.isObject({ a: 1 }), true));
  it('false for []', () => assert.equal(Type.isObject([]), false));
  it('false for Date', () => assert.equal(Type.isObject(new Date()), false));
  it('false for Map', () => assert.equal(Type.isObject(new Map()), false));
  it('false for Set', () => assert.equal(Type.isObject(new Set()), false));
  it('false for null', () => assert.equal(Type.isObject(null), false));
  it('false for null (typeof object)', () => assert.equal(Type.isObject(null), false));
});

// ========== EXISTÊNCIA ==========

describe('Type.isEmpty', () => {
  it('null', () => assert.equal(Type.isEmpty(null), true));
  it('undefined', () => assert.equal(Type.isEmpty(undefined), true));
  it('empty string', () => assert.equal(Type.isEmpty(''), true));
  it('empty array', () => assert.equal(Type.isEmpty([]), true));
  it('empty object', () => assert.equal(Type.isEmpty({}), true));
  it('empty Map', () => assert.equal(Type.isEmpty(new Map()), true));
  it('empty Set', () => assert.equal(Type.isEmpty(new Set()), true));

  it('non-empty string', () => assert.equal(Type.isEmpty('a'), false));
  it('non-empty array', () => assert.equal(Type.isEmpty([1]), false));
  it('non-empty object', () => assert.equal(Type.isEmpty({ a: 1 }), false));
  it('non-empty Map', () => assert.equal(Type.isEmpty(new Map([['k', 'v']])), false));
  it('non-empty Set', () => assert.equal(Type.isEmpty(new Set([1])), false));
  it('zero is not empty', () => assert.equal(Type.isEmpty(0), false));
  it('false is not empty', () => assert.equal(Type.isEmpty(false), false));
});

describe('Type.hasValue', () => {
  it('false for null', () => assert.equal(Type.hasValue(null), false));
  it('false for undefined', () => assert.equal(Type.hasValue(undefined), false));
  it('false for empty string', () => assert.equal(Type.hasValue(''), false));
  it('false for empty array', () => assert.equal(Type.hasValue([]), false));
  it('true for non-null string', () => assert.equal(Type.hasValue('hello'), true));
  it('true for 0', () => assert.equal(Type.hasValue(0), true));
  it('true for object', () => assert.equal(Type.hasValue({ a: 1 }), true));
});

// ========== NUMBER TYPE GUARDS ==========

describe('Type.isInteger', () => {
  it('true for 1', () => assert.equal(Type.isInteger(1), true));
  it('true for 0', () => assert.equal(Type.isInteger(0), true));
  it('true for -100', () => assert.equal(Type.isInteger(-100), true));
  it('false for 1.5', () => assert.equal(Type.isInteger(1.5), false));
  it('false for NaN', () => assert.equal(Type.isInteger(NaN), false));
  it('false for Infinity', () => assert.equal(Type.isInteger(Infinity), false));
  it('false for string', () => assert.equal(Type.isInteger('1' as unknown as number), false));
});

describe('Type.isFloat', () => {
  it('true for 1.5', () => assert.equal(Type.isFloat(1.5), true));
  it('true for -0.1', () => assert.equal(Type.isFloat(-0.1), true));
  it('false for 1', () => assert.equal(Type.isFloat(1), false));
  it('false for 0', () => assert.equal(Type.isFloat(0), false));
  it('false for NaN', () => assert.equal(Type.isFloat(NaN), false));
  it('false for Infinity', () => assert.equal(Type.isFloat(Infinity), false));
});

describe('Type.isFinite', () => {
  it('true for 1', () => assert.equal(Type.isFinite(1), true));
  it('true for 1.5', () => assert.equal(Type.isFinite(1.5), true));
  it('true for 0', () => assert.equal(Type.isFinite(0), true));
  it('false for Infinity', () => assert.equal(Type.isFinite(Infinity), false));
  it('false for -Infinity', () => assert.equal(Type.isFinite(-Infinity), false));
  it('false for NaN', () => assert.equal(Type.isFinite(NaN), false));
  it('false for string', () => assert.equal(Type.isFinite('1' as unknown as number), false));
});

// ========== ASSERÇÕES ==========

describe('Type.assert', () => {
  it('does not throw when condition is true', () => {
    assert.doesNotThrow(() => Type.assert(true));
  });

  it('throws when condition is false', () => {
    assert.throws(() => Type.assert(false), /Assertion failed/);
  });

  it('throws with custom message', () => {
    assert.throws(() => Type.assert(false, 'custom error'), /custom error/);
  });
});

describe('Type.assert.isString', () => {
  it('does not throw for string', () => {
    assert.doesNotThrow(() => Type.assert.isString('hello'));
  });

  it('throws for number', () => {
    assert.throws(() => Type.assert.isString(42 as unknown as string), /Expected string/);
  });

  it('throws with custom message', () => {
    assert.throws(() => Type.assert.isString(null as unknown as string, 'need string'), /need string/);
  });
});

describe('Type.assert.isNumber', () => {
  it('does not throw for valid number', () => {
    assert.doesNotThrow(() => Type.assert.isNumber(42));
  });

  it('throws for NaN', () => {
    assert.throws(() => Type.assert.isNumber(NaN), /Expected number/);
  });

  it('throws for string', () => {
    assert.throws(() => Type.assert.isNumber('42' as unknown as number), /Expected number/);
  });
});

describe('Type.assert.isArray', () => {
  it('does not throw for array', () => {
    assert.doesNotThrow(() => Type.assert.isArray([]));
  });

  it('throws for object', () => {
    assert.throws(() => Type.assert.isArray({} as unknown as unknown[]), /Expected array/);
  });
});

describe('Type.assert.isDate', () => {
  it('does not throw for valid Date', () => {
    assert.doesNotThrow(() => Type.assert.isDate(new Date()));
  });

  it('throws for invalid Date', () => {
    assert.throws(() => Type.assert.isDate(new Date('invalid')), /Expected date/);
  });

  it('throws for string', () => {
    assert.throws(() => Type.assert.isDate('2024-01-01' as unknown as Date), /Expected date/);
  });
});

describe('Type.assert.isObject', () => {
  it('does not throw for plain object', () => {
    assert.doesNotThrow(() => Type.assert.isObject({ a: 1 }));
  });

  it('throws for array', () => {
    assert.throws(() => Type.assert.isObject([] as unknown as Record<string, unknown>), /Expected object/);
  });

  it('throws for Date', () => {
    assert.throws(() => Type.assert.isObject(new Date() as unknown as Record<string, unknown>), /Expected object/);
  });
});
