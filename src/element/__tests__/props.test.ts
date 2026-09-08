import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from '../../index';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';

$useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('props — style', () => {
  it('style string vai para o atributo cru', () => {
    const el = $.div({ style: 'color: red; margin: 0' });
    expect(el.getAttribute('style')).toBe('color: red; margin: 0');
  });

  it('style objeto aplica por chave em el.style', () => {
    const el = $.div({ style: { color: 'blue', paddingTop: '4px' } });
    expect(el.style.color).toBe('blue');
    expect(el.style.paddingTop).toBe('4px');
  });

  it('$style reativo atualiza no change', () => {
    const s = signal<Record<string, string>>({ color: 'red' });
    const el = $.div({ $style: s });
    expect(el.style.color).toBe('red');
    s.value = { color: 'green' };
    expect(el.style.color).toBe('green');
  });
});

describe('props — data estático', () => {
  it('data record vira dataset', () => {
    const el = $.div({ data: { count: 1, tag: 'x' } });
    expect(el.dataset.count).toBe('1');
    expect(el.dataset.tag).toBe('x');
  });
});

describe('props — setAttr', () => {
  it('atributo que não é propriedade cai no setAttribute', () => {
    const el = $.div({ foo: 'bar' });
    expect(el.getAttribute('foo')).toBe('bar');
  });

  it('false/null removem o atributo (estático)', () => {
    const el = $.div({ id: false, foo: null });
    expect(el.id).toBe('');
    expect(el.hasAttribute('id')).toBe(false);
    expect(el.hasAttribute('foo')).toBe(false);
  });

  it('$-prop reativo indo para false remove o atributo', () => {
    const title = signal<string | false>('hi');
    const el = $.div({ $title: title });
    expect(el.getAttribute('title')).toBe('hi');
    title.value = false;
    expect(el.hasAttribute('title')).toBe(false);
  });
});

describe('props — $class que resolve vazio', () => {
  it('remove o atributo class quando a classe resolve para vazio', () => {
    const on = signal<string | false>('a');
    const el = $.div({ $class: on });
    expect(el.className).toBe('a');
    on.value = false;
    expect(el.className).toBe('');
    expect(el.hasAttribute('class')).toBe(false);
  });
});
