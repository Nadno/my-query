import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import {
  QueryCustomEventHandler,
  type CustomEventFactory,
} from '../../mini-stack/query/event-handler/query-custom-event-handler';
import { QueryHandlerStore } from '../../mini-stack/query/event-handler/query-handler-store';

import { setDOMEnvironment } from '../test-utils';

describe('QueryCustomEventHandler', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    QueryCustomEventHandler.clear();
    QueryHandlerStore.clearAll();
  });

  it('should register and check existence of a custom event', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    QueryCustomEventHandler.register(':test', factory);

    expect(QueryCustomEventHandler.has(':test')).toBe(true);
    expect(QueryCustomEventHandler.has(':nonexistent')).toBe(false);
  });

  it('should unregister a custom event', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    QueryCustomEventHandler.register(':test', factory);
    QueryCustomEventHandler.unregister(':test');

    expect(QueryCustomEventHandler.has(':test')).toBe(false);
  });

  it('should clear all registered custom events', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    QueryCustomEventHandler.register(':a', factory);
    QueryCustomEventHandler.register(':b', factory);

    QueryCustomEventHandler.clear();

    expect(QueryCustomEventHandler.has(':a')).toBe(false);
    expect(QueryCustomEventHandler.has(':b')).toBe(false);
  });

  it('should create a custom listener with metadata', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'my-custom',
      event: 'click',
      handler: (e) => handler(e),
    });

    QueryCustomEventHandler.register(':my-custom', factory);

    const customHandler = new QueryCustomEventHandler();
    const target = document.createElement('div');
    const handler = vitest.fn();

    const listener = customHandler.createCustomListener(target, {
      identifier: ':my-custom',
      handler,
    });

    expect(listener.identifier).toBe('my-custom');
    expect(listener.customEvent).toBe(':my-custom');
    expect(listener.event).toBe('click');
    expect(typeof listener).toBe('function');
    expect(QueryCustomEventHandler.isCustomEventHandler(listener)).toBe(true);
  });

  it('should add and remove a custom event listener', () => {
    const spy = vitest.fn();

    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test-event',
      event: 'click',
      handler: (e) => handler(e),
    });

    QueryCustomEventHandler.register(':test-event', factory);

    const customHandler = new QueryCustomEventHandler();
    const target = document.createElement('div');
    document.body.appendChild(target);

    customHandler.addCustomEventListener(target, {
      identifier: ':test-event',
      handler: spy,
    });

    target.click();
    expect(spy).toHaveBeenCalledOnce();

    customHandler.removeCustomEventListener(target, {
      identifier: ':test-event',
      handler: spy,
    });

    target.click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should throw when adding listener for unregistered custom event', () => {
    const customHandler = new QueryCustomEventHandler();
    const target = document.createElement('div');

    const listener = Object.assign(() => {}, {
      customEvent: ':nonexistent',
      identifier: 'test',
      event: 'click' as const,
      dispose: Object.assign(() => {}, {}),
      getContext: Object.assign(() => ({}), {}),
      extensor: (fn: AnyFunction) => fn,
    });

    expect(() => {
      customHandler.addCustomListener(target, vitest.fn(), listener as any);
    }).toThrow('There is no custom event called ":nonexistent"');
  });

  it('should support instance register/has/unregister', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'inst',
      event: 'click',
      handler,
    });

    const customHandler = new QueryCustomEventHandler();

    customHandler.register(':inst', factory);
    expect(customHandler.has(':inst')).toBe(true);

    customHandler.unregister(':inst');
    expect(customHandler.has(':inst')).toBe(false);
  });

  it('should not duplicate custom event listeners for same handler', () => {
    const spy = vitest.fn();

    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'dup-test',
      event: 'click',
      handler: (e) => handler(e),
    });

    QueryCustomEventHandler.register(':dup-test', factory);

    const customHandler = new QueryCustomEventHandler();
    const target = document.createElement('div');
    document.body.appendChild(target);

    customHandler.addCustomEventListener(target, {
      identifier: ':dup-test',
      handler: spy,
    });

    customHandler.addCustomEventListener(target, {
      identifier: ':dup-test',
      handler: spy,
    });

    target.click();
    // Should only fire once (not duplicated)
    expect(spy).toHaveBeenCalledOnce();
  });
});
