/** Reatividade do alvo do `$useTeleport`: alvo reativo, identidade do nó, unmount. */

import { describe, it, expect } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $mount, $useTeleport, $when } from '../../index';
import { setupHost } from './helpers';

describe('$useTeleport — reatividade do alvo', () => {
  it('alvo reativo move o nó vivo para o novo alvo', () => {
    const { host, cleanup } = setupHost();
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.appendChild(a);
    document.body.appendChild(b);
    const which = signal(a);

    const unmount = $mount(host, () => $.div({ use: $useTeleport(() => which.value) }, 'm'));
    const el = a.firstElementChild as HTMLElement;
    expect(el.parentNode).toBe(a);

    which.value = b;
    expect(el.parentNode).toBe(b);
    expect(a.childNodes).toHaveLength(0);

    unmount();
    cleanup();
    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it('troca de alvo preserva a identidade do nó (não recria)', () => {
    const { host, cleanup } = setupHost();
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.appendChild(a);
    document.body.appendChild(b);
    const which = signal(a);

    const unmount = $mount(host, () => $.div({ use: $useTeleport(() => which.value) }, 'm'));
    const el = a.firstElementChild as HTMLElement;

    which.value = b;
    expect(b.firstElementChild).toBe(el);

    unmount();
    cleanup();
    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it('$when + alvo reativo: abre em A, troca para B com modal aberto, fecha limpa', () => {
    const { host, cleanup } = setupHost();
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.appendChild(a);
    document.body.appendChild(b);
    const open = signal(false);
    const which = signal(a);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $when(
            () => open.value,
            () => $.div({ use: $useTeleport(() => which.value) }, 'modal'),
          ),
        ),
    );

    expect(a.childNodes).toHaveLength(0);
    expect(b.childNodes).toHaveLength(0);

    open.value = true;
    expect(a.childNodes).toHaveLength(1);
    expect(a.firstChild!.textContent).toBe('modal');

    which.value = b;
    expect(a.childNodes).toHaveLength(0);
    expect(b.childNodes).toHaveLength(1);

    open.value = false;
    expect(a.childNodes).toHaveLength(0);
    expect(b.childNodes).toHaveLength(0);

    unmount();
    cleanup();
    document.body.removeChild(a);
    document.body.removeChild(b);
  });

  it('para o effect do alvo reativo no unmount (não re-anexa)', () => {
    const { host, cleanup } = setupHost();
    const a = document.createElement('div');
    const b = document.createElement('div');
    document.body.appendChild(a);
    document.body.appendChild(b);
    const which = signal(a);

    const unmount = $mount(host, () => $.div({ use: $useTeleport(() => which.value) }, 'm'));
    const el = a.firstElementChild as HTMLElement;
    expect(el.parentNode).toBe(a);

    unmount();
    which.value = b;
    expect(el.parentNode).toBeNull();

    cleanup();
    document.body.removeChild(a);
    document.body.removeChild(b);
  });
});
