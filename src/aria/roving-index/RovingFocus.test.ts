// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { RovingFocus } from './RovingFocus';

function setup(count = 3) {
  const root = document.createElement('div');
  root.setAttribute('role', 'listbox');
  for (let index = 0; index < count; index++) {
    const item = document.createElement('button');
    item.setAttribute('role', 'option');
    item.textContent = String(index);
    root.append(item);
  }
  document.body.append(root);
  return { root, items: Array.from(root.children) as HTMLElement[] };
}

function key(el: HTMLElement | Document, k: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}

/** Aguarda um microtask para efeitos síncronos do roving. */
const tick = () => Promise.resolve();

afterEach(() => {
  document.body.innerHTML = '';
});

describe('RovingFocus', () => {
  it('pinta o primeiro item como tabindex=0 e os demais -1 no ativar', () => {
    const { root, items } = setup();
    RovingFocus.of(root).activate();
    expect(items[0]!.tabIndex).toBe(0);
    expect(items[1]!.tabIndex).toBe(-1);
    expect(items[2]!.tabIndex).toBe(-1);
  });

  it('muda foco com setas na orientação padrão (horizontal)', async () => {
    const { root, items } = setup();
    RovingFocus.of(root).activate();
    items[0]!.focus();
    key(root, 'ArrowRight');
    await tick();
    expect(document.activeElement).toBe(items[1]);
    expect(items[1]!.tabIndex).toBe(0);
    expect(items[0]!.tabIndex).toBe(-1);
  });

  it('suporta orientação vertical', async () => {
    const { root, items } = setup();
    RovingFocus.of(root, { orientation: 'vertical' }).activate();
    items[0]!.focus();
    key(root, 'ArrowDown');
    await tick();
    expect(document.activeElement).toBe(items[1]);
    key(root, 'ArrowUp');
    await tick();
    expect(document.activeElement).toBe(items[0]);
  });

  it('não move e emite overflow ao ultrapassar as bordas sem loop', async () => {
    const { root, items } = setup(2);
    const overflows: string[] = [];
    RovingFocus.of(root, { onOverflow: (edge) => overflows.push(edge) }).activate();
    items[0]!.focus();
    key(root, 'ArrowLeft');
    await tick();
    expect(document.activeElement).toBe(items[0]);
    expect(overflows).toEqual(['before']);

    items[1]!.focus();
    key(root, 'ArrowRight');
    await tick();
    expect(document.activeElement).toBe(items[1]);
    expect(overflows).toEqual(['before', 'after']);
  });

  it('embrulha nas bordas quando loop é true', async () => {
    const { root, items } = setup(2);
    RovingFocus.of(root, { loop: true }).activate();
    items[0]!.focus();
    key(root, 'ArrowLeft');
    await tick();
    expect(document.activeElement).toBe(items[1]);

    key(root, 'ArrowRight');
    await tick();
    expect(document.activeElement).toBe(items[0]);
  });

  it('Home e End movem para o primeiro e o último item', async () => {
    const { root, items } = setup();
    RovingFocus.of(root).activate();
    items[1]!.focus();
    key(root, 'Home');
    await tick();
    expect(document.activeElement).toBe(items[0]);

    key(root, 'End');
    await tick();
    expect(document.activeElement).toBe(items[2]);
  });

  it('chama onMove quando o foco muda para um item', async () => {
    const { root, items } = setup();
    const moved: HTMLElement[] = [];
    RovingFocus.of(root, { onMove: (el) => moved.push(el) }).activate();
    items[0]!.focus();
    key(root, 'ArrowRight');
    await tick();
    expect(moved).toEqual([items[1]]);
  });

  it('restaura o tabindex=0 para o item correto quando o foco sai (roving reset)', () => {
    const { root, items } = setup();
    RovingFocus.of(root).activate();
    items[1]!.focus();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    expect(items[0]!.tabIndex).toBe(0);
    expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1);
    outside.remove();
  });

  it('mantém o tabindex=0 no item focado após seta (roving ao navegar)', async () => {
    const { root, items } = setup(4);
    RovingFocus.of(root).activate();
    items[0]!.focus();
    key(root, 'ArrowRight');
    await tick();
    key(root, 'ArrowRight');
    await tick();
    expect(items[2]!.tabIndex).toBe(0);
    expect(items.filter((item) => item.tabIndex === 0)).toHaveLength(1);
  });

  it('deactivate remove os listeners', () => {
    const { root, items } = setup();
    const scope = RovingFocus.of(root).activate();
    scope.deactivate();
    items[0]!.focus();
    key(root, 'ArrowRight');
    expect(document.activeElement).toBe(items[0]);
  });
});
