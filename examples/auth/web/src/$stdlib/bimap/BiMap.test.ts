import { describe, expect, it } from 'vitest';

import { BiMap } from './BiMap';

const STATUS = BiMap.rows({
  ACTIVE: { code: 'ACT', numericId: 1 },
  INACTIVE: { code: 'INA', numericId: 2 },
});

describe('BiMap', () => {
  it('get returns the row for a domain key', () => {
    expect(STATUS.get('ACTIVE')).toEqual({ code: 'ACT', numericId: 1 });
    expect(STATUS.get('INACTIVE')).toEqual({ code: 'INA', numericId: 2 });
  });

  it('keyBy resolves a domain key from a column value', () => {
    expect(STATUS.keyBy('code', 'ACT')).toBe('ACTIVE');
    expect(STATUS.keyBy('numericId', 2)).toBe('INACTIVE');
    expect(STATUS.keyBy('code', 'MISSING')).toBeUndefined();
    expect(STATUS.keyBy('numericId', 99)).toBeUndefined();
  });

  it('keys and column expose indexed values', () => {
    expect(STATUS.keys).toEqual(['ACTIVE', 'INACTIVE']);
    expect(STATUS.column('code')).toEqual(['ACT', 'INA']);
    expect(STATUS.column('numericId')).toEqual([1, 2]);
  });

  it('has narrows unknown keys', () => {
    const key: unknown = 'ACTIVE';
    expect(STATUS.has(key)).toBe(true);
    if (STATUS.has(key)) {
      expect(STATUS.get(key).code).toBe('ACT');
    }
    expect(STATUS.has('UNKNOWN')).toBe(false);
    expect(STATUS.has(1)).toBe(false);
  });

  it('has ignores inherited Object.prototype keys', () => {
    expect(STATUS.has('toString')).toBe(false);
    expect(STATUS.has('constructor')).toBe(false);
    expect(STATUS.has('__proto__')).toBe(false);
  });

  it('rows throws when an indexed column has duplicate values', () => {
    expect(() =>
      BiMap.rows({
        A: { code: 'X', numericId: 1 },
        B: { code: 'X', numericId: 2 },
      }),
    ).toThrow(/duplicate value "X" in column "code"/);

    expect(() =>
      BiMap.rows({
        A: { code: 'A', numericId: 1 },
        B: { code: 'B', numericId: 1 },
      }),
    ).toThrow(/duplicate value 1 in column "numericId"/);
  });
});
