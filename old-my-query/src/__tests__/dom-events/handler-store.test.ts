import { afterEach, describe, expect, it, vitest } from 'vitest';
import { DOMHandlerStore } from '@/dom-events/store';

describe('DOMHandlerStore', () => {
  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should add and retrieve a mapped handler', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    expect(
      DOMHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(true);

    expect(
      DOMHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modified);
  });

  it('should return false for non-existent handler', () => {
    const original = vitest.fn();

    expect(
      DOMHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(false);
  });

  it('should check existence of original handler', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    expect(DOMHandlerStore.exists(original)).toBe(false);

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    expect(DOMHandlerStore.exists(original)).toBe(true);
  });

  it('should remove a mapped handler and return it', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    const removed = DOMHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(removed).toBe(modified);
    expect(
      DOMHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(false);
  });

  it('should return undefined when removing non-existent handler', () => {
    const original = vitest.fn();

    const removed = DOMHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(removed).toBeUndefined();
  });

  it('should support same original handler with different identifiers', () => {
    const original = vitest.fn();
    const modifiedOnce = vitest.fn();
    const modifiedCapture = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modifiedOnce,
    });

    DOMHandlerStore.add({
      identifier: 'click::capture',
      originalHandler: original,
      handler: modifiedCapture,
    });

    expect(
      DOMHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modifiedOnce);

    expect(
      DOMHandlerStore.get({
        identifier: 'click::capture',
        originalHandler: original,
      }),
    ).toBe(modifiedCapture);
  });

  it('should not duplicate when adding same identifier twice', () => {
    const original = vitest.fn();
    const modified1 = vitest.fn();
    const modified2 = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified1,
    });

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified2,
    });

    // Should keep the first one
    expect(
      DOMHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modified1);
  });

  it('should clean up original handler entry when last mapping is removed', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    DOMHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(DOMHandlerStore.exists(original)).toBe(false);
  });

  it('should clear all mappings for a handler', () => {
    const original = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: vitest.fn(),
    });

    DOMHandlerStore.add({
      identifier: 'click::capture',
      originalHandler: original,
      handler: vitest.fn(),
    });

    DOMHandlerStore.clear(original);

    expect(DOMHandlerStore.exists(original)).toBe(false);
  });

  it('should clear all with clearAll', () => {
    const original1 = vitest.fn();
    const original2 = vitest.fn();

    DOMHandlerStore.add({
      identifier: 'a',
      originalHandler: original1,
      handler: vitest.fn(),
    });

    DOMHandlerStore.add({
      identifier: 'b',
      originalHandler: original2,
      handler: vitest.fn(),
    });

    DOMHandlerStore.clearAll();

    expect(DOMHandlerStore.exists(original1)).toBe(false);
    expect(DOMHandlerStore.exists(original2)).toBe(false);
  });
});
