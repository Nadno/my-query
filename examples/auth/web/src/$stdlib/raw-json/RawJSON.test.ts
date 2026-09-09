import { describe, expect, it } from 'vitest';

import { RawJSON } from './RawJSON';

describe('RawJSON', () => {
  it('parse turns boolean literals into booleans, case-insensitive', () => {
    expect(RawJSON.parse('true')).toBe(true);
    expect(RawJSON.parse('TRUE')).toBe(true);
    expect(RawJSON.parse('false')).toBe(false);
    expect(RawJSON.parse('FALSE')).toBe(false);
  });

  it('parse turns integer and float literals into numbers, including padding', () => {
    expect(RawJSON.parse('12')).toBe(12);
    expect(RawJSON.parse(' 12 ')).toBe(12);
    expect(RawJSON.parse('12.5')).toBe(12.5);
    expect(RawJSON.parse('-12')).toBe(-12);
    expect(RawJSON.parse('+12.5')).toBe(12.5);
  });

  it('parse turns null literals into null, case-insensitive', () => {
    expect(RawJSON.parse('null')).toBeNull();
    expect(RawJSON.parse('NULL')).toBeNull();
  });

  it('parse leaves leftover text as the original string', () => {
    expect(RawJSON.parse('https://x')).toBe('https://x');
    expect(RawJSON.parse('https://Example.COM/Path')).toBe(
      'https://Example.COM/Path',
    );
    expect(RawJSON.parse('')).toBe('');
    expect(RawJSON.parse('undefined')).toBe('undefined');
    expect(RawJSON.parse('"hello"')).toBe('"hello"');
    expect(RawJSON.parse('[1,2]')).toBe('[1,2]');
  });

  it('throws when parse is given a non-string', () => {
    expect(() => RawJSON.parse(null)).toThrow(/Expected string, got null/);
    expect(() => RawJSON.parse(1)).toThrow(/Expected string, got number/);
    expect(() => RawJSON.parse(undefined)).toThrow(
      /Expected string, got undefined/,
    );
  });

  it('stringify turns primitives into text', () => {
    expect(RawJSON.stringify(true)).toBe('true');
    expect(RawJSON.stringify(false)).toBe('false');
    expect(RawJSON.stringify(12)).toBe('12');
    expect(RawJSON.stringify(12.5)).toBe('12.5');
    expect(RawJSON.stringify(null)).toBe('null');
    expect(RawJSON.stringify('https://x')).toBe('https://x');
  });

  it('throws when stringify is given a non-primitive', () => {
    expect(() => RawJSON.stringify(undefined)).toThrow(
      /Expected string \| boolean \| number \| null, got undefined/,
    );
    expect(() => RawJSON.stringify({})).toThrow(
      /Expected string \| boolean \| number \| null, got object/,
    );
  });
});
