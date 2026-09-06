/** `use` — aplicação de behaviors + behaviors base (model, show). */

import { registerCleanup } from './lifecycle';
import { bind, type Bindable } from './reactive';
import type { Behavior, MQ } from './types';

export function applyUse(ctx: MQ, use: Behavior | Behavior[]): void {
  const list = Array.isArray(use) ? use : [use];
  for (const behavior of list) {
    const cleanup = behavior(ctx);
    if (typeof cleanup === 'function') registerCleanup(cleanup);
  }
}

/** Signal com leitura e escrita de `.value` (contrato mínimo p/ two-way). */
export interface WritableSignal<T> {
  value: T;
}

/** Two-way binding para inputs/select/textarea. */
export function model<T extends string>(
  signal: WritableSignal<T>,
): Behavior<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  return (ctx) => {
    const el = ctx.element;
    bind(signal as unknown as Bindable<T>, (value) => {
      const next = value == null ? '' : String(value);
      if (el.value !== next) el.value = next;
    });
    const onInput = () => {
      signal.value = el.value as T;
    };
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  };
}

/** Alterna `hidden` conforme a condição (preserva estado, sem desmontar). */
export function show(cond: Bindable<boolean>): Behavior<HTMLElement> {
  return (ctx) => {
    bind(cond, (value) => {
      ctx.element.hidden = !value;
    });
  };
}
