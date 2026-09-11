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
export declare function compose<Ev extends Event>(handler: Handler<Ev>, mods: Modifier<Ev>[]): Handler<Ev>;
declare function handleFn<Ev extends Event>(handler: Handler<Ev>, ...mods: Modifier<Ev>[]): Handler<Ev>;
type HandlerSpec<Ev extends Event = Event> = Handler<Ev> | [Handler<Ev>, ...Modifier<Ev>[]];
declare function handlers<T extends Record<string, HandlerSpec>>(map: T): Record<keyof T, Handler>;
export declare const handle: typeof handleFn & {
    prevent: Modifier<any>;
    stop: Modifier<any>;
    self: Modifier<any>;
    keys: (...allowed: string[]) => Modifier<KeyboardEvent>;
    alt: Modifier<MouseEvent | KeyboardEvent>;
    ctrl: Modifier<MouseEvent | KeyboardEvent>;
    shift: Modifier<MouseEvent | KeyboardEvent>;
    meta: Modifier<MouseEvent | KeyboardEvent>;
    debounce: (ms: number, opts?: DebounceOptions) => Modifier<any>;
    throttle: (ms: number, opts?: ThrottleOptions) => Modifier<any>;
    handlers: typeof handlers;
};
export {};
