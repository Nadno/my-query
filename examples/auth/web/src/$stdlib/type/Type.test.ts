import { describe, expect, it } from 'vitest';

import { Type } from './Type';

describe('Type', () => {
  it('of distinguishes null from object', () => {
    expect(Type.of(null)).toBe('null');
    expect(Type.of({})).toBe('object');
    expect(Type.of([])).toBe('array');
  });

  it('constants are the same literals as of', () => {
    expect(Type.NULL).toBe('null');
    expect(Type.STRING).toBe('string');
    expect(Type.MAP).toBe('map');
    expect(Type.ARRAY).toBe('array');
    expect(Type.OBJECT).toBe('object');
    expect(Type.of(null)).toBe(Type.NULL);
    expect(Type.of('a')).toBe(Type.STRING);
    expect(Type.of(new Map())).toBe(Type.MAP);
  });

  it('is matches of without comparing tags by hand', () => {
    expect(Type.is(null, 'null')).toBe(true);
    expect(Type.is('a', 'string')).toBe(true);
    expect(Type.is(new Map(), 'map')).toBe(true);
    expect(Type.is([], 'object')).toBe(false);
    expect(Type.is('a', Type.STRING)).toBe(true);
    expect(Type.is(new Map(), Type.MAP)).toBe(true);
    expect(Type.is([], Type.OBJECT)).toBe(false);
  });

  it('isOneOf matches any listed tag and does not throw', () => {
    expect(Type.isOneOf('a', [Type.STRING, Type.NUMBER])).toBe(true);
    expect(Type.isOneOf(1, [Type.STRING, Type.NUMBER])).toBe(true);
    expect(Type.isOneOf(true, [Type.STRING, Type.NUMBER])).toBe(false);
    expect(Type.isOneOf('a', [])).toBe(false);
  });

  it('isPlainObject is a plain record, not array, null, or Date', () => {
    expect(Type.isPlainObject({})).toBe(true);
    expect(Type.isPlainObject([])).toBe(false);
    expect(Type.isPlainObject(null)).toBe(false);
    expect(Type.isPlainObject(new Date())).toBe(false);
    expect(Type.isObject({})).toBe(true);
  });

  it('isNumber rejects NaN; is(tag) follows the typeof tag', () => {
    expect(Type.isNumber(NaN)).toBe(false);
    expect(Type.is(NaN, 'number')).toBe(true);
    expect(Type.is(NaN, Type.NUMBER)).toBe(true);
    expect(Type.isNumber(1)).toBe(true);
  });

  it('assert throws when the precondition fails', () => {
    expect(() => Type.assert.string(1)).toThrow(/Expected string/);
    expect(() => Type.assert(false, 'nope')).toThrow('nope');
  });
});
