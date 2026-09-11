/**
 * `$` = namespace de factories de tag (`$.div`, `$.p`, …) — só manipulação de DOM.
 * Os recursos do mini-q são exports **nomeados** com prefixo `$` (`$mount`, `$when`,
 * `$handle`, `$model`, `$useSignal`, …), importados à parte. O engine de CSS mora no
 * entry opcional `mini-q/style`.
 */
import type { Child, NonEmptyFn, Props, SetupFn, TagElement, TagName } from './types';
/**
 * Factory de uma tag: componente (setup, ≥1 param) | filho reativo (0-param) |
 * elemento (props+children). A aridade desambigua o 1º arg função.
 */
export interface TagFactory<T extends TagName> {
    <P = Record<string, unknown>, F extends SetupFn<T, P> = SetupFn<T, P>>(setup: NonEmptyFn<F>): (props: P) => TagElement<T>;
    (child: () => unknown): TagElement<T>;
    (props?: Props<T>, ...children: Child[]): TagElement<T>;
    (...children: Child[]): TagElement<T>;
}
/** O `$`: dicionário de factories de tag (sem seletor, sem helpers). */
export type MiniQuery = {
    [T in Exclude<TagName, 'style'>]: TagFactory<T>;
};
declare const $: MiniQuery;
export default $;
export { mount as $mount } from './mount';
export { when as $when, match as $match, switchOn as $switch, ELSE as $else, appendChild as $append, each as $each, } from './element';
export { onMounted as $onMounted, onUnmounted as $onUnmounted } from './lifecycle';
export { useSignal as $useSignal } from './reactive';
export { handle as $handle } from './events/handle';
export { on as $on } from './events/apply';
export { registerCustomEvent as $registerCustomEvent } from './events/custom';
export { model as $model, show as $show } from './behaviors';
export { useTeleport as $useTeleport } from './behaviors';
export { cx as $cx } from './dom/nodes';
export declare const $handlers: <T extends Record<string, import("./events").Handler<Event> | [import("./events").Handler<Event>, ...import("./events").Modifier<Event>[]]>>(map: T) => Record<keyof T, import("./events").Handler>;
export { createTag } from './element';
export { compose } from './events/handle';
export { getCustomEvent } from './events/custom';
export { applyUse } from './behaviors';
export { isSignal, isReactive, read, bind, untrack, setValue } from './reactive';
export type { ReactiveAdapter, Bindable } from './reactive';
export type { Cleanup, Scope } from './lifecycle';
export type { MQ, Props, PropsOf, Component, ComponentTuple, Behavior, ClassValue, TagName, TagElement, Child, } from './types';
export type { Handler, PairedHandler, Modifier, DebounceOptions, ThrottleOptions, HoverOptions, OnValue, OnMap, MQCustomEventMap, MQCustomEventOptions, EventSource, } from './events';
