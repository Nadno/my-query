// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { FocusScope } from './FocusScope';

function setup() {
  const trigger = document.createElement('button');
  trigger.id = 'trigger';
  trigger.textContent = 'trigger';

  const root = document.createElement('div');
  root.setAttribute('role', 'dialog');
  const first = document.createElement('button');
  first.textContent = 'first';
  const second = document.createElement('button');
  second.textContent = 'second';
  root.append(first, second);

  document.body.append(trigger, root);
  return { trigger, root, first, second };
}

function sentinels(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('[data-focus-sentinel]'),
  );
}

/** Aguarda um frame — o FocusScope foca via requestAnimationFrame. */
const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => resolve()),
  );

afterEach(() => {
  while (FocusScope.current) FocusScope.current.deactivate();
  document.body.innerHTML = '';
});

describe('FocusScope', () => {
  it('ativa e foca o primeiro focável (autoFocus)', async () => {
    const { root, first } = setup();
    const scope = FocusScope.of(root).activate();
    await frame();
    expect(document.activeElement).toBe(first);
    expect(FocusScope.current).toBe(scope);
    expect(root.tabIndex).toBe(-1); // raiz entra no tab order de forma programática
  });

  it('é idempotente em activate/deactivate', () => {
    const { root } = setup();
    const scope = FocusScope.of(root, { autoFocus: false });
    scope.activate();
    scope.activate();
    expect(FocusScope.current).toBe(scope);
    scope.deactivate();
    scope.deactivate();
    expect(FocusScope.current).toBeNull();
  });

  it('isola os irmãos com inert e só restaura os que ineritou', () => {
    const { trigger, root } = setup();
    const scope = FocusScope.of(root, { autoFocus: false });
    scope.activate();
    expect(trigger.inert).toBe(true);
    scope.deactivate();
    expect(trigger.inert).toBe(false);
    expect(scope).toBeDefined();
  });

  it('não mexe em irmão já inerte (outro escopo/host)', () => {
    const { trigger, root } = setup();
    const scope = FocusScope.of(root, { autoFocus: false });
    trigger.inert = true;
    scope.activate();
    scope.deactivate();
    expect(trigger.inert).toBe(true);
  });

  it('restaura o foco ao elemento que tinha antes (trigger)', async () => {
    const { trigger, root } = setup();
    trigger.focus();
    const scope = FocusScope.of(root, { autoFocus: false }).activate();
    scope.deactivate();
    await frame();
    expect(document.activeElement).toBe(trigger);
  });

  it('mantém a pilha LIFO — o topo (mais recente) governa', () => {
    const { root: rootA } = setup();
    const rootB = document.createElement('section');
    rootB.textContent = 'b';
    document.body.append(rootB);

    const a = FocusScope.of(rootA, { autoFocus: false }).activate();
    const b = FocusScope.of(rootB, { autoFocus: false }).activate();
    expect(FocusScope.current).toBe(b);
    b.deactivate();
    expect(FocusScope.current).toBe(a);
    a.deactivate();
    expect(FocusScope.current).toBeNull();
  });

  it('embrulha o foco das sentinelas — entra pela start vindo de fora', async () => {
    const { trigger, root, first, last } = (() => {
      const s = setup();
      return { ...s, last: s.root.querySelectorAll('button')[1]! };
    })();
    FocusScope.of(root, { autoFocus: false }).activate();

    const start = sentinels(root)[0]!;
    start.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, relatedTarget: trigger }),
    );
    await frame();
    expect(document.activeElement).toBe(first);

    const end = sentinels(root)[1]!;
    end.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, relatedTarget: trigger }),
    );
    await frame();
    expect(document.activeElement).toBe(last);
  });

  it('embrulha ao contrário — saiu pela sentinela final', async () => {
    const { root, first } = setup();
    const scope = FocusScope.of(root, { autoFocus: false }).activate();
    const end = sentinels(root)[1]!;

    first.focus();
    first.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: end }),
    );
    await frame();
    expect(document.activeElement).toBe(first);
    expect(scope).toBeDefined();
  });
});
