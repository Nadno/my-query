import { describe, it, expect, vi } from 'vitest';
import { applyUse } from '../behaviors';
import { createScope, runInScope, disposeScope } from '../lifecycle';
import type { MQ } from '../types';

const ctxFor = (element: Element = document.createElement('div')): MQ =>
  ({ element }) as MQ;

describe('LOW.8.5 — applyUse (miolo do use)', () => {
  it('roda behavior único e registra o cleanup no escopo ativo', () => {
    const cleanup = vi.fn();
    const behavior = vi.fn(() => cleanup);
    const scope = createScope(null);

    runInScope(scope, () => applyUse(ctxFor(), behavior));
    expect(behavior).toHaveBeenCalledOnce();
    expect(cleanup).not.toHaveBeenCalled();

    disposeScope(scope);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('aceita array de behaviors e roda todos em ordem', () => {
    const order: string[] = [];
    const a = () => {
      order.push('a');
      return () => order.push('a-cleanup');
    };
    const b = () => {
      order.push('b');
      return () => order.push('b-cleanup');
    };
    const scope = createScope(null);

    runInScope(scope, () => applyUse(ctxFor(), [a, b]));
    expect(order).toEqual(['a', 'b']);

    disposeScope(scope);
    // cleanups em ordem inversa do registro
    expect(order).toEqual(['a', 'b', 'b-cleanup', 'a-cleanup']);
  });

  it('behavior sem retorno não quebra', () => {
    const scope = createScope(null);
    expect(() =>
      runInScope(scope, () => applyUse(ctxFor(), () => undefined)),
    ).not.toThrow();
    expect(() => disposeScope(scope)).not.toThrow();
  });

  it('fora de escopo roda o behavior mas o cleanup não é registrado', () => {
    const cleanup = vi.fn();
    const behavior = vi.fn(() => cleanup);
    applyUse(ctxFor(), behavior);
    expect(behavior).toHaveBeenCalledOnce();
    expect(cleanup).not.toHaveBeenCalled();
  });
});
