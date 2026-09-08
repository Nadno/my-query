/** Aplica `on: {}` a um elemento: resolve valor → handler+options, roteia nativo|custom. */

import { registerCleanup, type Cleanup } from '../lifecycle';
import type { MQ } from '../types';
import { compose } from './handle';
import { getCustomEvent } from './custom';
import type { Handler, Modifier, MQCustomEventMap, OnValue } from './types';

function resolve(value: OnValue): {
  handler: Handler;
  options?: AddEventListenerOptions;
} {
  if (typeof value === 'function') return { handler: value as Handler };

  const arr = value as readonly unknown[];
  const handler = arr[0] as Handler;
  const mods: Modifier[] = [];
  let options: AddEventListenerOptions | undefined;
  for (let i = 1; i < arr.length; i++) {
    const part = arr[i];
    if (typeof part === 'function') mods.push(part as Modifier);
    else if (part && typeof part === 'object') options = part as AddEventListenerOptions;
  }
  return { handler: compose(handler, mods), options };
}

/** Guarda um cleanup para que rodar mais de uma vez seja no-op (idempotente). */
function once(cleanup: Cleanup): Cleanup {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    cleanup();
  };
}

/**
 * Liga um único evento ao elemento e devolve o cleanup (idempotente), **sem**
 * registrá-lo no escopo — miolo compartilhado por `applyEvents` (loop) e `on` (avulso).
 */
function bindEvent(ctx: MQ, name: string, value: OnValue): Cleanup {
  const { handler, options } = resolve(value);
  const source = getCustomEvent(name);

  if (source) return once(source(ctx.element, (event) => handler(event, ctx)));

  const listener = (event: Event) => handler(event, ctx);
  ctx.element.addEventListener(name, listener, options);
  return once(() => ctx.element.removeEventListener(name, listener, options));
}

export function applyEvents(
  ctx: MQ,
  onMap: Record<string, OnValue | undefined>,
): void {
  for (const name in onMap) {
    const raw = onMap[name];
    if (raw == null) continue;
    registerCleanup(bindEvent(ctx, name, raw));
  }
}

/**
 * `on` — liga um evento a partir de um `ctx` (behaviors, setups): mesmo caminho do
 * `on: {}` (tupla `[handler, ...mods, options?]`, roteamento nativo|custom). Auto-registra
 * o teardown no escopo ativo e **retorna** o cleanup idempotente, para desligar antes se
 * quiser (chamada manual + teardown do escopo é seguro). Fora de escopo degrada em
 * silêncio, igual `applyEvents`.
 */
export function on<K extends keyof HTMLElementEventMap, E extends Element>(
  ctx: MQ<E>,
  name: K,
  value: OnValue<HTMLElementEventMap[K], E>,
): Cleanup;
export function on<K extends keyof MQCustomEventMap, E extends Element>(
  ctx: MQ<E>,
  name: K,
  value: OnValue<MQCustomEventMap[K], E>,
): Cleanup;
export function on<E extends Element>(
  ctx: MQ<E>,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: OnValue<any, E>,
): Cleanup;
export function on(ctx: MQ, name: string, value: OnValue): Cleanup {
  const cleanup = bindEvent(ctx, name, value);
  registerCleanup(cleanup);
  return cleanup;
}
