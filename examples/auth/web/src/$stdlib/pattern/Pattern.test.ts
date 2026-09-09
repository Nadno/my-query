import { describe, expect, it } from 'vitest';

import { Pattern } from './Pattern';

describe('Pattern.match', () => {
  it('returns the case for a literal value', () => {
    expect(
      Pattern.match('admin', { admin: 'full', guest: 'read', _: 'none' }),
    ).toBe('full');
    expect(Pattern.match('unknown', { admin: 'full', _: 'none' })).toBe('none');
    expect(Pattern.match('missing', { admin: 'full' })).toBeUndefined();
  });

  it('invokes function results with the matched value', () => {
    expect(
      Pattern.match('idle', {
        idle: (status) => `state:${status}`,
      }),
    ).toBe('state:idle');
  });

  it('does not match inherited Object.prototype keys', () => {
    const cases = { a: 'x' } as const;
    expect(Pattern.match('toString', cases)).toBeUndefined();
    expect(Pattern.match('__proto__', cases)).toBeUndefined();
    expect(Pattern.match('constructor', cases)).toBeUndefined();
  });

  it('does not fall back to inherited Object.prototype keys', () => {
    expect(
      Pattern.match('toString', {
        a: 'x',
        _: 'fallback',
      }),
    ).toBe('fallback');
  });
});

describe('Pattern.when fluent', () => {
  it('returns the first matching branch', () => {
    const label = Pattern.when('loading' as string)
      .is((status) => status === 'loading', '…')
      .is((status) => status === 'error', 'retry')
      .else('idle');

    expect(label).toBe('…');
  });

  it('calls lazy handlers with the value', () => {
    const value = Pattern.when(3)
      .is((n) => n > 0, (n) => n * 2)
      .else(0);

    expect(value).toBe(6);
  });
});

describe('Pattern.when array', () => {
  it('returns the first true branch', () => {
    let progress = 100;
    const isLoading = false;

    const state = Pattern.when(
      [
        { when: () => isLoading, then: () => 'loading' as const },
        { when: () => progress >= 100, then: () => 'complete' as const },
      ],
      'idle' as const,
    );

    expect(state).toBe('complete');
  });

  it('infers a union of branch results', () => {
    const result = Pattern.when(
      [
        { when: () => false, then: () => 1 },
        { when: () => true, then: () => 'ok' },
      ],
      false,
    );

    expect(result).toBe('ok');
  });

  it('calls thunk handlers without arguments', () => {
    const calls: number[] = [];

    Pattern.when(
      [{ when: () => true, then: () => calls.push(1) }],
      () => calls.push(0),
    );

    expect(calls).toEqual([1]);
  });
});
