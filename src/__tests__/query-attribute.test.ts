import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../main';

import { setDOMEnvironment } from './test-utils';

describe('MyQuery attribute mutation', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should return true when the element has the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.has('data-section')).toBe(true);
  });

  it('should return false when the element does not have the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.has('data-not-existent')).toBe(false);
  });

  it('should return true when the element has the specified attribute and its value', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.has('data-index', 0)).toBe(true);
  });

  it('should return false when the element does not have the specified attribute or its value', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.has('data-index', 1)).toBe(false);
    expect($section.attribute.has('data-not-existent', '')).toBe(false);
  });

  it('should accept booleans and numbers when setting an attribute', () => {
    const $section = $(document.body).query('[data-section=first]');

    $section.attribute.set('data-number', 1).set('data-boolean', true);

    expect($section.element.getAttribute('data-number')).toBe('1');
    expect($section.element.getAttribute('data-boolean')).toBe('true');
  });

  it('should parse to integer the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');

    $section.attribute.set('data-number', 1);

    expect($section.attribute.get('data-number')).toBe(1);
  });

  it('should parse to negative integer the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');

    $section.attribute.set('data-number', -1);

    expect($section.attribute.get('data-number')).toBe(-1);
  });

  it('should parse to float the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');

    $section.attribute.set('data-number', 1.42);

    expect($section.attribute.get('data-number')).toBe(1.42);
  });

  it('should parse to boolean the specified attribute', () => {
    const $section = $(document.body).query('[data-section=first]');

    $section.attribute.set('data-boolean', true);

    expect($section.attribute.get('data-boolean')).toBe(true);
  });

  it('should keep as a string a normal attribute', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.get('data-section')).toBe('first');
  });

  it('should return the default passed value when the attribute does not exists', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.get('data-not-existent', 'defaultValue')).toBe('defaultValue');
  });

  it('should remove an attribute from the element', () => {
    const $section = $(document.body).query('[data-section=first]');
    $section.attribute.remove('data-section');
    expect($section.attribute.has('data-section')).toBe(false);
  });

  it('should return the value of a removed attribute', () => {
    const $section = $(document.body).query('[data-section=first]');
    expect($section.attribute.remove('data-section')).toBe('first');
  });

  it('should assign multiple attributes at once', () => {
    const $section = $(document.body).query('[data-section=first]');

    const assignedAttributes = {
      tabindex: -1,
      'data-string': 'string',
      'data-boolean': false,
      'data-integer': 42,
      'data-float': 3.1415,
    };

    $section.attribute.assign(assignedAttributes);

    Object.entries(assignedAttributes).forEach(([name, value]) =>
      expect($section.attribute.has(name, value)).toBe(true),
    );
  });
});
