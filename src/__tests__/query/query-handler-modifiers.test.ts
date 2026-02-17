import { afterEach, describe, expect, it, vitest } from 'vitest';
import {
  QueryHandlerModifiers,
  type ModifierFactory,
} from '../../mini-stack/query/event-handler/query-handler-modifiers';

describe('QueryHandlerModifiers', () => {
  afterEach(() => {
    QueryHandlerModifiers.clear();
  });

  it('should register and check existence of a modifier', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    QueryHandlerModifiers.register('normal', '.test', factory);

    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.has('normal', '.test')).toBe(true);
    expect(modifiers.has('pre', '.test')).toBe(false);
  });

  it('should register modifiers in different orders', () => {
    const preFactory: ModifierFactory = (handler) => ({
      identifier: 'pre-mod',
      handler,
    });
    const normalFactory: ModifierFactory = (handler) => ({
      identifier: 'normal-mod',
      handler,
    });
    const postFactory: ModifierFactory = (handler) => ({
      identifier: 'post-mod',
      handler,
    });

    QueryHandlerModifiers.register('pre', '.pre-mod', preFactory);
    QueryHandlerModifiers.register('normal', '.normal-mod', normalFactory);
    QueryHandlerModifiers.register('post', '.post-mod', postFactory);

    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.has('pre', '.pre-mod')).toBe(true);
    expect(modifiers.has('normal', '.normal-mod')).toBe(true);
    expect(modifiers.has('post', '.post-mod')).toBe(true);
  });

  it('should retrieve a modifier factory with get', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    QueryHandlerModifiers.register('normal', '.test', factory);

    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.get('normal', '.test')).toBe(factory);
  });

  it('should return undefined for non-existent modifier', () => {
    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.get('normal', '.nonexistent')).toBeUndefined();
  });

  it('should find a modifier across all orders', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'found',
      handler,
    });

    QueryHandlerModifiers.register('post', '.hidden', factory);

    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.find('.hidden')).toBe(factory);
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

    QueryHandlerModifiers.register('normal', '.wrap', wrapFactory);

    const modifiers = new QueryHandlerModifiers();
    const original = () => calls.push('original');

    const result = modifiers.modify(original, [{ name: '.wrap' }]);

    result.handler();

    expect(calls).toEqual(['before', 'original', 'after']);
    expect(result.identifier).toBe('wrapped');
  });

  it('should apply modifiers in correct order: pre -> normal -> post', () => {
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

    QueryHandlerModifiers.register('pre', '.pre-mod', preFactory);
    QueryHandlerModifiers.register('normal', '.normal-mod', normalFactory);
    QueryHandlerModifiers.register('post', '.post-mod', postFactory);

    const modifiers = new QueryHandlerModifiers();
    const original = () => calls.push('original');

    const result = modifiers.modify(original, [
      { name: '.pre-mod' },
      { name: '.normal-mod' },
      { name: '.post-mod' },
    ]);

    result.handler();

    // post wraps normal wraps pre wraps original
    expect(calls).toEqual(['post', 'normal', 'pre', 'original']);
  });

  it('should apply only specified order subset', () => {
    const preFactory: ModifierFactory = (handler) => ({
      identifier: 'pre',
      handler,
    });

    const normalFactory: ModifierFactory = (handler) => ({
      identifier: 'normal',
      handler,
    });

    QueryHandlerModifiers.register('pre', '.pre-mod', preFactory);
    QueryHandlerModifiers.register('normal', '.normal-mod', normalFactory);

    const modifiers = new QueryHandlerModifiers();
    const original = vitest.fn();

    const result = modifiers.modify(
      original,
      [{ name: '.pre-mod' }, { name: '.normal-mod' }],
      { orders: 'pre' },
    );

    // Only pre modifier should be applied
    expect(result.identifier).toBe('pre');
  });

  it('should skip unregistered modifiers gracefully in ordered modify', () => {
    const modifiers = new QueryHandlerModifiers();
    const original = vitest.fn();

    const result = modifiers.modify(original, [{ name: '.nonexistent' }]);

    // Should return the original handler since no modifier was applied
    expect(result.handler).toBe(original);
  });

  it('should unregister a modifier', () => {
    const factory: ModifierFactory = (handler) => ({
      identifier: 'test',
      handler,
    });

    QueryHandlerModifiers.register('normal', '.test', factory);
    QueryHandlerModifiers.unregister('normal', '.test');

    const modifiers = new QueryHandlerModifiers();
    expect(modifiers.has('normal', '.test')).toBe(false);
  });

  it('should throw TypeError for non-function factory', () => {
    expect(() => {
      QueryHandlerModifiers.register(
        'normal',
        '.bad',
        'not a function' as any,
      );
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

    QueryHandlerModifiers.register('normal', '.a', factoryA);
    QueryHandlerModifiers.register('normal', '.b', factoryB);

    const modifiers = new QueryHandlerModifiers();
    const original = vitest.fn();

    const result = modifiers.modify(original, [
      { name: '.a' },
      { name: '.b' },
    ]);

    expect(result.identifier).toBe('a:b');
  });
});
