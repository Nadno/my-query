/**
 * `handle` — objeto callable que compõe modificadores de handler.
 *
 * `handle(fn, keys('Enter'), alt, prevent)` embrulha `fn` da direita p/ esquerda,
 * de forma que o primeiro modificador é o mais externo (roda primeiro).
 *
 * Os modificadores **propagam o retorno** do handler (`return next(e, ctx)`): num
 * custom event pareado (enter↔leave), o cleanup do "un-enter" atravessa os
 * modificadores até a fonte. Exceção: invocações **assíncronas** de `debounce`/
 * `throttle` (trailing/`maxWait`) — o retorno morre no `setTimeout` (o handler roda
 * depois, sem quem capturar). Invocações **síncronas** (leading) propagam.
 */

import type { Handler, Modifier, DebounceOptions, ThrottleOptions } from './types';
import type { MQ } from '../types';

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

const prevent: Modifier<any> = (next) => (e, ctx) => {
  e.preventDefault();
  return next(e, ctx);
};

const stop: Modifier<any> = (next) => (e, ctx) => {
  e.stopPropagation();
  return next(e, ctx);
};

const self: Modifier<any> = (next) => (e, ctx) => {
  if (e.target === ctx.element) return next(e, ctx);
};

const keys =
  (...allowed: string[]): Modifier<KeyboardEvent> =>
  (next) =>
  (e, ctx) => {
    if (allowed.includes(e.key)) return next(e, ctx);
  };

const sysKey =
  (flag: 'altKey' | 'ctrlKey' | 'shiftKey' | 'metaKey'): Modifier<KeyboardEvent | MouseEvent> =>
  (next) =>
  (e, ctx) => {
    if ((e as KeyboardEvent | MouseEvent)[flag]) return next(e, ctx);
  };

/**
 * `debounce(ms, { leading?, trailing?, maxWait? })` — estilo lodash. `leading` dispara
 * na 1ª chamada da rajada (síncrono → propaga o retorno); `trailing` (default) dispara
 * a última após `ms`; `maxWait` limita o atraso máximo (no mínimo 1 a cada `maxWait`).
 * Invocações assíncronas (trailing/`maxWait`) não propagam o retorno.
 */
const debounce =
  (ms: number, opts: DebounceOptions = {}): Modifier<any> =>
  (next) => {
    const { leading = false, trailing = true, maxWait } = opts;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let maxTimer: ReturnType<typeof setTimeout> | undefined;
    let pending: [Event, MQ] | undefined;
    let lastInvoke = 0;

    const invoke = (e: Event, ctx: MQ) => {
      lastInvoke = Date.now();
      pending = undefined;
      if (timer) { clearTimeout(timer); timer = undefined; }
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = undefined; }
      // Assíncrono: o retorno do handler morre aqui (ninguém captura).
      next(e, ctx);
    };

    return (e, ctx) => {
      const now = Date.now();
      const shouldInvoke = leading && now - lastInvoke >= ms;

      if (shouldInvoke) {
        lastInvoke = now;
        pending = undefined;
        if (timer) { clearTimeout(timer); timer = undefined; }
        if (maxTimer) { clearTimeout(maxTimer); maxTimer = undefined; }
        // Síncrono: propaga o retorno (cleanup do un-enter atravessa).
        return next(e, ctx);
      }

      if (!trailing) return;

      pending = [e, ctx];
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        if (pending) invoke(...pending);
      }, ms);

      if (maxWait && !maxTimer) {
        const elapsed = lastInvoke === 0 ? 0 : now - lastInvoke;
        maxTimer = setTimeout(() => {
          maxTimer = undefined;
          if (pending) invoke(...pending);
        }, Math.max(0, maxWait - elapsed));
      }
    };
  };

/**
 * `throttle(ms, { leading?, trailing? })` — estilo lodash (default `{ leading: true,
 * trailing: true }`). Implementado como `debounce(ms, { leading, trailing, maxWait: ms })`.
 * Leading propaga o retorno (síncrono); trailing não.
 */
const throttle =
  (ms: number, opts: ThrottleOptions = {}): Modifier<any> =>
  (next) => {
    const { leading = true, trailing = true } = opts;
    return debounce(ms, { leading, trailing, maxWait: ms })(next);
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
