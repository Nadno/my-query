import { describe, expect, it } from 'vitest';

import { Str } from './Str';

describe('Str', () => {
  it('kebabCase splits camelCase, underscores and hyphens', () => {
    expect(Str.kebabCase('notCertified')).toBe('not-certified');
    expect(Str.kebabCase('active')).toBe('active');
    expect(Str.kebabCase('foo-bar')).toBe('foo-bar');
    expect(Str.kebabCase('foo_bar')).toBe('foo-bar');
    expect(Str.kebabCase('')).toBe('');
  });

  it('camelCase splits the same way and lowercases the first word', () => {
    expect(Str.camelCase('ON_SITE')).toBe('onSite');
    expect(Str.camelCase('not-certified')).toBe('notCertified');
    expect(Str.camelCase('foo bar')).toBe('fooBar');
    expect(Str.camelCase('')).toBe('');
  });

  it('capitalize uppercases the first character and lowercases the rest', () => {
    expect(Str.capitalize('ada')).toBe('Ada');
    expect(Str.capitalize('ADA')).toBe('Ada');
    expect(Str.capitalize('')).toBe('');
  });

  it('throws when the value is not a string', () => {
    expect(() => Str.kebabCase(null)).toThrow(/Expected string, got null/);
    expect(() => Str.camelCase(1)).toThrow(/Expected string, got number/);
    expect(() => Str.capitalize(undefined)).toThrow(
      /Expected string, got undefined/,
    );
  });
});
