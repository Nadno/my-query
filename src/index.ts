/**
 * `$` = namespace de factories de tag (`$.div`, `$.p`, …) — só manipulação de DOM.
 * Os recursos do mini-q são exports **nomeados** com prefixo `$` (`$mount`, `$when`,
 * `$handle`, `$model`, `$useSignal`, …), importados à parte. O engine de CSS mora no
 * entry opcional `mini-q/style`.
 */

import { createTag } from './element';
import { handle } from './events/handle';
import type { MQ, Props, TagElement, TagName } from './types';

const TAGS: TagName[] = [
  'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
  'blockquote', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
  'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog',
  'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure',
  'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
  'hgroup', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
  'legend', 'li', 'main', 'map', 'mark', 'menu', 'meter', 'nav', 'object',
  'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress',
  'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'slot', 'small',
  'source', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td',
  'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'u',
  'ul', 'var', 'video', 'wbr',
];
// 'style' fica de fora dos factories (elemento raro; sem conflito de nome).

/** Factory de uma tag: componente (setup) ou elemento (props+children). */
export interface TagFactory<T extends TagName> {
  <P = Record<string, unknown>>(
    setup: (props: P, ctx: MQ<TagElement<T>>) => unknown,
  ): (props: P) => TagElement<T>;
  (props?: Props<T>, ...children: unknown[]): TagElement<T>;
  (...children: unknown[]): TagElement<T>;
}

/** O `$`: dicionário de factories de tag (sem seletor, sem helpers). */
export type MiniQuery = { [T in Exclude<TagName, 'style'>]: TagFactory<T> };

const $ = {} as MiniQuery;

for (const tag of TAGS) {
  ($ as unknown as Record<string, unknown>)[tag] = (...args: unknown[]) =>
    (createTag as (...a: unknown[]) => unknown)(tag, ...args);
}

export default $;

/* Recursos desaninhados — prefixo `$` (evita colisão com palavras reservadas). */
export { mount as $mount } from './mount';
export {
  when as $when,
  match as $match,
  switchOn as $switch,
  ELSE as $else,
  appendChild as $append,
} from './element';
export { onMounted as $onMounted, onUnmounted as $onUnmounted } from './lifecycle';
export { useSignal as $useSignal } from './reactive';
export { handle as $handle } from './events/handle';
export { registerCustomEvent as $registerCustomEvent } from './events/custom';
export { model as $model, show as $show } from './behaviors';
export { cx as $cx } from './dom/nodes';
export const $handlers = handle.handlers;

/* Baixo nível — exports bare (nunca estiveram no `$`). */
export { createTag } from './element';
export { compose } from './events/handle';
export { getCustomEvent } from './events/custom';
export { applyUse } from './behaviors';
export { isSignal, isReactive, read, bind, untrack } from './reactive';

export type { ReactiveAdapter, Bindable } from './reactive';
export type { Cleanup, Scope } from './lifecycle';
export type {
  MQ,
  Props,
  Component,
  ComponentTuple,
  Behavior,
  ClassValue,
  TagName,
  TagElement,
  Child,
} from './types';
export type { Handler, Modifier, OnValue, OnMap, MQCustomEventMap, EventSource } from './events';
