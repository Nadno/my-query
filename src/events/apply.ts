/** Aplica `on: {}` a um elemento: resolve valor → handler+options, roteia nativo|custom. */

import { registerCleanup } from '../lifecycle';
import type { MQ } from '../types';
import { compose } from './handle';
import { getCustomEvent } from './custom';
import type { Handler, Modifier, OnValue } from './types';

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

export function applyEvents(
  ctx: MQ,
  onMap: Record<string, OnValue | undefined>,
): void {
  for (const name in onMap) {
    const raw = onMap[name];
    if (raw == null) continue;

    const { handler, options } = resolve(raw);
    const source = getCustomEvent(name);

    if (source) {
      const cleanup = source(ctx.element, (event) => handler(event, ctx));
      registerCleanup(cleanup);
    } else {
      const listener = (event: Event) => handler(event, ctx);
      ctx.element.addEventListener(name, listener, options);
      registerCleanup(() =>
        ctx.element.removeEventListener(name, listener, options),
      );
    }
  }
}
