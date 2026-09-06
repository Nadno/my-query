export * from './core/types';

import type {
  DOMEventOptions,
  DOMCustomEventKeyMap,
  DOMModifiers,
} from '@/dom-events/types';

export interface MyQueryBase<
  T extends keyof HTMLElementInstanceMap = 'Element',
> {
  element: HTMLElementInstanceMap[T];
}

// MQEventOptions is an alias for DOMEventOptions
export type MQEventOptions = DOMEventOptions;

export type MQEventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap;

export type MQEventKeyMap =
  | keyof WindowEventMap
  | keyof DocumentEventMap
  | keyof HTMLElementEventMap;

/**
 * Custom event map — extends DOMCustomEventKeyMap.
 * Add your own via declaration merging:
 *
 * @example
 * declare module '@/mini-stack/query/types' {
 *   interface MQCustomEventKeyMap {
 *     ':my-event': CustomEvent<{ data: string }>;
 *   }
 * }
 */
export interface MQCustomEventKeyMap extends DOMCustomEventKeyMap {}

/**
 * Modifier map — extends DOMModifiers.
 * Add your own via declaration merging:
 *
 * @example
 * declare module '@/mini-stack/query/types' {
 *   interface MQModifiers {
 *     '.throttle': { delay: number };
 *   }
 * }
 */
export interface MQModifiers extends DOMModifiers {}

export type MQModifierDeclaration =
  | keyof MQModifiers
  | { $$: keyof MQModifiers; $?: any; [key: string]: any };

export interface MQEventHandler<T extends Window | Document | Element> {
  target: T;

