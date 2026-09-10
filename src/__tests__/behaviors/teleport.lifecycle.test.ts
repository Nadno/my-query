/** Lifecycle do `$useTeleport` com control-flow: `$when`, `$match`, `$each`. */

import { describe, it, expect } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $mount, $useTeleport, $when, $match, $each } from '../../index';
import { setupHost, setupTarget } from './helpers';

describe('$useTeleport — lifecycle com control-flow', () => {
  it('$when: remove o nó do alvo e deixa a âncora no lugar certo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const open = signal(false);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $when(
            () => open.value,
            () => $.div({ use: $useTeleport(target) }, 'modal'),
          ),
        ),
    );

    expect(target.childNodes).toHaveLength(0);
    expect(host.childNodes).toHaveLength(1);

    open.value = true;
    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild!.textContent).toBe('modal');

    open.value = false;
    expect(target.childNodes).toHaveLength(0);
    expect(host.childNodes).toHaveLength(1);

    unmount();
    cleanup();
    cleanupTarget();
  });

  it('$when + unmount com o modal aberto: nó removido do alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const open = signal(true);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $when(
            () => open.value,
            () => $.div({ use: $useTeleport(target) }, 'modal'),
          ),
        ),
    );
    expect(target.childNodes).toHaveLength(1);

    unmount();
    expect(target.childNodes).toHaveLength(0);

    cleanup();
    cleanupTarget();
  });

  it('$when abre→fecha→abre: estado fresco, nó recriado', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const open = signal(false);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $when(
            () => open.value,
            () => $.div({ use: $useTeleport(target) }, 'modal'),
          ),
        ),
    );

    open.value = true;
    const first = target.firstChild as HTMLElement;
    open.value = false;
    expect(target.childNodes).toHaveLength(0);

    open.value = true;
    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild).not.toBe(first);

    unmount();
    cleanup();
    cleanupTarget();
  });

  it('$match troca de ramo: nó do ramo anterior é limpo do alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const step = signal(0);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $match(
            [() => step.value === 0, () => $.div({ use: $useTeleport(target) }, 'A')],
            [() => step.value === 1, () => $.div({ use: $useTeleport(target) }, 'B')],
          ),
        ),
    );

    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild!.textContent).toBe('A');

    step.value = 1;
    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild!.textContent).toBe('B');

    step.value = 0;
    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild!.textContent).toBe('A');

    unmount();
    cleanup();
    cleanupTarget();
  });

  it('$each remove item com teleport: nó é limpo do alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const items = signal([{ id: 1 }, { id: 2 }]);

    const Row = (p: { id: number }) => $.div({ use: $useTeleport(target) }, `item-${p.id}`);

    const unmount = $mount(host, () => $.div({}, $each(items, Row, (t) => t.id)));

    expect(target.childNodes).toHaveLength(2);
    expect(target.textContent).toBe('item-1item-2');

    items.value = [{ id: 1 }];
    expect(target.childNodes).toHaveLength(1);
    expect(target.textContent).toBe('item-1');

    unmount();
    expect(target.childNodes).toHaveLength(0);

    cleanup();
    cleanupTarget();
  });
});
