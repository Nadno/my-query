/** Edge cases do `$useTeleport`: alvo desconectado e não-anexação ao pai. */

import { describe, it, expect } from 'vitest';
import $, { $mount, $useTeleport } from '../../index';
import { setupHost } from './helpers';

describe('$useTeleport — edge cases', () => {
  it('não anexa o elemento teleportado como filho do pai', () => {
    const { host, cleanup } = setupHost();
    const target = document.createElement('div');
    document.body.appendChild(target);

    const unmount = $mount(host, () => $.div({ use: $useTeleport(target) }, 'modal'));

    expect(host.childNodes).toHaveLength(0);
    expect(target.childNodes).toHaveLength(1);

    unmount();
    cleanup();
    document.body.removeChild(target);
  });

  it('alvo desconectado da DOM: nó fica órfão (appendChild funciona)', () => {
    const { host, cleanup } = setupHost();
    const detached = document.createElement('div');

    const unmount = $mount(host, () => $.div({ use: $useTeleport(detached) }, 'modal'));

    expect(detached.childNodes).toHaveLength(1);
    expect(detached.firstChild!.textContent).toBe('modal');
    expect(detached.isConnected).toBe(false);

    unmount();
    expect(detached.childNodes).toHaveLength(0);

    cleanup();
  });
});
