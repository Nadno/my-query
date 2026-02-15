import { afterEach, describe, expect, it, vitest } from 'vitest';
import { QueryHandlerStore } from '../modules/query-event-handler/query-handler-store';

describe('QueryHandlerStore', () => {
  afterEach(() => {
    QueryHandlerStore.clearAll();
  });

  it('should add and retrieve a mapped handler', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    expect(
      QueryHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(true);

    expect(
      QueryHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modified);
  });

  it('should return false for non-existent handler', () => {
    const original = vitest.fn();

    expect(
      QueryHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(false);
  });

  it('should check existence of original handler', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    expect(QueryHandlerStore.exists(original)).toBe(false);

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    expect(QueryHandlerStore.exists(original)).toBe(true);
  });

  it('should remove a mapped handler and return it', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    const removed = QueryHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(removed).toBe(modified);
    expect(
      QueryHandlerStore.has({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(false);
  });

  it('should return undefined when removing non-existent handler', () => {
    const original = vitest.fn();

    const removed = QueryHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(removed).toBeUndefined();
  });

  it('should support same original handler with different identifiers', () => {
    const original = vitest.fn();
    const modifiedOnce = vitest.fn();
    const modifiedCapture = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modifiedOnce,
    });

    QueryHandlerStore.add({
      identifier: 'click::capture',
      originalHandler: original,
      handler: modifiedCapture,
    });

    expect(
      QueryHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modifiedOnce);

    expect(
      QueryHandlerStore.get({
        identifier: 'click::capture',
        originalHandler: original,
      }),
    ).toBe(modifiedCapture);
  });

  it('should not duplicate when adding same identifier twice', () => {
    const original = vitest.fn();
    const modified1 = vitest.fn();
    const modified2 = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified1,
    });

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified2,
    });

    // Should keep the first one
    expect(
      QueryHandlerStore.get({
        identifier: 'click::once',
        originalHandler: original,
      }),
    ).toBe(modified1);
  });

  it('should clean up original handler entry when last mapping is removed', () => {
    const original = vitest.fn();
    const modified = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: modified,
    });

    QueryHandlerStore.remove({
      identifier: 'click::once',
      originalHandler: original,
    });

    expect(QueryHandlerStore.exists(original)).toBe(false);
  });

  it('should clear all mappings for a handler', () => {
    const original = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'click::once',
      originalHandler: original,
      handler: vitest.fn(),
    });

    QueryHandlerStore.add({
      identifier: 'click::capture',
      originalHandler: original,
      handler: vitest.fn(),
    });

    QueryHandlerStore.clear(original);

    expect(QueryHandlerStore.exists(original)).toBe(false);
  });

  it('should clear all with clearAll', () => {
    const original1 = vitest.fn();
    const original2 = vitest.fn();

    QueryHandlerStore.add({
      identifier: 'a',
      originalHandler: original1,
      handler: vitest.fn(),
    });

    QueryHandlerStore.add({
      identifier: 'b',
      originalHandler: original2,
      handler: vitest.fn(),
    });

    QueryHandlerStore.clearAll();

    expect(QueryHandlerStore.exists(original1)).toBe(false);
    expect(QueryHandlerStore.exists(original2)).toBe(false);
  });
});
