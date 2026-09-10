/** Múltiplos `$useTeleport` para o mesmo alvo: ordem de append preservada. */

import { describe, it, expect } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $mount, $useTeleport, $when } from '../../index';
import { setupHost, setupTarget } from './helpers';

describe('$useTeleport — múltiplos teleports no mesmo alvo', () => {
  it('dois elementos para o mesmo alvo preservam a ordem de append', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $.div({ use: $useTeleport(target) }, 'primeiro'),
          $.div({ use: $useTeleport(target) }, 'segundo'),
        ),
    );

    expect(target.childNodes).toHaveLength(2);
    expect(target.textContent).toBe('primeirosegundo');

    unmount();
    expect(target.childNodes).toHaveLength(0);

    cleanup();
    cleanupTarget();
  });

  it('fechar um $when não remove o outro teleport do mesmo alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const open = signal(true);

    const unmount = $mount(
      host,
      () =>
        $.div(
          {},
          $.div({ use: $useTeleport(target) }, 'fixo'),
          $when(
            () => open.value,
            () => $.div({ use: $useTeleport(target) }, 'temporario'),
          ),
        ),
    );

    expect(target.childNodes).toHaveLength(2);
    expect(target.textContent).toBe('fixotemporario');

    open.value = false;
    expect(target.childNodes).toHaveLength(1);
    expect(target.textContent).toBe('fixo');

    unmount();
    expect(target.childNodes).toHaveLength(0);

    cleanup();
    cleanupTarget();
  });
});
