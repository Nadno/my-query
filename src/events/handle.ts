/**
 * `handle` — objeto callable que compõe modificadores de handler.
 *
 * `handle(fn, keys('Enter'), alt, prevent)` embrulha `fn` da direita p/ esquerda,
 * de forma que o primeiro modificador é o mais externo (roda primeiro).
 */

import type { Handler, Modifier } from './types';

export function compose<Ev extends Event>(
  handler: Handler<Ev>,
  mods: Modifier<Ev>[],
): Handler<Ev> {
  let out = handler;
  for (let i = mods.length - 1; i >= 0; i--) out = mods[i]!(out);
  return out;
}

function handleFn<Ev extends Event>(
  handler: Handler<Ev>,
  ...mods: Modifier<Ev>[]
): Handler<Ev> {
  return compose(handler, mods);
}

const prevent: Modifier = (next) => (e, ctx) => {
  e.preventDefault();
  next(e, ctx);
};

const stop: Modifier = (next) => (e, ctx) => {
  e.stopPropagation();
  next(e, ctx);
};

const self: Modifier = (next) => (e, ctx) => {
  if (e.target === ctx.element) next(e, ctx);
};

const keys =
  (...allowed: string[]): Modifier<KeyboardEvent> =>
  (next) =>
  (e, ctx) => {
    if (allowed.includes(e.key)) next(e, ctx);
  };

const sysKey =
  (flag: 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey'): Modifier<KeyboardEvent | MouseEvent> =>
  (next) =>
  (e, ctx) => {
    if ((e as KeyboardEvent | MouseEvent)[flag]) next(e, ctx);
  };

const debounce =
  (ms: number): Modifier =>
  (next) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (e, ctx) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => next(e, ctx), ms);
    };
  };

const throttle =
  (ms: number): Modifier =>
  (next) => {
    let last = 0;
    return (e, ctx) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        next(e, ctx);
      }
    };
  };

type HandlerSpec<Ev extends Event = Event> =
  | Handler<Ev>
  | [Handler<Ev>, ...Modifier<Ev>[]];

function handlers<T extends Record<string, HandlerSpec>>(
  map: T,
): Record<keyof T, Handler> {
  const out = {} as Record<keyof T, Handler>;
  for (const name in map) {
    const spec = map[name];
    out[name] = Array.isArray(spec)
      ? compose(spec[0] as Handler, spec.slice(1) as Modifier[])
      : (spec as Handler);
  }
  return out;
}

export const handle = Object.assign(handleFn, {
  prevent,
  stop,
  self,
  keys,
  alt: sysKey('altKey'),
  ctrl: sysKey('ctrlKey'),
  shift: sysKey('shiftKey'),
  meta: sysKey('metaKey'),
  debounce,
  throttle,
  handlers,
});
