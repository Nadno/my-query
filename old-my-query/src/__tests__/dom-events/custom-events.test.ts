import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { DOMCustomEventHandler, type CustomEventFactory } from '@/dom-events/custom-events';
import { DOMHandlerStore } from '@/dom-events/store';

import { setDOMEnvironment } from '../test-utils';

describe('DOMCustomEventHandler', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMCustomEventHandler.clear();
    DOMHandlerStore.clearAll();
  });

  it('should register and check existence of a custom event', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    DOMCustomEventHandler.register(':test', factory);

    expect(DOMCustomEventHandler.has(':test')).toBe(true);
    expect(DOMCustomEventHandler.has(':nonexistent')).toBe(false);
  });

  it('should unregister a custom event', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    DOMCustomEventHandler.register(':test', factory);
    DOMCustomEventHandler.unregister(':test');

    expect(DOMCustomEventHandler.has(':test')).toBe(false);
  });

  it('should clear all registered custom events', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test',
      event: 'click',
      handler,
    });

    DOMCustomEventHandler.register(':a', factory);
    DOMCustomEventHandler.register(':b', factory);

    DOMCustomEventHandler.clear();

    expect(DOMCustomEventHandler.has(':a')).toBe(false);
    expect(DOMCustomEventHandler.has(':b')).toBe(false);
  });

  it('should create a custom listener with metadata', () => {
    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'my-custom',
      event: 'click',
      handler: (e) => handler(e),
    });

    DOMCustomEventHandler.register(':my-custom', factory);

    const target = document.createElement('div');
    const handler = vitest.fn();

    const listener = DOMCustomEventHandler.createCustomListener(target, {
      identifier: ':my-custom',
      handler,
    });

    expect(listener.identifier).toBe('my-custom');
    expect(listener.customEvent).toBe(':my-custom');
    expect(listener.event).toBe('click');
    expect(typeof listener).toBe('function');
    expect(DOMCustomEventHandler.isCustomEventHandler(listener)).toBe(true);
  });

  it('should add and remove a custom event listener', () => {
    const spy = vitest.fn();

    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'test-event',
      event: 'click',
      handler: (e) => handler(e),
    });

    DOMCustomEventHandler.register(':test-event', factory);

    const target = document.createElement('div');
    document.body.appendChild(target);

    DOMCustomEventHandler.addCustomEventListener(target, {
      identifier: ':test-event',
      handler: spy,
    });

    target.click();
    expect(spy).toHaveBeenCalledOnce();

    DOMCustomEventHandler.removeCustomEventListener(target, {
      identifier: ':test-event',
      handler: spy,
    });

    target.click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('should throw when adding listener for unregistered custom event', () => {
    const target = document.createElement('div');

    const listener = Object.assign(() => {}, {
      customEvent: ':nonexistent',
      identifier: 'test',
      event: 'click' as const,
      dispose: Object.assign(() => {}, {}),
      getContext: Object.assign(() => ({}), {}),
      extensor: (fn: (...args: any[]) => any) => fn,
    });

    expect(() => {
      DOMCustomEventHandler.addCustomListener(target, vitest.fn(), listener as any);
    }).toThrow('There is no custom event called ":nonexistent"');
  });

  it('should not duplicate custom event listeners for same handler', () => {
    const spy = vitest.fn();

    const factory: CustomEventFactory<'click'> = ({ handler }) => ({
      identifier: 'dup-test',
      event: 'click',
      handler: (e) => handler(e),
    });

    DOMCustomEventHandler.register(':dup-test', factory);

    const target = document.createElement('div');
    document.body.appendChild(target);

    DOMCustomEventHandler.addCustomEventListener(target, {
      identifier: ':dup-test',
      handler: spy,
    });

    DOMCustomEventHandler.addCustomEventListener(target, {
      identifier: ':dup-test',
      handler: spy,
    });

    target.click();
    // Should only fire once (not duplicated)
    expect(spy).toHaveBeenCalledOnce();
  });
});
