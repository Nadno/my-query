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

/**
 * Valor de uma chave de `on`: handler cru, ou `[handler, ...mods, options?]`.
 *
 * O objeto no fim da tupla é **tipado por evento**: `AddEventListenerOptions` para eventos
 * nativos, as **opções da fonte** para custom events (via `MQCustomEventOptions`). Quem decide
 * os listeners DOM de um custom event é a fonte — o objeto da tupla é o canal de opções dela.
 */
export type OnValue<
  Ev extends Event = Event,
  E extends Element = Element,
  H extends (event: Ev, ctx: MQ<E>) => unknown = Handler<Ev, E>,
  Opts = AddEventListenerOptions,
> = H | readonly [H, ...(Modifier<Ev> | Opts)[]];

/** Opções do custom event `hover` (hold-to-hover). */
export type HoverOptions = {
  /** Atraso para entrar no hover (ms). Default `0`. */
  delayIn?: number;
  /** Atraso para sair do hover (ms). Default `0`. */
  delayOut?: number;
  /** Suporta touch via hold-to-hover (segurar o dedo = hover, soltar = sair). Default `false`. */
  touchable?: boolean;
  /** Tempo de segurar para virar hover no touch (ms). Default `500`. */
  holdDelay?: number;
};

/**
 * Custom events — estenda via declaration merging para adicionar os seus.
 *
 * @example
 * declare module 'mini-q/events/types' {
 *   interface MQCustomEventMap { longpress: PointerEvent }
 *   interface MQCustomEventOptions { longpress: LongpressOptions }
 * }
 */
export interface MQCustomEventMap {
  clickOutside: PointerEvent;
  focusOutside: FocusEvent;
  interactOutside: PointerEvent;
  hover: PointerEvent;
}

/**
 * Opções da fonte por custom event — estenda via declaration merging junto do
 * `MQCustomEventMap`. `never` = o evento não aceita objeto no fim da tupla.
 */
export interface MQCustomEventOptions {
  clickOutside: never;
  focusOutside: never;
  interactOutside: never;
  hover: HoverOptions;
}

export type OnMap<E extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: OnValue<HTMLElementEventMap[K], E>;
} & {
  // Custom events são pareados: o handler pode devolver o cleanup do "un-enter".
  // O objeto no fim da tupla são as **opções da fonte** (MQCustomEventOptions).
  [K in keyof MQCustomEventMap]?: OnValue<
    MQCustomEventMap[K],
    E,
    PairedHandler<MQCustomEventMap[K], E>,
    MQCustomEventOptions[K]
  >;
} & {
  // Fallback p/ nomes de evento arbitrários (custom events). `any` no tipo do
  // evento evita o conflito de variância com as chaves tipadas acima: uma tupla
  // com `Modifier<KeyboardEvent>` não é atribuível a `OnValue<Event>`, mas é a `OnValue<any>`.
  // `never` nas opções: evento arbitrário aceita handler cru e modificadores, mas
  // **não** objeto na tupla — opções exigem estender `MQCustomEventOptions`.
  [event: string]: OnValue<any, E, Handler<any, E>, never> | undefined;
};
