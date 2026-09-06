/** Tipos de eventos: handler, modificador, valor de `on`, mapa de custom events. */

import type { MQ } from '../types';

export type Handler<Ev extends Event = Event, E extends Element = Element> = (
  event: Ev,
  ctx: MQ<E>,
) => void;

export type Modifier<Ev extends Event = Event> = (
  next: Handler<Ev>,
) => Handler<Ev>;

/** Valor de uma chave de `on`: handler cru, ou `[handler, ...mods, options?]`. */
export type OnValue<Ev extends Event = Event, E extends Element = Element> =
  | Handler<Ev, E>
  | readonly [Handler<Ev, E>, ...(Modifier<Ev> | AddEventListenerOptions)[]];

/**
 * Custom events — estenda via declaration merging para adicionar os seus.
 *
 * @example
 * declare module 'mini-q/events/types' {
 *   interface MQCustomEventMap { longpress: PointerEvent }
 * }
 */
export interface MQCustomEventMap {
  clickOutside: PointerEvent;
  focusOutside: FocusEvent;
  hover: MouseEvent;
}

export type OnMap<E extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: OnValue<HTMLElementEventMap[K], E>;
} & {
  [K in keyof MQCustomEventMap]?: OnValue<MQCustomEventMap[K], E>;
} & {
  [event: string]: OnValue<Event, E> | undefined;
};
