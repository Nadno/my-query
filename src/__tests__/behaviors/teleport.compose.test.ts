/** Interação do `$useTeleport` com outros behaviors: `$show`, `$model`, `on:`. */

import { describe, it, expect } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $mount, $useTeleport, $show, $model } from '../../index';
import { setupHost, setupTarget } from './helpers';

describe('$useTeleport — composição com outros behaviors', () => {
  it('$show: esconder mantém o nó no alvo (preserva estado)', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const visible = signal(true);

    const unmount = $mount(
      host,
      () => $.div({ use: [$useTeleport(target), $show(() => visible.value)] }, 'modal'),
    );

    expect(target.childNodes).toHaveLength(1);
    expect((target.firstChild as HTMLElement).hidden).toBe(false);

    visible.value = false;
    expect(target.childNodes).toHaveLength(1);
    expect((target.firstChild as HTMLElement).hidden).toBe(true);

    visible.value = true;
    expect((target.firstChild as HTMLElement).hidden).toBe(false);

    unmount();
    cleanup();
    cleanupTarget();
  });

  it('$model: two-way continua funcionando no alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    const text = signal('hi');

    const unmount = $mount(
      host,
      () => $.div({ use: $useTeleport(target) }, $.input({ use: $model(text) })),
    );

    const input = target.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('hi');

    input.value = 'yo';
    input.dispatchEvent(new Event('input'));
    expect(text.value).toBe('yo');

    text.value = 'zap';
    expect(input.value).toBe('zap');

    unmount();
    cleanup();
    cleanupTarget();
  });

  it('on: listeners funcionam no alvo', () => {
    const { host, cleanup } = setupHost();
    const { target, cleanup: cleanupTarget } = setupTarget();
    let clicks = 0;

    const unmount = $mount(
      host,
      () =>
        $.div(
          { use: $useTeleport(target), on: { click: () => clicks++ } },
          $.button({}, 'btn'),
        ),
    );

    const btn = target.querySelector('button') as HTMLButtonElement;
    btn.click();
    btn.click();
    expect(clicks).toBe(2);

    unmount();
    cleanup();
    cleanupTarget();
  });
});
