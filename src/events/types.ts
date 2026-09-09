/** Tipos de eventos: handler, modificador, valor de `on`, mapa de custom events. */

import type { Cleanup } from '../lifecycle';
import type { MQ } from '../types';

/**
 * Handler de evento **nativo**: o retorno é ignorado (`void` aceita qualquer retorno —
 * `on: { click: () => count.value++ }` funciona). Para o retorno do "un-enter" de um
 * custom event pareado, use `PairedHandler`.
 */
export type Handler<Ev extends Event = Event, E extends Element = Element> = (
  event: Ev,
  ctx: MQ<E>,
) => void;

/**
 * Handler de **custom event pareado** (enter↔leave): pode devolver o `Cleanup` do
 * "un-enter" — a fonte o guarda e o roda quando o leave acontece. Mesmo idioma do
 * `$onMounted(() => () => cleanup)`.
 */
export type PairedHandler<Ev extends Event = Event, E extends Element = Element> = (
  event: Ev,
  ctx: MQ<E>,
) => void | Cleanup;

export type Modifier<Ev extends Event = Event> = (
  next: Handler<Ev>,
) => Handler<Ev>;

/** Opções estilo lodash para `handle.debounce`. */
export type DebounceOptions = {
  /** Dispara na 1ª chamada da rajada (síncrono → propaga o retorno). Default `false`. */
  leading?: boolean;
  /** Dispara a última chamada após `ms`. Default `true`. */
  trailing?: boolean;
  /** Atraso máximo antes de invocar (no mínimo 1 a cada `maxWait`). */
  maxWait?: number;
};

/** Opções estilo lodash para `handle.throttle`. */
export type ThrottleOptions = {
  /** Dispara na 1ª chamada da janela (síncrono → propaga o retorno). Default `true`. */
  leading?: boolean;
  /** Dispara a última chamada no fim da janela. Default `true`. */
  trailing?: boolean;
};

/** Valor de uma chave de `on`: handler cru, ou `[handler, ...mods, options?]`. */
export type OnValue<
  Ev extends Event = Event,
  E extends Element = Element,
  H extends (event: Ev, ctx: MQ<E>) => unknown = Handler<Ev, E>,
> = H | readonly [H, ...(Modifier<Ev> | AddEventListenerOptions)[]];

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
  interactOutside: PointerEvent;
  hover: MouseEvent;
}

export type OnMap<E extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: OnValue<HTMLElementEventMap[K], E>;
} & {
  // Custom events são pareados: o handler pode devolver o cleanup do "un-enter".
  [K in keyof MQCustomEventMap]?: OnValue<
    MQCustomEventMap[K],
    E,
    PairedHandler<MQCustomEventMap[K], E>
  >;
} & {
  // Fallback p/ nomes de evento arbitrários (custom events). `any` no tipo do
  // evento evita o conflito de variância com as chaves tipadas acima: uma tupla
  // com `Modifier<KeyboardEvent>` não é atribuível a `OnValue<Event>`, mas é a `OnValue<any>`.
  [event: string]: OnValue<any, E> | undefined;
};
