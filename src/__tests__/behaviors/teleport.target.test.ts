/** Resolução de alvo do `$useTeleport`: seletor, elemento, função e erros. */

import { describe, it, expect } from 'vitest';
import $, { $mount, $useTeleport } from '../../index';
import { setupHost, setupTarget } from './helpers';

describe('$useTeleport — resolução de alvo', () => {
  it('move o elemento para o alvo (seletor)', () => {
    const { host, cleanup } = setupHost();
    const unmount = $mount(host, () => $.div({ use: $useTeleport('body') }, 'modal'));
    expect(host.childNodes).toHaveLength(0);
    expect(document.body.lastChild!.textContent).toBe('modal');
    unmount();
    cleanup();
  });

  it('move o elemento para o alvo (elemento)', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const unmount = $mount(host, () => $.div({ use: $useTeleport(target) }, 'modal'));
    expect(target.childNodes).toHaveLength(1);
    expect(target.firstChild!.textContent).toBe('modal');
    unmount();
    cleanup();
    cleanupTarget();
  });

  it('lança erro para seletor inválido', () => {
    const { host, cleanup } = setupHost();
    expect(() => $mount(host, () => $.div({ use: $useTeleport('#nao-existe') }))).toThrow(
      /Nenhum elemento para o seletor/,
    );
    cleanup();
  });

  it('função de alvo que retorna seletor string resolve via getElement', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    target.id = 'alvo-fn-string';
    const unmount = $mount(host, () => $.div({ use: $useTeleport(() => '#alvo-fn-string') }, 'm'));
    expect(target.childNodes).toHaveLength(1);
    unmount();
    cleanup();
    cleanupTarget();
  });

  it('função de alvo que retorna seletor inválido lança erro', () => {
    const { host, cleanup } = setupHost();
    expect(() =>
      $mount(host, () => $.div({ use: $useTeleport(() => '#nao-existe') })),
    ).toThrow(/Nenhum elemento para o seletor/);
    cleanup();
  });

  it('função de alvo que retorna elemento resolve direto', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const unmount = $mount(host, () => $.div({ use: $useTeleport(() => target) }, 'm'));
    expect(target.childNodes).toHaveLength(1);
    unmount();
    cleanup();
    cleanupTarget();
  });
});
