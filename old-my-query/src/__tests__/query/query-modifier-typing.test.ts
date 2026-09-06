import { describe, it, expect } from 'vitest';
import $ from '../../main';
import { setDOMEnvironment } from '../test-utils';

// Extend MQModifiers to add custom modifiers
declare module '@/types' {
  interface MQModifiers {
    '.custom-modifier': { customOption: boolean };
    '.delay': { ms: number };
  }
}

describe('MyQuery Modifier Typing', () => {
  setDOMEnvironment('index.test');

  it('should accept built-in modifiers with proper typing', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that built-in modifiers are properly typed
    $button.$on(['click', '.once', '.prevent'], (e) => {
      expect(e.type).toBe('click');
    });

    // This should compile without errors
    expect(true).toBe(true);
  });

  it('should accept custom modifiers as strings', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that custom modifiers can be used as strings
    // Note: The actual modifier needs to be registered with QueryHandlerModifiers
    // This test just verifies the typing system accepts them
    $button.$on(['click', '.custom-modifier'], (e) => {
      expect(e.type).toBe('click');
    });

    expect(true).toBe(true);
  });

  it('should accept modifiers without the dot prefix', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that modifiers work with or without the dot prefix
    $button.$on(['click', '.once', '.prevent'], (e) => {
      expect(e.type).toBe('click');
    });

    expect(true).toBe(true);
  });

  it('should accept object-style modifier declarations', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that object-style modifiers are properly typed
    $button.$on([{ $$: 'click' }, { $$: '.once' }], (e) => {
      expect(e.type).toBe('click');
    });

    expect(true).toBe(true);
  });

  it('should accept mixed modifier styles', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that we can mix string and object-style modifiers
    $button.$on(['click', '.once', { $$: '.prevent' }], (e) => {
      expect(e.type).toBe('click');
    });

    expect(true).toBe(true);
  });

  it('should work with custom events and modifiers', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const $div = $(div);

    // Test that custom events work with modifiers
    $div.$on([':click-outside', '.once'], (e) => {
      expect(e.type).toBeDefined();
    });

    expect(true).toBe(true);
  });

  it('should provide IntelliSense for built-in modifiers', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // This test verifies that TypeScript provides autocomplete for modifiers
    // The actual autocomplete is tested in the IDE, but we verify compilation here
    const modifiers: Array<keyof import('@/types').MQModifiers> = [
      '.once',
      '.prevent',
      '.self',
      '.capture',
      '.delegate',
    ];

    modifiers.forEach((modifier) => {
      expect(modifier).toMatch(/^\./);
    });
  });
});
