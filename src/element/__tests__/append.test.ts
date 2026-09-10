import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $append, $useSignal } from '../../index';
import { preact } from '../../adapters/preact';

$useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('LOW.8.1 — $append (normalização de filho renderizável)', () => {
  it('primitivo vira texto', () => {
    const parent = document.createElement('div');
    $append(parent, 'oi');
    expect(parent.textContent).toBe('oi');
    expect(parent.firstChild).toBeInstanceOf(Text);
  });

  it('Node entra direto (mesma referência)', () => {
    const parent = document.createElement('div');
    const child = document.createElement('span');
    $append(parent, child);
    expect(parent.firstChild).toBe(child);
  });

  it('array recursa (aninhado)', () => {
    const parent = document.createElement('div');
    $append(parent, ['a', ['b', 'c']]);
    expect(parent.textContent).toBe('abc');
    expect(parent.childNodes.length).toBe(3);
  });

  it('tupla [Component, props] chama o componente', () => {
    const parent = document.createElement('div');
    const Badge = (p: { label: string }) => $.b({}, p.label);
    $append(parent, [Badge, { label: 'novo' }] as [typeof Badge, { label: string }]);
    expect(parent.querySelector('b')?.textContent).toBe('novo');
  });

  it('fonte reativa vira região reativa', () => {
    const parent = document.createElement('div');
    const n = signal(0);
    $append(parent, n);
    expect(parent.textContent).toBe('0');
    n.value = 42;
    expect(parent.textContent).toBe('42');
  });

  it('nullish/boolean são ignorados', () => {
    const parent = document.createElement('div');
    $append(parent, null);
    $append(parent, false);
    $append(parent, true);
    $append(parent, undefined);
    expect(parent.childNodes.length).toBe(0);
  });
});
