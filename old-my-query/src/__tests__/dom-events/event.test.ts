import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { DOMEvent } from '@/dom-events/event';
import { DOMHandlerStore } from '@/dom-events/store';
import { $onBatch } from '@/dom-events/utils';
// Import index to trigger registerDOMEventDefaults()
import '@/dom-events';

import { setDOMEnvironment } from '../test-utils';

describe('DOMEvent event listening', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should add an event to be listened', () => {
    const clickSpy = vitest.fn();
    new DOMEvent(document.body).on('click', clickSpy);

    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should remove an event to be listened', () => {
    const clickSpy = vitest.fn();
    new DOMEvent(document.body).on('click', clickSpy).off('click', clickSpy);

    document.body.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should accept options of event listener', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.on('click', clickSpy);

    document.body.click();

    body.off('click', clickSpy);

    document.body.click();
    document.body.click();
    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});

describe('DOMEvent delegated events', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should add an event that expects to be triggered only in specified targets', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click', '[data-section]', clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).toBeCalledTimes($sections.length);
  });

  it('should trigger an event only on specified targets', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click', '[data-section="first"]', clickSpy);

    const $otherSections = Array.from(
      document.body.querySelectorAll<HTMLElement>(
        ':scope > :not([data-section="first"])',
      ),
    );

    $otherSections.forEach(($element) => $element.click());

    expect($otherSections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should remove an event that expects to be triggered only in specified targets', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.on('click', '[data-section]', clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    body.off('click', '[data-section]', clickSpy);

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should add an event that expects to be triggered only once in specified targets', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click', '[data-section]', clickSpy, {
      once: true,
    });

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());
    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should remove an event that expects to be triggered only once in specified targets', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.on('click', '[data-section]', clickSpy, { once: true });

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    body.off('click', '[data-section]', clickSpy, { once: true });

    $sections.forEach(($element) => $element.click());
    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should accept the same handler for different targets and/or options', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body
      // Called 1
      .on('click', '[data-section="first"]', clickSpy, { once: true })
      // Called 1
      .on('click', '[data-section="first"]', clickSpy, { capture: true })
      // Called 2
      .on('click', '[data-section="first"]', clickSpy)
      // Called 3
      .on('click', '[data-section="second"]', clickSpy)
      // Called 3
      .on('click', '[data-section="third"]', clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());

    body.off('click', '[data-section="first"]', clickSpy, { capture: true });

    $sections.forEach(($element) => $element.click());

    body.off('click', '[data-section="first"]', clickSpy);

    $sections.forEach(($element) => $element.click());

    expect(clickSpy).toBeCalledTimes(10);
  });
});

describe('DOMEvent modifiers', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should execute handler only once with .once modifier', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click.once' as any, clickSpy);

    document.body.click();
    document.body.click();
    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should call preventDefault with .prevent modifier', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click.prevent' as any, clickSpy);

    const event = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should only trigger when target matches with .self modifier', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click.self' as any, clickSpy);

    // Click on body itself
    const bodyEvent = new Event('click', { bubbles: true });
    Object.defineProperty(bodyEvent, 'target', { value: document.body });
    document.body.dispatchEvent(bodyEvent);

    // Click on a child element (should not trigger)
    const $section = document.querySelector('[data-section]') as HTMLElement;
    $section.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should combine .once and .prevent modifiers', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).on('click.once.prevent' as any, clickSpy);

    const event1 = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event1);

    const event2 = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event2);

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(event1.defaultPrevented).toBe(true);
  });

  it('should remove a modified handler with off', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.on('click.once' as any, clickSpy);
    body.off('click.once' as any, clickSpy);

    document.body.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });
});

