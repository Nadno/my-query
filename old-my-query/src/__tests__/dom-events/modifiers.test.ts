import { afterEach, describe, expect, it, vitest } from 'vitest';
import { DOMEventModifiers, type ModifierFactory } from '@/dom-events/modifiers';

describe('DOMEventModifiers', () => {
  afterEach(() => {
    DOMEventModifiers.clear();
  });

  it('should register and check existence of a modifier', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    DOMEventModifiers.register('.test', factory);

    expect(DOMEventModifiers.has('.test')).toBe(true);
    expect(DOMEventModifiers.has('.nonexistent')).toBe(false);
  });

  it('should register modifiers with different priorities', () => {
    const preFactory: ModifierFactory = (handler) => ({
      identifier: 'pre-mod',
      handler,
    });
    const normalFactory: ModifierFactory = (handler) => ({
      identifier: 'normal-mod',
      handler,
    });

    DOMEventModifiers.register('.pre-mod', preFactory, 0);
    DOMEventModifiers.register('.normal-mod', normalFactory, 10);

    expect(DOMEventModifiers.has('.pre-mod')).toBe(true);
    expect(DOMEventModifiers.has('.normal-mod')).toBe(true);
    expect(DOMEventModifiers.getPriority('.pre-mod')).toBe(0);
    expect(DOMEventModifiers.getPriority('.normal-mod')).toBe(10);
  });

  it('should retrieve a modifier factory with get', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    DOMEventModifiers.register('.test', factory);

    expect(DOMEventModifiers.get('.test')).toBe(factory);
  });

  it('should return undefined for non-existent modifier', () => {
    expect(DOMEventModifiers.get('.nonexistent')).toBeUndefined();
  });

  it('should apply a single modifier to a handler', () => {
    const calls: string[] = [];

    const wrapFactory: ModifierFactory = (handler) => ({
      identifier: 'wrapped',
      handler: (...args: any[]) => {
        calls.push('before');
        handler(...args);
        calls.push('after');
      },
    });

    DOMEventModifiers.register('.wrap', wrapFactory);

    const original = () => calls.push('original');

    const result = DOMEventModifiers.modify(original, [{ name: '.wrap' }]);

    result.handler();

    expect(calls).toEqual(['before', 'original', 'after']);
    expect(result.identifier).toBe('wrapped');
  });

  it('should apply modifiers sorted by priority (low first)', () => {
    const calls: string[] = [];

    const preFactory: ModifierFactory = (handler) => ({
      identifier: 'pre',
      handler: (...args: any[]) => {
        calls.push('pre');
        return handler(...args);
      },
    });

    const normalFactory: ModifierFactory = (handler) => ({
      identifier: 'normal',
      handler: (...args: any[]) => {
        calls.push('normal');
        return handler(...args);
      },
    });

    const postFactory: ModifierFactory = (handler) => ({
      identifier: 'post',
      handler: (...args: any[]) => {
        calls.push('post');
        return handler(...args);
      },
    });

    DOMEventModifiers.register('.pre-mod', preFactory, 0);
    DOMEventModifiers.register('.normal-mod', normalFactory, 10);
    DOMEventModifiers.register('.post-mod', postFactory, 20);

    const original = () => calls.push('original');

    const result = DOMEventModifiers.modify(original, [
      { name: '.post-mod' },
      { name: '.pre-mod' },
      { name: '.normal-mod' },
    ]);

    result.handler();

    // post wraps normal wraps pre wraps original (sorted by priority)
    expect(calls).toEqual(['post', 'normal', 'pre', 'original']);
  });

  it('should skip unregistered modifiers gracefully', () => {
    const original = vitest.fn();

    const result = DOMEventModifiers.modify(original, [{ name: '.nonexistent' }]);

    expect(result.handler).toBe(original);
  });

  it('should unregister a modifier', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    DOMEventModifiers.register('.test', factory);
    DOMEventModifiers.unregister('.test');

    expect(DOMEventModifiers.has('.test')).toBe(false);
  });

  it('should throw TypeError for non-function factory', () => {
    expect(() => {
      DOMEventModifiers.register('.bad', 'not a function' as any);
    }).toThrow(TypeError);
  });

  it('should concatenate identifiers from multiple modifiers', () => {
    const factoryA: ModifierFactory = (handler) => ({
      identifier: 'a',
      handler,
    });

    const factoryB: ModifierFactory = (handler) => ({
      identifier: 'b',
      handler,
    });

    DOMEventModifiers.register('.a', factoryA);
    DOMEventModifiers.register('.b', factoryB);

    const original = vitest.fn();

    const result = DOMEventModifiers.modify(original, [
      { name: '.a' },
      { name: '.b' },
    ]);

    expect(result.identifier).toBe('a:b');
  });
});
