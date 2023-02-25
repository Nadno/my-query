import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../main';

import { setDOMEnvironment } from './test-utils';

const INVALID_SELECTORS = [
  '',
  ' ',
  'foo#!()*',
  '.foo#!()*',
  '#foo#!()*',
  '%@#!)!',
  '123',
  '.123',
  1,
  {},
  [],
];

describe('MyQuery base query selection', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  /**
   * query method
   */

  it('should supply a `query` method to query descendent elements', () => {
    const $result = $(document.body).query('.c-section-text'),
      $expected = document.body.querySelector('.c-section-text');

    expect($result.element).toBe($expected);
  });

  it('should return null from `query` when querying inexistent descendent elements', () => {
    const $result = $(document.body).query('.none-element');
    expect($result).toBeNull();
  });

  /**
   * find method
   */

  it('should supply a `find` method to query descendent elements', () => {
    const $result = $(document.body).find('.c-section-text'),
      $expected = document.body.querySelector('.c-section-text');

    expect($expected).not.toBeNull();
    expect($result?.element).toBe($expected);
  });

  it('should return null from `find` when querying inexistent descendent elements', () => {
    const $result = $(document.body).find('.none-element');
    expect($result).toBeNull();
  });

  /**
   * findAll method
   */

  it('should supply a `findAll` method to query descendent elements', () => {
    const $result = $(document.body).findAll('.c-section-text'),
      $expectedList = [...document.body.querySelectorAll('.c-section-text')];

    expect($expectedList.length).toBeGreaterThan(0);
    $expectedList.forEach(($expected, index) =>
      expect($expected).toBe($result[index]),
    );
  });

  it('should return an empty list from `findAll` when querying inexistent descendent elements', () => {
    const $result = $(document.body).findAll('.none-element');
    expect($result).toEqual([]);
    expect($result).toHaveProperty('length', 0);
  });

  /**
   * child method
   */

  it('should supply a `child` method to query descendent elements', () => {
    const $result = $('#main').child('.c-section'),
      $expected = document.body.querySelector('.c-section');

    expect($expected).not.toBeNull();
    expect($result?.element).toBe($expected);
  });

  it('should return null from `child` when querying inexistent descendent elements', () => {
    const $result = $('#main').child('.none-element');
    expect($result).toBeNull();
  });

  it('should return null from `child` when querying deep descendent instead of direct child element', () => {
    const deepElementSelector = '.c-section-text';

    const $deep = (document.getElementById('main') as Element).querySelector(
      deepElementSelector,
    );

    expect($deep).not.toBeNull();

    const $result = $('#main').child('.c-section-text');
    expect($result).toBeNull();
  });

  /**
   * children method
   */

  it('should supply a `children` method to query descendent elements', () => {
    const $result = $('#main').children('.c-section'),
      $expectedList = [...document.body.querySelectorAll('#main > .c-section')];

    expect($expectedList.length).toBeGreaterThan(0);
    $expectedList.forEach(($expected, index) =>
      expect($expected).toBe($result[index]),
    );
  });

  it('should return an empty list from `children` when querying inexistent descendent elements', () => {
    const $result = $(document.body).children('.none-element');
    expect($result).toEqual([]);
    expect($result).toHaveProperty('length', 0);
  });

  it('should return an empty array from `children` when querying deep descendent instead of direct children elements', () => {
    const deepElementSelector = '.c-section-text';

    const $deepElements = [
      ...(document.getElementById('main') as Element).querySelectorAll(
        deepElementSelector,
      ),
    ];

    expect($deepElements.length).toBeGreaterThan(0);

    const $result = $('#main').children(deepElementSelector);
    expect($result).toEqual([]);
    expect($result).toHaveProperty('length', 0);
  });

  /**
   * closest method
   */

  it('should supply a `closest` method to query descendent elements', () => {
    const $result = $('#main').find('.c-section-text')?.closest('#main'),
      $expected = document.getElementById('main');

    expect($expected).not.toBeNull();
    expect($result?.element).toBe($expected);
  });

  it('should return null from `closest` when querying inexistent descendent elements', () => {
    const $result = $('#main').find('.none-element');
    expect($result).toBeNull();
  });

  /**
   * Expected to throw error for invalid selectors
   */

  it('should throw an error when using invalid selectors in all base query methods', () => {
    (
      ['query', 'find', 'findAll', 'child', 'children', 'closest'] as const
    ).forEach((method) =>
      INVALID_SELECTORS.forEach((selector: any) =>
        expect(() => $('#main')[method](selector)).toThrow(),
      ),
    );
  });
});

describe('MyQuery siblings query selection', () => {
  const sections = {
    first: '[data-section=first]',
    second: '[data-section=second]',
    third: '[data-section=third]',
  };

  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should supply a method to get a next sibling element', () => {
    const $section = $('#main').query<HTMLElement>(sections.first);
    expect($section.next<HTMLAnchorElement>()?.element).toBe(
      $section.element.nextElementSibling,
    );
  });

  it('should supply a method to get a specific next sibling element', () => {
    const $section = $('#main').query<HTMLElement>(sections.first),
      $specific = $('#main').query<HTMLElement>(sections.third).element;

    expect($section.next<HTMLAnchorElement>(sections.third)?.element).toBe(
      $specific,
    );
  });

  it('should supply a method to get all next sibling elements', () => {
    const $section = $('#main').query<HTMLElement>(sections.first);
    let current = $section.element;

    $section.nextAll<HTMLAnchorElement>().forEach((sibling) => {
      expect(sibling).toBe(current.nextElementSibling);
      current = current.nextElementSibling as any;
    });
  });

  it('should supply a method to get a previous sibling element', () => {
    const $section = $('#main').query<HTMLElement>(sections.third);
    expect($section.prev<HTMLAnchorElement>()?.element).toBe(
      $section.element.previousElementSibling,
    );
  });

  it('should supply a method to get a specific previous sibling element', () => {
    const $section = $('#main').query<HTMLElement>(sections.third),
      $specific = $('#main').query<HTMLElement>(sections.first).element;

    expect($section.prev<HTMLAnchorElement>(sections.first)?.element).toBe(
      $specific,
    );
  });

  it('should supply a method to get all previous sibling elements', () => {
    const $section = $('#main').query<HTMLElement>(sections.third);

    let current = $section.element;

    $section.prevAll<HTMLAnchorElement>().forEach((sibling) => {
      expect(sibling).toBe(current.previousElementSibling);
      current = current.previousElementSibling as any;
    });
  });
});
