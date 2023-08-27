import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../main';

import { setDOMEnvironment } from './test-utils';

describe('MyQuery attribute mutation', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should toggle multiple class tokens at once', () => {
    const bodyClass = $('body').classlist;

    bodyClass.toggle({
      foo: true,
      bar: false,
      qux: undefined,
      nix: true,
    });

    expect(bodyClass.has('foo')).toBe(true);
    expect(bodyClass.has('nix')).toBe(true);
    expect(bodyClass.has('bar')).toBe(false);
    expect(bodyClass.has('qux')).toBe(false);

    bodyClass.toggle({
      foo: false,
      bar: true,
      qux: true,
      nix: undefined,
    });

    expect(bodyClass.has('bar')).toBe(true);
    expect(bodyClass.has('qux')).toBe(true);
    expect(bodyClass.has('foo')).toBe(false);
    expect(bodyClass.has('nix')).toBe(false);
  });
});
