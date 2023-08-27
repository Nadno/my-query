import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../main';

import { setDOMEnvironment } from './test-utils';

describe('MyQuery dataset mutation', () => {
  beforeEach(() => {
    setDOMEnvironment('index.test');
  });

  it('should check if the element has a key in the dataset', () => {
    expect($<HTMLElement>('[data-section]').data.has('section')).toBe(true);
  });

  it('should check if the element has a key with a specific value in the dataset', () => {
    expect($<HTMLElement>('[data-section]').data.has('section', 'first')).toBe(
      true,
    );
  });

  it('should set a key in the element dataset', () => {
    $<HTMLElement>('[data-section]').data.set('foo', 'bar');
    expect($<HTMLElement>('[data-section]').data.has('foo', 'bar')).toBe(true);
  });

  it('should parse numbers and booleans from the element dataset', () => {
    $<HTMLElement>('[data-section]').data.set('foo', 42).set('bar', true);
    expect($<HTMLElement>('[data-section]').data.has('foo', 42)).toBe(true);
    expect($<HTMLElement>('[data-section]').data.has('bar', true)).toBe(true);
  });

  it('should assign multiple values in the element dataset', () => {
    $<HTMLElement>('[data-section]').data.assign({ foo: 42, bar: true });
    expect($<HTMLElement>('[data-section]').data.has('foo', 42)).toBe(true);
    expect($<HTMLElement>('[data-section]').data.has('bar', true)).toBe(true);
  });

  it('should assign multiple values with a prefixed  in the element dataset', () => {
    const user = {
      name: 'John Doe',
      age: 31,
      weight: 72.48,
    };

    $<HTMLElement>('[data-section]').data.assign('user', user);

    expect(
      $<HTMLElement>('[data-section]').data.has('userName', user.name),
    ).toBe(true);

    expect($<HTMLElement>('[data-section]').data.has('userAge', user.age)).toBe(
      true,
    );

    expect(
      $<HTMLElement>('[data-section]').data.has('userWeight', user.weight),
    ).toBe(true);
  });

  it('should get multiple values at once from the element dataset', () => {
    const { foo, bar } = $<HTMLElement>('[data-section]')
      .data.set('foo', 42)
      .set('bar', true)
      .get(['foo', 'bar']);

    expect(foo).toBe(42);
    expect(bar).toBe(true);
  });

  it('should get multiple values from a prefixed set in the element dataset', () => {
    const user = {
      name: 'John Doe',
      age: 31,
      weight: 72.48,
    };

    $<HTMLElement>('[data-section]').data.assign('user', user);

    expect(
      $<HTMLElement>('[data-section]').data.get('user', Object.keys(user)),
    ).toEqual(user);
  });

  it('should remove item from the element dataset', () => {
    const $element = $<HTMLElement>('[data-section]');
    $element.data.remove('section');
    expect($element.data.has('section')).toBe(false);
  });

  it('should remove multiples items from the element dataset', () => {
    $<HTMLElement>('[data-section]').data.assign({ foo: 42, bar: true });

    $<HTMLElement>('[data-section]').data.remove(['foo', 'bar']);

    expect($<HTMLElement>('[data-section]').data.has('foo')).toBe(false);
    expect($<HTMLElement>('[data-section]').data.has('bar')).toBe(false);
  });

  it('should remove multiples items from a prefixed set in the element dataset', () => {
    const user = {
        name: 'John Doe',
        age: 31,
        weight: 72.48,
      },
      userKeys = Object.keys(user);

    $<HTMLElement>('[data-section]').data.assign('user', user);
    $<HTMLElement>('[data-section]').data.remove('user', userKeys);

    const result = $<HTMLElement>('[data-section]').data.get('user', userKeys);

    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('age');
    expect(result).not.toHaveProperty('weight');
  });

  it('should remove and return the items from the element dataset', () => {
    const user = {
        name: 'John Doe',
        age: 31,
        weight: 72.48,
      },
      userKeys = Object.keys(user),
      other = { foo: 42, bar: true, qux: 'some' };

    const $element = $<HTMLElement>('[data-section]');

    $element.data.assign('user', user).assign(other);

    const userResult = $element.data.remove('user', userKeys),
      otherResult = $element.data.remove(['foo', 'bar']),
      quxResult = $element.data.remove('qux');

    expect(userResult).toEqual(user);

    expect(otherResult).toHaveProperty('foo', other.foo);
    expect(otherResult).toHaveProperty('bar', other.bar);
    expect(quxResult).toBe(other.qux);
  });
});
