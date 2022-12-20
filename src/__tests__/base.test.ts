import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../main';
import { setDOMEnvironment } from './test-utils';

describe('MyQuery base', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should create a MyQuery instance using query selection', () => {
    const mainElementId = '#main',
      mainElementClassName = '.c-main',
      sectionElementSelector = '.c-main .c-section';

    const $mainById = $(mainElementId),
      $mainByClass = $(mainElementClassName),
      $section = $(sectionElementSelector);

    expect($mainById).not.toBeNull();
    expect($mainById?.element).toBe(
      document.getElementById(mainElementId.substring(1)),
    );

    expect($mainByClass).not.toBeNull();
    expect($mainByClass?.element).toBe(
      document.querySelector(mainElementClassName),
    );

    expect($section).not.toBeNull();
    expect($section?.element).toBe(
      document.querySelector(sectionElementSelector),
    );
  });

  it('should create a MyQuery instance using an element', () => {
    const $main = document.getElementById('main') as HTMLElement,
      $mainByElement = $($main).element;

    expect($mainByElement).not.toBeFalsy();
    expect($mainByElement).toBe($main);
  });

  it('should return null if there is other CSS selectors with the id selector', () => {
    const $main = $('#main.c-main');
    expect($main).toBeNull();
  });
});
