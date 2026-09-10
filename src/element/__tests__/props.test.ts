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

  it('$style reativo com string vai para o atributo cru', () => {
    const s = signal('color: red; margin: 0');
    const el = $.div({ $style: s });
    expect(el.getAttribute('style')).toBe('color: red; margin: 0');
    s.value = 'color: blue';
    expect(el.getAttribute('style')).toBe('color: blue');
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

  it('key é ignorada (não vira atributo)', () => {
    const el = $.div({ key: 'abc' });
    expect(el.hasAttribute('key')).toBe(false);
    expect(el.getAttribute('key')).toBeNull();
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

describe('props — valor cru é estático (ELM.2.7)', () => {
  it('prop sem $ não reage a mudanças posteriores', () => {
    const btn = $.button({ disabled: true }, 'x');
    expect(btn.disabled).toBe(true);
    // "mudança externa" não existe para uma prop cru — o atributo foi aplicado 1x
    btn.removeAttribute('disabled');
    expect(btn.disabled).toBe(false);
    // e nada re-aplica: o valor cru não é uma fonte rastreada
    expect(btn.hasAttribute('disabled')).toBe(false);
  });

  it('prop cru não vira dependência de effect (aplicada uma vez)', () => {
    const n = signal(0);
    const el = $.div({ id: 'x', 'data-n': n.value });
    expect(el.dataset.n).toBe('0');
    n.value = 5;
    expect(el.dataset.n).toBe('0'); // estático: não atualiza
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

describe('props — aria objeto', () => {
  it('aplica atributos aria a partir de camelCase', () => {
    const el = $.div({ aria: { expanded: true, labelledBy: 'title', colIndex: 3 } });
    expect(el.getAttribute('aria-expanded')).toBe('true');
    expect(el.getAttribute('aria-labelledby')).toBe('title');
    expect(el.getAttribute('aria-colindex')).toBe('3');
  });

  it('booleano false vira string "false", nao remove', () => {
    const el = $.div({ aria: { expanded: false, hidden: false } });
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.getAttribute('aria-hidden')).toBe('false');
  });

  it('null/undefined removem o atributo aria', () => {
    const el = $.div({ aria: { expanded: null, labelledBy: undefined as string | undefined } });
    expect(el.hasAttribute('aria-expanded')).toBe(false);
    expect(el.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('$aria reativo atualiza no change (signal e funcao)', () => {
    const expanded = signal(false);
    const selected = signal('a');
    const el = $.div({
      $aria: {
        expanded: expanded,
        selected: () => selected.value === 'a',
        controls: 'panel',
      },
    });
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.getAttribute('aria-selected')).toBe('true');
    expect(el.getAttribute('aria-controls')).toBe('panel');

    expanded.value = true;
    expect(el.getAttribute('aria-expanded')).toBe('true');

    selected.value = 'b';
    expect(el.getAttribute('aria-selected')).toBe('false');
  });

  it('$aria com null/undefined remove no change', () => {
    const id = signal<string | null>('x');
    const el = $.div({ $aria: { describedBy: id } });
    expect(el.getAttribute('aria-describedby')).toBe('x');
    id.value = null;
    expect(el.hasAttribute('aria-describedby')).toBe(false);
  });
});
