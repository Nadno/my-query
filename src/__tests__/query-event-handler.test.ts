import { beforeEach, describe, expect, it, vitest } from 'vitest';
import $ from '../main';

import { setDOMEnvironment } from './test-utils';

describe('MyQuery event listening', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should add an event to be listened', () => {
    const clickSpy = vitest.fn();
    $('body').on('click', clickSpy);

    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should remove an event to be listened', () => {
    const clickSpy = vitest.fn();
    $('body').on('click', clickSpy).off('click', clickSpy);

    document.body.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should accept options of event listener', () => {
    const clickSpy = vitest.fn();

    $('body').on('click', clickSpy);

    document.body.click();

    $('body').off('click', clickSpy);

    document.body.click();
    document.body.click();
    document.body.click();

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});

describe('MyQuery QueryEventHandler delegated events', () => {
  it('should add an event that expects to be triggered only in specified targets', () => {
    const clickSpy = vitest.fn();

    $('body').on('click', '[data-section]', clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).toBeCalledTimes($sections.length);
  });

  it('should trigger an event only on specified targets', () => {
    const clickSpy = vitest.fn();

    $('body').on('click', '[data-section="first"]', clickSpy);

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

    $('body').on('click', '[data-section]', clickSpy);

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $('body').off('click', '[data-section]', clickSpy);

    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should add an event that expects to be triggered only once in specified targets', () => {
    const clickSpy = vitest.fn();

    $('body').on('click', '[data-section]', clickSpy, {
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

    $('body').on('click', '[data-section]', clickSpy, {
      once: true,
    });

    const $sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );

    $('body').off('click', '[data-section]', clickSpy, {
      once: true,
    });

    $sections.forEach(($element) => $element.click());
    $sections.forEach(($element) => $element.click());

    expect($sections.length).toBeGreaterThan(0);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should accept the same handler for different targets and/or options', () => {
    const clickSpy = vitest.fn();

    $('body')
      // Called 1
      .on('click', '[data-section="first"]', clickSpy, {
        once: true,
      })
      // Called 1
      .on('click', '[data-section="first"]', clickSpy, {
        capture: true,
      })
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

    $('body').off('click', '[data-section="first"]', clickSpy, {
      capture: true,
    });
    
    $sections.forEach(($element) => $element.click());
    
    $('body').off('click', '[data-section="first"]', clickSpy);

    $sections.forEach(($element) => $element.click());

    expect(clickSpy).toBeCalledTimes(10);
  });
});
