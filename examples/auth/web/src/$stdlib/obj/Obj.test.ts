import { describe, expect, it } from 'vitest';

import { Obj } from './Obj';

describe('Obj', () => {
  it('identity is stable when nested keys are reordered', () => {
    const a = Obj.identity({ z: 1, a: { b: 2, a: 1 } });
    const b = Obj.identity({ a: { a: 1, b: 2 }, z: 1 });
    expect(a).toBe(b);
  });

  it('identity serializes listing-style params', () => {
    expect(Obj.identity(['user', 1, { withCourses: true }])).toBe(
      Obj.identity(['user', 1, { withCourses: true }]),
    );
    expect(Obj.identity(null)).toBe('');
    expect(Obj.identity(undefined)).toBe('');
  });

  it('identity distinguishes Map, Set and RegExp by content', () => {
    expect(Obj.identity([new Map([[1, 'a']])])).not.toBe(
      Obj.identity([new Set([1])]),
    );
    expect(Obj.identity(new Map([[1, 'a']]))).toBe(
      Obj.identity(new Map([[1, 'a']])),
    );
    expect(Obj.identity(new Set([1, 2]))).toBe(Obj.identity(new Set([1, 2])));
    expect(Obj.identity(/foo/g)).toBe(Obj.identity(/foo/g));
    expect(Obj.identity(/foo/g)).not.toBe(Obj.identity(/foo/i));
  });

  it('omit and pick copy without mutating the original', () => {
    const user = { id: 1, name: 'Ada', password: 'x' };
    expect(Obj.omit(user, ['password'])).toEqual({ id: 1, name: 'Ada' });
    expect(Obj.pick(user, ['name'])).toEqual({ name: 'Ada' });
    expect(user).toEqual({ id: 1, name: 'Ada', password: 'x' });
  });

  it('merge is deep and replaces arrays', () => {
    const merged = Obj.merge(
      { theme: 'dark', user: { name: 'Guest' }, items: [1, 2] },
      { theme: 'light', user: { name: 'Ada' }, items: [3] },
    );
    expect(merged).toEqual({
      theme: 'light',
      user: { name: 'Ada' },
      items: [3],
    });
    expect(Obj.isEmpty({})).toBe(true);
    expect(Obj.isEmpty({ a: 1 })).toBe(false);
  });

  it('omitBy drops keys that match the predicate', () => {
    const input = { a: 1, b: null, c: 3, d: undefined };
    const result = Obj.omitBy(input, (value) => value == null);
    expect(result).toEqual({ a: 1, c: 3 });
    expect(input).toEqual({ a: 1, b: null, c: 3, d: undefined });
  });

  it('isEqual compares primitives, dates, regexps, maps, sets, arrays and objects deeply', () => {
    expect(Obj.isEqual(1, 1)).toBe(true);
    expect(Obj.isEqual(1, 2)).toBe(false);
    expect(Obj.isEqual(NaN, NaN)).toBe(true);
    expect(Obj.isEqual(0, -0)).toBe(true);

    expect(Obj.isEqual(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(true);
    expect(Obj.isEqual(new Date('2024-01-01'), new Date('2024-01-02'))).toBe(false);

    expect(Obj.isEqual(/foo/g, /foo/g)).toBe(true);
    expect(Obj.isEqual(/foo/g, /foo/i)).toBe(false);

    expect(Obj.isEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(true);
    expect(Obj.isEqual(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(false);

    expect(Obj.isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(Obj.isEqual(new Set([1]), new Set([1, 2]))).toBe(false);

    expect(Obj.isEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(Obj.isEqual([1, { a: 2 }], [1, { a: 3 }])).toBe(false);

    expect(Obj.isEqual({ a: { b: [1, 2] } }, { a: { b: [1, 2] } })).toBe(true);
    expect(Obj.isEqual({ a: { b: [1, 2] } }, { a: { b: [2, 1] } })).toBe(false);
    expect(Obj.isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('clone creates a deep copy of objects, arrays, dates, maps, sets and regexps', () => {
    const original = {
      date: new Date('2024-01-01'),
      regexp: /foo/g,
      map: new Map([['a', [1, 2]]]),
      set: new Set([{ x: 1 }]),
      nested: { items: [{ y: 2 }] },
    };
    const copy = Obj.clone(original);

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.date).not.toBe(original.date);
    expect(copy.regexp).not.toBe(original.regexp);
    expect(copy.map).not.toBe(original.map);
    expect(copy.map.get('a')).not.toBe(original.map.get('a'));
    expect(copy.set).not.toBe(original.set);
    expect([...copy.set][0]).not.toBe([...original.set][0]);
    expect(copy.nested).not.toBe(original.nested);
    expect(copy.nested.items[0]).not.toBe(original.nested.items[0]);
  });

  it('clone returns primitives and null/undefined as-is', () => {
    expect(Obj.clone(null)).toBe(null);
    expect(Obj.clone(undefined)).toBe(undefined);
    expect(Obj.clone(42)).toBe(42);
    expect(Obj.clone('hello')).toBe('hello');
    expect(Obj.clone(true)).toBe(true);
  });
});
