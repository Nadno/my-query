/**
 * Reactive — contrato agnóstico de sistema de signals.
 *
 * A lib não conhece nenhuma lib de signal específica: o usuário instala um adapter
 * mínimo via `useSignal`. Um binding reativo é qualquer valor que seja um signal
 * (segundo o adapter) ou uma função `() => expr` — esta funciona com qualquer
 * adapter, pois só depende de `effect`.
 */

import { registerCleanup } from './lifecycle';

export interface ReactiveAdapter {
  /** `true` se `value` é um signal desta lib de reatividade. */
  isSignal(value: unknown): boolean;
  /** Lê o valor atual de um signal (dentro de um effect, cria dependência). */
  getValue<T>(signal: unknown): T;
  /** Roda `run` e re-roda quando dependências mudam; retorna a função de parada. */
  effect(run: () => void): () => void;
}

/** Signal genérico (formato mínimo observável pela lib). */
export type Signalish<T> = { readonly value: T };

/** Valor de prop reativa: signal, função derivada, ou valor cru. */
export type Bindable<T> = T | Signalish<T> | (() => T);

let adapter: ReactiveAdapter | null = null;

/** Instala o adapter de reatividade (ex.: preact/signals-core). */
export function useSignal(next: ReactiveAdapter): void {
  adapter = next;
}

function getAdapter(): ReactiveAdapter {
  if (!adapter) {
    throw new Error(
      '[mini-q] Nenhum adapter de reatividade instalado. Chame $.useSignal(adapter) antes.',
    );
  }
  return adapter;
}

/** `true` se `value` é um signal do adapter instalado. */
export function isSignal(value: unknown): boolean {
  return adapter != null && adapter.isSignal(value);
}

/** `true` se `value` deve ser rastreado reativamente (signal ou função). */
export function isReactive(value: unknown): boolean {
  return typeof value === 'function' || isSignal(value);
}

/** Lê o valor atual de um `Bindable` (signal | função | cru). */
export function read<T>(value: Bindable<T>): T {
  if (isSignal(value)) return getAdapter().getValue<T>(value);
  if (typeof value === 'function') return (value as () => T)();
  return value as T;
}

/**
 * Liga uma fonte reativa a um efeito colateral. Se `source` for reativo
 * (signal|função), roda `apply` dentro de um `effect` e registra o stop no escopo
 * atual; caso contrário aplica uma única vez.
 */
export function bind<T>(source: Bindable<T>, apply: (value: T) => void): void {
  if (isReactive(source)) {
    const stop = getAdapter().effect(() => apply(read(source)));
    registerCleanup(stop);
  } else {
    apply(source as T);
  }
}
