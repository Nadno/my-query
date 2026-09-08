import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from '../../index';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';

$useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('children — normalização', () => {
  it('signal cru como filho vira região reativa', () => {
    const n = signal(0);
    const el = $.span({}, n);
    expect(el.textContent).toBe('0');
    n.value = 42;
    expect(el.textContent).toBe('42');
  });

  it('tupla [Component, props] como filho direto renderiza o componente', () => {
    const Badge = (p: { label: string }) => $.b({ id: 'badge' }, p.label);
    const el = $.div({}, [Badge, { label: 'novo' }] as [typeof Badge, { label: string }]);
    const badge = el.querySelector('#badge');
    expect(badge?.tagName).toBe('B');
    expect(badge?.textContent).toBe('novo');
  });

  it('filhos nullish (null/false/true/undefined) são ignorados', () => {
    const el = $.div({}, null, false, 'a', true, undefined, 'b');
    expect(el.textContent).toBe('ab');
    expect(el.childNodes.length).toBe(2);
  });

  it('createTag sem props: 1º arg não-props vira filho', () => {
    const el = $.span('hello');
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('hello');
    expect(el.hasAttributes()).toBe(false);
  });
});
