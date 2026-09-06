/** Monta o `$`: selector + factories de tag + mount/handle/when/style/useSignal. */

import { createTag, when, appendChild } from './element';
import { mount } from './mount';
import { useSignal } from './reactive';
import { handle } from './events/handle';
import { registerCustomEvent } from './events/custom';
import { cx, getElement } from './dom/nodes';
import { style, parts } from './style';
import { model, show } from './behaviors';
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
// 'style' fica de fora dos factories: `$.style` é a função de CSS.

/** Factory de uma tag: componente (setup) ou elemento (props+children). */
export interface TagFactory<T extends TagName> {
  <P = Record<string, unknown>>(
    setup: (props: P, ctx: MQ<TagElement<T>>) => unknown,
  ): (props: P) => TagElement<T>;
  (props?: Props<T>, ...children: unknown[]): TagElement<T>;
  (...children: unknown[]): TagElement<T>;
}

type Factories = { [T in Exclude<TagName, 'style'>]: TagFactory<T> };

export interface MiniQuery extends Factories {
  <E extends Element = Element>(target: string | E): MQ<E>;
  mount: typeof mount;
  useSignal: typeof useSignal;
  handle: typeof handle;
  handlers: typeof handle.handlers;
  when: typeof when;
  append: typeof appendChild;
  cx: typeof cx;
  style: typeof style;
  parts: typeof parts;
  model: typeof model;
  show: typeof show;
  registerCustomEvent: typeof registerCustomEvent;
}

function query<E extends Element = Element>(target: string | E): MQ<E> {
  return { element: getElement(target) as E };
}

const $ = query as unknown as MiniQuery;

for (const tag of TAGS) {
  ($ as unknown as Record<string, unknown>)[tag] = (...args: unknown[]) =>
    (createTag as (...a: unknown[]) => unknown)(tag, ...args);
}

Object.assign($, {
  mount,
  useSignal,
  handle,
  handlers: handle.handlers,
  when,
  append: appendChild,
  cx,
  style,
  parts,
  model,
  show,
  registerCustomEvent,
});

export default $;

export { createTag, when, appendChild } from './element';
export { mount } from './mount';
export { useSignal, isSignal, isReactive, read, bind } from './reactive';
export { handle, compose } from './events/handle';
export { registerCustomEvent, getCustomEvent } from './events/custom';
export { applyUse, model, show } from './behaviors';
export { cx } from './dom/nodes';
export { style, parts } from './style';
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