describe('DOMEvent custom events', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should trigger :click-outside when clicking outside the target element', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).on(':click-outside' as any, outsideSpy);

    const outsideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', { value: document.body });
    window.dispatchEvent(outsideEvent);

    expect(outsideSpy).toHaveBeenCalledOnce();
  });

  it('should NOT trigger :click-outside when clicking inside the target element', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).on(':click-outside' as any, outsideSpy);

    const insideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(insideEvent, 'target', { value: $section });
    window.dispatchEvent(insideEvent);

    expect(outsideSpy).not.toHaveBeenCalled();
  });

  it('should remove :click-outside listener with off', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section)
      .on(':click-outside' as any, outsideSpy)
      .off(':click-outside' as any, outsideSpy);

    const outsideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', { value: document.body });
    window.dispatchEvent(outsideEvent);

    expect(outsideSpy).not.toHaveBeenCalled();
  });

  it('should trigger :focus-outside when focus leaves the target element', () => {
    const focusSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).on(':focus-outside' as any, focusSpy);

    const focusEvent = new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: document.body,
    });
    $section.dispatchEvent(focusEvent);

    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it('should NOT trigger :focus-outside when focus moves within the target', () => {
    const focusSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;
    const $child = $section.querySelector('.c-section-title') as HTMLElement;

    new DOMEvent($section).on(':focus-outside' as any, focusSpy);

    const focusEvent = new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: $child,
    });
    $section.dispatchEvent(focusEvent);

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should trigger :interact-outside on click outside', () => {
    const interactSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).on(':interact-outside' as any, interactSpy);

    const pointerEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(pointerEvent, 'target', { value: document.body });
    window.dispatchEvent(pointerEvent);

    expect(interactSpy).toHaveBeenCalledOnce();
  });

  it('should trigger :interact-outside on focus outside', () => {
    const interactSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).on(':interact-outside' as any, interactSpy);

    const focusEvent = new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: document.body,
    });
    $section.dispatchEvent(focusEvent);

    expect(interactSpy).toHaveBeenCalledOnce();
  });
});

describe('DOMEvent edge cases', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should not duplicate handler when adding the same modified handler twice', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.on('click.once' as any, clickSpy).on('click.once' as any, clickSpy);

    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should not break when removing a handler that was never added', () => {
    const clickSpy = vitest.fn();

    expect(() => {
      new DOMEvent(document.body).off('click', clickSpy);
    }).not.toThrow();
  });

  it('should handle window event handler', () => {
    const clickSpy = vitest.fn();
    const win = new DOMEvent(window);

    win.on('click', clickSpy);

    window.dispatchEvent(new Event('click'));

    expect(clickSpy).toHaveBeenCalledOnce();

    win.off('click', clickSpy);

    window.dispatchEvent(new Event('click'));

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should handle document event handler', () => {
    const clickSpy = vitest.fn();
    const doc = new DOMEvent(document);

    doc.on('click', clickSpy);

    document.dispatchEvent(new Event('click'));

    expect(clickSpy).toHaveBeenCalledOnce();

    doc.off('click', clickSpy);

    document.dispatchEvent(new Event('click'));

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});