  on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  /**
   * Declarative event listener registration with modifiers support.
   *
   * @param declarations - Array containing event name and optional modifiers
   * @param handler - Event handler function with properly typed event parameter
   * @param options - Optional event listener options
   *
   * @example
   * // Standard DOM event with modifiers
   * $element.$on(['click', 'once', 'prevent'], (e: MouseEvent) => {
   *   console.log(e.clientX, e.clientY);
   * });
   *
   * @example
   * // Custom event with modifiers
   * $element.$on([':click-outside', 'once'], (e: PointerEvent) => {
   *   console.log('Clicked outside!');
   * });
   *
   * @example
   * // Event with object-style declaration for parameters
   * $element.$on([{ $$: 'click' }, 'prevent'], (e: MouseEvent) => {
   *   console.log('Click prevented');
   * });
   *
   * @example
   * // Delegation with modifiers
   * $element.$on([{ $$: 'click', $: '.button' }, 'prevent'], (e: MouseEvent) => {
   *   console.log('Delegated click on .button');
   * });
   *
   * @remarks
   * Available modifiers:
   * - `'once'` - Execute handler only once
   * - `'prevent'` - Call preventDefault on the event
   * - `'self'` - Only trigger if event.target === element
   * - `'capture'` - Use capture phase
   * - `{ $$: 'delegate', $: 'selector' }` - Delegate to child elements
   */
  // $on overloads for standard DOM events
  $on<TEvent extends keyof WindowEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $on<TEvent extends keyof DocumentEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $on<TEvent extends keyof HTMLElementEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  // $on overloads for custom events
  $on<TEvent extends keyof MQCustomEventKeyMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: MQCustomEventKeyMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $on<TEvent extends keyof MQCustomEventKeyMap>(
    declarations: [
      { $$: TEvent; [key: string]: any },
      ...MQModifierDeclaration[],
    ],
    handler: (e: MQCustomEventKeyMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  // $on fallback for string events (with Event type)
  $on(
    declarations: [
      string | { $$: string; [key: string]: any },
      ...MQModifierDeclaration[],
    ],
    handler: (e: Event) => void,
    options?: MQEventOptions,
  ): this;

  /**
   * Remove event listener registered with $on.
   *
   * @param declarations - Array containing event name and optional modifiers (must match $on call)
   * @param handler - Event handler function to remove (must be the same reference as in $on)
   * @param options - Optional event listener options (must match $on call)
   *
   * @example
   * // Remove standard DOM event listener
   * const handler = (e: MouseEvent) => console.log(e.clientX);
   * $element.$on(['click', 'prevent'], handler);
   * $element.$off(['click', 'prevent'], handler);
   *
   * @example
   * // Remove custom event listener
   * const handler = (e: PointerEvent) => console.log('Outside click');
   * $element.$on([':click-outside'], handler);
   * $element.$off([':click-outside'], handler);
   *
   * @remarks
   * The declarations array must match exactly what was passed to $on, including modifiers.
   * The handler must be the same function reference (not a new function with the same code).
   */
  // $off overloads for standard DOM events
  $off<TEvent extends keyof WindowEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $off<TEvent extends keyof DocumentEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $off<TEvent extends keyof HTMLElementEventMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  // $off overloads for custom events
  $off<TEvent extends keyof MQCustomEventKeyMap>(
    declarations: [TEvent, ...MQModifierDeclaration[]],
    handler: (e: MQCustomEventKeyMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;
  $off<TEvent extends keyof MQCustomEventKeyMap>(
    declarations: [
      { $$: TEvent; [key: string]: any },
      ...MQModifierDeclaration[],
    ],
    handler: (e: MQCustomEventKeyMap[TEvent]) => void,
    options?: MQEventOptions,
  ): this;

  // $off fallback for string events (with Event type)
  $off(
    declarations: [
      string | { $$: string; [key: string]: any },
      ...MQModifierDeclaration[],
    ],
    handler: (e: Event) => void,
    options?: MQEventOptions,
  ): this;
}

// export interface MQSelection<T extends keyof HTMLElementInstanceMap>
//   extends MyQueryBase<T> {
//   query<T extends keyof HTMLElementInstanceMap>(query: string): MQCore<T>;
//   find<T extends keyof HTMLElementInstanceMap>(query: string): MQCore<T> | null;
//   findAll<T extends keyof HTMLElementInstanceMap>(query: string): T[];
//   child<T extends keyof HTMLElementInstanceMap>(
//     query: string,
//   ): MQCore<T> | null;
//   children<T extends keyof HTMLElementInstanceMap>(query: string): T[];
//   closest<T extends keyof HTMLElementInstanceMap>(
//     query: string,
//   ): MQCore<T> | null;
//   next<S extends keyof HTMLElementInstanceMap = T>(
//     query?: string,
//   ): MQCore<S> | null;
//   prev<S extends keyof HTMLElementInstanceMap = T>(
//     query?: string,
//   ): MQCore<S> | null;
//   nextAll<S extends keyof HTMLElementInstanceMap = T>(query?: string): S[];
//   prevAll<S extends keyof HTMLElementInstanceMap = T>(query?: string): S[];
// }

// export interface MQUtils<T extends keyof HTMLElementInstanceMap>
//   extends MyQueryBase<T> {
//   is(selectors: Array<string | Element | null>): boolean;
//   is(element: Element | null): boolean;
//   is(selector: string): boolean;

//   matches(selector: string): boolean;
//   matches(selectors: string[]): boolean;

//   hasFocus(): boolean;
//   contains(node: null | Node): boolean;
// }

// export interface MQManipulation<T extends keyof HTMLElementInstanceMap>
//   extends MyQueryBase<T> {
//   html(raw: string): this;
//   html(): string;

//   text(text: string): this;
//   text(): string;

//   replace(newElement: Element | MyQueryBase): this;
//   replace(selector: string): this;
//   swap(element: Element | MyQueryBase): this;
//   swap(selector: string): this;

//   before(...elements: Array<string | Element | MyQueryBase>): this;
//   prepend(...elements: Array<string | Element | MyQueryBase>): this;
//   append(...elements: Array<string | Element | MyQueryBase>): this;
//   after(...elements: Array<string | Element | MyQueryBase>): this;

//   beforeHTML(...raws: string[]): this;
//   prependHTML(...raws: string[]): this;
//   appendHTML(...raws: string[]): this;
//   afterHTML(...raws: string[]): this;

//   beforeText(...texts: string[]): this;
//   prependText(...texts: string[]): this;
//   appendText(...texts: string[]): this;
//   afterText(...texts: string[]): this;

//   beforeElement(...elements: Array<Element | MyQueryBase>): this;
//   appendElement(...elements: Array<Element | MyQueryBase>): this;
//   prependElement(...elements: Array<Element | MyQueryBase>): this;
//   afterElement(...elements: Array<Element | MyQueryBase>): this;

//   clear(): this;
//   remove(): this;
// }

export type MQAttributeValue = string | boolean | number;

// export interface MQClassList<T extends keyof HTMLElementInstanceMap>
//   extends MyQueryBase<T> {
//   add(...tokens: string[]): this;
//   has(token: string): boolean;
//   remove(...tokens: string[]): this;
//   replace(token: string, newToken: string): boolean;
//   supports(token: string): boolean;
//   toggle(tokens: Record<string, boolean | undefined>): this;
//   toggle(token: string, force?: boolean): boolean;
// }

// export interface MQDataSet<T extends keyof HTMLElementInstanceMap>
//   extends MyQueryBase<T> {
//   has(name: string): boolean;
//   has(name: string, value: MQAttributeValue): boolean;

//   get(name: string): MQAttributeValue | undefined;
//   get<TValue>(name: string): TValue | undefined;
//   get<TValue extends object = Record<string, any>>(
//     keys: Array<keyof TValue>,
//   ): TValue;
//   get<TValue>(name: string, defaultValue: TValue): TValue;
//   get<TValue extends object = Record<string, any>>(
//     prefix: string,
//     keys: Array<keyof TValue>,
//   ): TValue;

//   set(name: string, value: MQAttributeValue): this;

//   remove(name: string): MQAttributeValue | undefined;
//   remove<TValue>(name: string): TValue | undefined;
//   remove<TValue extends object = Record<string, any>>(
//     keys: Array<keyof TValue>,
//   ): TValue;
//   remove<TValue extends object = Record<string, any>>(
//     prefix: string,
//     keys: Array<keyof TValue>,
//   ): TValue;

//   assign(data: Record<string, MQAttributeValue>): this;
//   assign(prefix: string, data: Record<string, MQAttributeValue>): this;
// }

// export interface MQCore<E extends keyof HTMLElementInstanceMap>
//   extends MQSelection<E>,
//     MQManipulation<E>,
//     MQUtils<E>,
//     MQEventHandler<E> {
//   data: E extends HTMLElement ? MQDataSet<E> : undefined;
//   classlist: MQClassList<E>;
// }

export interface MQCore<E extends keyof HTMLElementInstanceMap> {
  element: HTMLElementInstanceMap[E];
}

export interface MQCoreStatic {}

export type MQFunction = {
  <E extends keyof HTMLElementInstanceMap = 'Element'>(
    el: HTMLElementInstanceMap[E] | MQCore<E>,
  ): MQCore<E>;
  <E extends keyof HTMLElementInstanceMap = 'Element'>(
    selector: string,
  ): MQCore<E> | null;
  // (win: Window): MQEventHandler<Window>;
  // (doc: Document): MQEventHandler<Document>;

  $static(...args: Record<string, any>[]): void;
  $extend<TProto extends object = MQCore<'Element'>>(
    ...args: (Record<string, any> & ThisType<TProto>)[]
  ): void;

  fn<E extends keyof HTMLElementInstanceMap = 'Element'>(
    queryOrElement: string | HTMLElementInstanceMap[E] | MQCore<E>,
  ): MQCore<E> | null;
  getElement<E extends keyof HTMLElementInstanceMap>(
    elementOrSelector: string | HTMLElementInstanceMap[E] | MQCore<E>,
  ): HTMLElementInstanceMap[E] | null;
  elementFrom<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E] | MQCore<E> | Element,
  ): HTMLElementInstanceMap[E];
  isMQInstance<E extends keyof HTMLElementInstanceMap>(
    element: any,
  ): element is MQCore<E>;
  use<TOptions extends object>(
    plugin: MQPlugin<TOptions>,
    options?: TOptions,
  ): void;
  use(plugin: MQPlugin): void;
  mount: MQMountComponent;
} & MQCoreStatic;

export type MQComponentBaseProps<TRef = HTMLElement> = { ref?: TRef } & Record<
  string,
  any
>;

export type MQComponent<
  TTag extends keyof HTMLElementInstanceMap,
  TProps extends MQComponentBaseProps<HTMLElementInstanceMap[TTag]> = {},
> = (props: {
  [K in keyof TProps]: TProps[K] | BindableValue<TProps[K]>;
}) => HTMLElementInstanceMap[TTag];

export type MQComponentFactory<
  TTag extends keyof HTMLElementInstanceMap,
  TProps extends MQComponentBaseProps<HTMLElementInstanceMap[TTag]> = {},
> = (props: {
  [K in keyof TProps]: TProps[K] | BindableValue<TProps[K]>;
}) => (HTMLAttributesOf<TTag> & { children?: any }) | (Element | string)[];

export type MQMountComponent = <TProps extends MQComponentBaseProps>(
  target: string | Element,
  component: Element | (() => Element),
  props: TProps,
) => void;

export type MQCreateTag = {
  <
    TTag extends keyof HTMLElementInstanceMap,
    TProps extends MQComponentBaseProps<HTMLElementInstanceMap[TTag]>,
  >(
    tag: TTag,
    component: MQComponentFactory<TTag, TProps>,
  ): MQComponent<TTag, TProps>;
  <TTag extends keyof HTMLElementInstanceMap>(
    tag: TTag,
    props?: MQComponentBaseProps<HTMLElementInstanceMap[TTag]> &
      HTMLAttributesOf<TTag>,
    ...children: any[]
  ): HTMLElementInstanceMap[TTag];
  <TTag extends keyof HTMLElementInstanceMap>(
    tag: TTag,
    ...children: any[]
  ): HTMLElementInstanceMap[TTag];
};

export type MQCreateTagMap<TTag extends keyof HTMLElementInstanceMap> = {
  <TProps extends MQComponentBaseProps<HTMLElementInstanceMap[TTag]> = {}>(
    component: MQComponentFactory<TTag, TProps>,
  ): MQComponent<TTag, TProps>;
  (
    props?: MQComponentBaseProps<HTMLElementInstanceMap[TTag]> &
      HTMLAttributesOf<TTag> & {
        [K in keyof HTMLAttributesOf<TTag>]: HTMLAttributesOf<TTag>[K] | BindableValue<HTMLAttributesOf<TTag>[K]>;
      },
    ...children: any[]
  ): HTMLElementInstanceMap[TTag];
  (...children: any[]): HTMLElementInstanceMap[TTag];
};

import {
  HTMLAttributesOf,
  HTMLElementInstanceMap,
  HTMLElementToAttributesMap,
} from '@/html-types';
import { MQDirective } from './types/directive';
import { MQPlugin } from './core/types';
import { BindableValue } from './builder/binder';
