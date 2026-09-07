import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@preact/signals-core';
import {
  useSignal,
  isSignal,
  isReactive,
  untrack,
  createSignal,
  read,
  bind,
  type ReactiveAdapter,
} from './reactive';
import { preact } from './adapters/preact';
import { createScope, runInScope, disposeScope } from './lifecycle';

// reactive.ts guarda o adapter em variável de módulo (sem reset público). O vitest
// isola o módulo por arquivo, então controlamos o adapter aqui; "sem adapter" = null.
const noAdapter = () => useSignal(null as unknown as ReactiveAdapter);

beforeEach(() => {
  noAdapter();
});

describe('reactive — bind', () => {
  it('valor cru aplica uma vez, sem effect e fora de escopo', () => {
    const apply = vi.fn();
    bind(5, apply); // nenhum runInScope ativo
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(5);
  });

  it('fonte signal → effect + stop registrado no escopo ativo', () => {
    useSignal(preact);
    const sig = signal(0);
    const apply = vi.fn();
    const scope = createScope(null);

    runInScope(scope, () => bind(sig, apply));
    expect(apply).toHaveBeenCalledTimes(1); // roda na montagem
    sig.value = 1;
    expect(apply).toHaveBeenCalledTimes(2); // reage

    disposeScope(scope); // roda o stop registrado por bind
    sig.value = 2;
    expect(apply).toHaveBeenCalledTimes(2); // não reage mais
  });

  it('fonte função (derivação inline) também vira effect reativo', () => {
    useSignal(preact);
    const sig = signal('a');
    const apply = vi.fn();
    const scope = createScope(null);

    runInScope(scope, () => bind(() => sig.value, apply));
    expect(apply).toHaveBeenLastCalledWith('a');
    sig.value = 'b';
    expect(apply).toHaveBeenLastCalledWith('b');

    disposeScope(scope);
    sig.value = 'c';
    expect(apply).toHaveBeenCalledTimes(2);
  });
});

describe('reactive — read', () => {
  it('lê signal (via adapter), função e valor cru', () => {
    useSignal(preact);
    expect(read(signal(3))).toBe(3);
    expect(read(() => 7)).toBe(7);
    expect(read(9)).toBe(9);
  });
});

describe('reactive — sem adapter instalado', () => {
  it('isSignal/isReactive de signal são false; função ainda é reativa; bind cru aplica 1×', () => {
    const sig = signal(1);
    expect(isSignal(sig)).toBe(false);
    expect(isReactive(sig)).toBe(false);
    expect(isReactive(() => 1)).toBe(true); // independe de adapter
    const apply = vi.fn();
    bind(42, apply);
    expect(apply).toHaveBeenCalledWith(42);
  });
});

describe('reactive — untrack', () => {
  it('com adapter: leitura via untrack não cria dependência no effect', () => {
    useSignal(preact);
    const dep = signal(0);
    const quiet = signal(0);
    let runs = 0;
    const stop = preact.effect(() => {
      runs++;
      dep.value; // dependência real
      untrack(() => quiet.value); // NÃO deve virar dependência
    });
    expect(runs).toBe(1);

    quiet.value = 1; // não re-roda
    expect(runs).toBe(1);
    dep.value = 1; // re-roda
    expect(runs).toBe(2);
    stop();
  });

  it('sem adapter (fallback): untrack apenas executa e retorna fn()', () => {
    expect(untrack(() => 123)).toBe(123);
  });
});

describe('reactive — createSignal', () => {
  it('lança sem adapter instalado', () => {
    expect(() => createSignal(0)).toThrow(/Nenhum adapter/);
  });

  it('lança quando o adapter não implementa signal', () => {
    useSignal({
      isSignal: () => false,
      getValue: <T>() => undefined as unknown as T,
      effect: () => () => {},
    });
    expect(() => createSignal(0)).toThrow(/signal/);
  });
});