describe('DOMEvent $on/$off declarative API', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should add a simple event listener with $on', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(['click'], clickSpy);

    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should remove a simple event listener with $off', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.$on(['click'], clickSpy);
    body.$off(['click'], clickSpy);

    document.body.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should apply .once modifier via $on', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(['click', '.once'], clickSpy);

    document.body.click();
    document.body.click();
    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should apply .prevent modifier via $on', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(['click', '.prevent'], clickSpy);

    const event = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event);

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should apply multiple modifiers via $on', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(['click', '.once', '.prevent'], clickSpy);

    const event1 = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event1);

    const event2 = new Event('click', { cancelable: true });
    document.body.dispatchEvent(event2);

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(event1.defaultPrevented).toBe(true);
  });

  it('should delegate events via $on with object modifier', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(
      ['click', { $$: '.delegate', $: '[data-section]' }],
      clickSpy,
    );

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).toBeCalledTimes($sections.length);
  });

  it('should remove delegated events via $off with object modifier', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.$on(['click', { $$: '.delegate', $: '[data-section]' }], clickSpy);
    body.$off(['click', { $$: '.delegate', $: '[data-section]' }], clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should apply .self modifier via $on', () => {
    const clickSpy = vitest.fn();

    new DOMEvent(document.body).$on(['click', '.self'], clickSpy);

    // Click on body itself
    const bodyEvent = new Event('click', { bubbles: true });
    Object.defineProperty(bodyEvent, 'target', { value: document.body });
    document.body.dispatchEvent(bodyEvent);

    // Click on a child element (should not trigger)
    const $section = document.querySelector('[data-section]') as HTMLElement;
    $section.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should remove a modified handler with $off', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.$on(['click', '.once'], clickSpy);
    body.$off(['click', '.once'], clickSpy);

    document.body.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should handle :click-outside custom event via $on', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).$on([':click-outside'], outsideSpy);

    const outsideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', { value: document.body });
    window.dispatchEvent(outsideEvent);

    expect(outsideSpy).toHaveBeenCalledOnce();
  });

  it('should NOT trigger :click-outside via $on when clicking inside', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;

    new DOMEvent($section).$on([':click-outside'], outsideSpy);

    const insideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(insideEvent, 'target', { value: $section });
    window.dispatchEvent(insideEvent);

    expect(outsideSpy).not.toHaveBeenCalled();
  });

  it('should remove :click-outside listener with $off', () => {
    const outsideSpy = vitest.fn();
    const $section = document.querySelector('[data-section="first"]') as HTMLElement;
    const sectionEvent = new DOMEvent($section);

    sectionEvent.$on([':click-outside'], outsideSpy);
    sectionEvent.$off([':click-outside'], outsideSpy);

    const outsideEvent = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(outsideEvent, 'target', { value: document.body });
    window.dispatchEvent(outsideEvent);

    expect(outsideSpy).not.toHaveBeenCalled();
  });

  it('should not duplicate handler when adding the same $on twice', () => {
    const clickSpy = vitest.fn();
    const body = new DOMEvent(document.body);

    body.$on(['click', '.once'], clickSpy);
    body.$on(['click', '.once'], clickSpy);

    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});

describe('$onBatch', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  afterEach(() => {
    DOMHandlerStore.clearAll();
  });

  it('should register multiple listeners and remove them all with the cleanup function', () => {
    const clickSpy = vitest.fn();
    const focusSpy = vitest.fn();

    const cleanup = $onBatch(document.body, (on) => {
      on('click', clickSpy);
      on('focus', focusSpy);
    });

    document.body.click();
    document.body.dispatchEvent(new Event('focus'));
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(focusSpy).toHaveBeenCalledOnce();

    cleanup();

    document.body.click();
    document.body.dispatchEvent(new Event('focus'));
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it('should support listen (declarative API) inside batch', () => {
    const clickSpy = vitest.fn();

    const cleanup = $onBatch(document.body, (_on, listen) => {
      listen(['click', '.once'], clickSpy);
    });

    document.body.click();
    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();

    cleanup();
  });

  it('should accumulate listeners across multiple $onBatch calls on the same element', () => {
    const spy1 = vitest.fn();
    const spy2 = vitest.fn();

    const cleanup1 = $onBatch(document.body, (on) => {
      on('click', spy1);
    });

    const cleanup2 = $onBatch(document.body, (on) => {
      on('focus', spy2);
    });

    document.body.click();
    document.body.dispatchEvent(new Event('focus'));
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();

    cleanup1();

    document.body.click();
    document.body.dispatchEvent(new Event('focus'));
    // click removed, focus still active
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledTimes(2);

    cleanup2();
  });

  it('should not throw when calling cleanup multiple times', () => {
    const cleanup = $onBatch(document.body, (on) => {
      on('click', vitest.fn());
    });

    expect(() => {
      cleanup();
      cleanup();
    }).not.toThrow();
  });
});
