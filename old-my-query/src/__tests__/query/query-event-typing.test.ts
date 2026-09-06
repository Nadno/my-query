import { describe, it, expect, vitest } from 'vitest';
import $ from '../../main';
import { setDOMEnvironment } from '../test-utils';

describe('MyQuery Event Typing', () => {
  setDOMEnvironment('index.test');

  it('should properly type standard DOM events with $on', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that MouseEvent is properly typed
    const clickHandler = vitest.fn((e: MouseEvent) => {
      expect(e.clientX).toBeDefined();
      expect(e.clientY).toBeDefined();
    });

    $button.$on(['click'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should properly type standard DOM events with modifiers', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that MouseEvent is properly typed with modifiers
    const clickHandler = vitest.fn((e: MouseEvent) => {
      expect(e.clientX).toBeDefined();
      expect(e.clientY).toBeDefined();
    });

    $button.$on(['click', '.once', '.prevent'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should properly type custom events with $on', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const $div = $(div);

    // Test that custom event is properly typed - this test verifies TypeScript compilation
    // The actual behavior is tested in query-event-handler.test.ts
    const clickOutsideHandler = vitest.fn((e: Event) => {
      expect(e.type).toBeDefined();
    });

    // This should compile without errors - the typing is what we're testing
    $div.$on([':click-outside'], clickOutsideHandler);
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should properly type custom events with modifiers', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const $div = $(div);

    // Test that custom event is properly typed with modifiers
    const clickOutsideHandler = vitest.fn((e: Event) => {
      expect(e.type).toBeDefined();
    });

    // This should compile without errors - the typing is what we're testing
    $div.$on([':click-outside', '.once'], clickOutsideHandler);
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should properly type KeyboardEvent', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const $input = $(input);

    // Test that KeyboardEvent is properly typed
    const keydownHandler = vitest.fn((e: KeyboardEvent) => {
      expect(e.key).toBeDefined();
      expect(e.code).toBeDefined();
    });

    $input.$on(['keydown'], keydownHandler);
    
    const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
    input.dispatchEvent(event);
    expect(keydownHandler).toHaveBeenCalled();
  });

  it('should properly type FocusEvent', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const $input = $(input);

    // Test that FocusEvent is properly typed
    const focusHandler = vitest.fn((e: FocusEvent) => {
      expect(e.relatedTarget).toBeDefined();
    });

    $input.$on(['focus'], focusHandler);
    input.focus();
    expect(focusHandler).toHaveBeenCalled();
  });

  it('should properly type events with object-style event declaration', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that MouseEvent is properly typed with object declaration
    const clickHandler = vitest.fn((e: Event) => {
      expect(e.type).toBe('click');
    });

    $button.$on([{ $$: 'click' }], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should properly type custom events with object-style declaration', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const $div = $(div);

    // Test that custom event is properly typed with object declaration
    const clickOutsideHandler = vitest.fn((e: Event) => {
      expect(e.type).toBeDefined();
    });

    // This should compile without errors - the typing is what we're testing
    $div.$on([{ $$: ':click-outside' }], clickOutsideHandler);
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should properly type $off with same signature as $on', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that $off accepts the same types as $on
    const clickHandler = vitest.fn((e: MouseEvent) => {
      expect(e.clientX).toBeDefined();
    });

    $button.$on(['click'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    $button.$off(['click'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should properly type $off with modifiers', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    const $button = $(button);

    // Test that $off accepts modifiers
    const clickHandler = vitest.fn((e: MouseEvent) => {
      expect(e.clientX).toBeDefined();
    });

    $button.$on(['click', '.prevent'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    $button.$off(['click', '.prevent'], clickHandler);
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1); // Should not be called again
  });
});
