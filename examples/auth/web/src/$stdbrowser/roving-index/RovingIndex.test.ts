import { describe, expect, it } from 'vitest';

import { RovingIndex } from './RovingIndex';

describe('RovingIndex.next', () => {
  it('steps forward and backward on one axis', () => {
    expect(
      RovingIndex.next({ index: 2, count: 7, step: 1 }),
    ).toEqual({ index: 3 });
    expect(
      RovingIndex.next({ index: 2, count: 7, step: -1 }),
    ).toEqual({ index: 1 });
  });

  it('overflows at the edges when loop is false', () => {
    expect(
      RovingIndex.next({ index: 0, count: 7, step: -1 }),
    ).toEqual({ overflow: 'before' });
    expect(
      RovingIndex.next({ index: 6, count: 7, step: 1 }),
    ).toEqual({ overflow: 'after' });
  });

  it('wraps when loop is true', () => {
    expect(
      RovingIndex.next({ index: 0, count: 7, step: -1, loop: true }),
    ).toEqual({ index: 6 });
    expect(
      RovingIndex.next({ index: 6, count: 7, step: 1, loop: true }),
    ).toEqual({ index: 0 });
  });

  it('steps by more than one on the same axis', () => {
    expect(
      RovingIndex.next({ index: 3, count: 31, step: 7 }),
    ).toEqual({ index: 10 });
    expect(
      RovingIndex.next({ index: 3, count: 31, step: -7 }),
    ).toEqual({ overflow: 'before' });
    expect(
      RovingIndex.next({ index: 28, count: 31, step: 7 }),
    ).toEqual({ overflow: 'after' });
  });

  it('overflows when the list is empty', () => {
    expect(
      RovingIndex.next({ index: 0, count: 0, step: 1 }),
    ).toEqual({ overflow: 'after' });
    expect(
      RovingIndex.next({ index: 0, count: 0, step: -1 }),
    ).toEqual({ overflow: 'before' });
  });
});

describe('RovingIndex instance', () => {
  it('keeps the active index when next succeeds', () => {
    const roving = RovingIndex.of(5, 1);
    expect(roving.next(1)).toEqual({ index: 2 });
    expect(roving.current).toBe(2);
  });

  it('does not change current on overflow', () => {
    const roving = RovingIndex.of(3, 0);
    expect(roving.next(-1)).toEqual({ overflow: 'before' });
    expect(roving.current).toBe(0);
  });

  it('resizes and clamps current', () => {
    const roving = RovingIndex.of(5, 4);
    roving.resize(2);
    expect(roving.current).toBe(1);
  });
});
