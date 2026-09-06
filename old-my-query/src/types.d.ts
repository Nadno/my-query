/* eslint-disable no-use-before-define */
export interface MyQueryBase<T extends Element = Element> {
  static use(plugin: MQPlugin): void;
  static getElement<TElement extends Element>(
    elementOrSelector: string | TElement | MyQueryBase<TElement>,
  ): TElement | null;

  static elementFrom<TElement extends Element>(
    element: TElement | MyQueryBase<TElement>,
  ): TElement;

  static isMQElement<TElement extends Element>(
    element: any,
  ): element is MyQueryBase<TElement>;

  element: T;
}

export type MQEventOptions = AddEventListenerOptions & {
  delegatedTarget?: string;
};

export type MQEventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap;

export type MQEventKeyMap =
  | keyof WindowEventMap
  | keyof DocumentEventMap
  | keyof HTMLElementEventMap;

/**
 * Custom event map interface that can be extended via declaration merging.
 *
 * This interface allows you to define custom events with their corresponding event types.
 * Custom events are prefixed with ':' and can be registered using QueryCustomEventHandler.register().
 *
 * @example
 * // Extend the interface to add your own custom events:
 * declare module '@/types' {
 *   interface MQCustomEventKeyMap {
 *     ':my-custom-event': CustomEvent<{ data: string }>;
 *   }
 * }
 *
 * // Then use it with proper typing:
 * $element.$on([':my-custom-event'], (e) => {
 *   console.log(e.detail.data); // TypeScript knows about the detail property
 * });
 *
 * @remarks
 * Built-in custom events:
 * - `:click-outside` - Triggered when clicking outside the element
 * - `:focus-outside` - Triggered when focus leaves the element
 * - `:interact-outside` - Triggered on click or focus outside
 * - `:hover` - Triggered on hover with debouncing support
 */
export interface MQCustomEventKeyMap {
  ':click-outside': PointerEvent;
  ':focus-outside': FocusEvent;
  ':interact-outside': PointerEvent | FocusEvent;
  ':hover': MouseEvent;
}

/**
 * Modifier map interface that can be extended via declaration merging.
 *
 * This interface allows you to define custom modifiers with their metadata types.
 * Modifiers are prefixed with '.' and can be registered using QueryHandlerModifiers.register().
 *
 * @example
 * // Extend the interface to add your own custom modifiers:
 * declare module '@/types' {
 *   interface MQModifiers {
 *     '.my-modifier': { customOption: boolean };
 *     '.another-modifier': { delay: number };
 *   }
 * }
 *
 * // Then use it with proper typing:
 * $element.$on(['click', '.my-modifier'], (e) => {
 *   console.log('Custom modifier applied');
 * });
 *
 * @remarks
 * Built-in modifiers:
 * - `.once` - Execute handler only once
 * - `.prevent` - Call preventDefault on the event
 * - `.self` - Only trigger if event.target === element
 * - `.capture` - Use capture phase
 * - `.delegate` - Delegate to child elements (requires selector parameter)
 */
export interface MQModifiers {
  '.once': {};
  '.prevent': {};
  '.self': {};
  '.capture': {};
  '.delegate': { delegatedTarget: string };
}

export type MQModifierDeclaration =
  | keyof MQModifiers
  | { $$: keyof MQModifiers; $?: any; [key: string]: any };

// Helper type to extract event type from event name
type ExtractEventType<TEvent extends string> =
  TEvent extends keyof WindowEventMap
    ? WindowEventMap[TEvent]
    : TEvent extends keyof DocumentEventMap
    ? DocumentEventMap[TEvent]
    : TEvent extends keyof HTMLElementEventMap
    ? HTMLElementEventMap[TEvent]
    : TEvent extends keyof MQCustomEventKeyMap
    ? MQCustomEventKeyMap[TEvent]
    : Event;

// Helper type to check if event is a custom event
type IsCustomEvent<TEvent extends string> =
  TEvent extends keyof MQCustomEventKeyMap ? true : false;

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

export interface MQSelection<T extends Element> extends MyQueryBase<T> {
  query<T extends Element>(query: string): IMyQuery<T>;
  find<T extends Element>(query: string): IMyQuery<T> | null;
  findAll<T extends Element>(query: string): T[];
  child<T extends Element>(query: string): IMyQuery<T> | null;
  children<T extends Element>(query: string): T[];
  closest<T extends Element>(query: string): IMyQuery<T> | null;
  next<S extends Element = T>(query?: string): IMyQuery<S> | null;
  prev<S extends Element = T>(query?: string): IMyQuery<S> | null;
  nextAll<S extends Element = T>(query?: string): S[];
  prevAll<S extends Element = T>(query?: string): S[];
}

export interface MQUtils<T extends Element> extends MyQueryBase<T> {
  is(selectors: Array<string | Element | null>): boolean;
  is(element: Element | null): boolean;
  is(selector: string): boolean;

  matches(selector: string): boolean;
  matches(selectors: string[]): boolean;

  hasFocus(): boolean;
  contains(node: null | Node): boolean;
}

export interface MQManipulation<T extends Element> extends MyQueryBase<T> {
  html(raw: string): this;
  html(): string;

  text(text: string): this;
  text(): string;

  replace(newElement: Element | MyQueryBase): this;
  replace(selector: string): this;
  swap(element: Element | MyQueryBase): this;
  swap(selector: string): this;

  before(...elements: Array<string | Element | MyQueryBase>): this;
  prepend(...elements: Array<string | Element | MyQueryBase>): this;
  append(...elements: Array<string | Element | MyQueryBase>): this;
  after(...elements: Array<string | Element | MyQueryBase>): this;

  beforeHTML(...raws: string[]): this;
  prependHTML(...raws: string[]): this;
  appendHTML(...raws: string[]): this;
  afterHTML(...raws: string[]): this;

  beforeText(...texts: string[]): this;
  prependText(...texts: string[]): this;
  appendText(...texts: string[]): this;
  afterText(...texts: string[]): this;

  beforeElement(...elements: Array<Element | MyQueryBase>): this;
  appendElement(...elements: Array<Element | MyQueryBase>): this;
  prependElement(...elements: Array<Element | MyQueryBase>): this;
  afterElement(...elements: Array<Element | MyQueryBase>): this;

  clear(): this;
  remove(): this;
}

export type MQAttributeValue = string | boolean | number;

export interface MQAttribute<T extends Element> extends MyQueryBase<T> {
  has(name: string): boolean;
  has(name: string, value: MQAttributeValue): boolean;
  get(name: string): MQAttributeValue | null;
  get<TValue>(name: string): TValue | null;
  get<TValue>(name: string, defaultValue: TValue): TValue;
  set(name: string, value: MQAttributeValue): this;
  remove(name: string): MQAttributeValue | null;
  remove<TValue>(name: string): TValue | null;
  assign(attributes: Record<string, MQAttributeValue>): this;
}

export interface MQClassList<T extends Element> extends MyQueryBase<T> {
  add(...tokens: string[]): this;
  has(token: string): boolean;
  remove(...tokens: string[]): this;
  replace(token: string, newToken: string): boolean;
  supports(token: string): boolean;
  toggle(tokens: Record<string, boolean | undefined>): this;
  toggle(token: string, force?: boolean): boolean;
}

export interface MQDataSet<T extends Element> extends MyQueryBase<T> {
  has(name: string): boolean;
  has(name: string, value: MQAttributeValue): boolean;

  get(name: string): MQAttributeValue | undefined;
  get<TValue>(name: string): TValue | undefined;
  get<TValue extends object = Record<string, any>>(
    keys: Array<keyof TValue>,
  ): TValue;
  get<TValue>(name: string, defaultValue: TValue): TValue;
  get<TValue extends object = Record<string, any>>(
    prefix: string,
    keys: Array<keyof TValue>,
  ): TValue;

  set(name: string, value: MQAttributeValue): this;

  remove(name: string): MQAttributeValue | undefined;
  remove<TValue>(name: string): TValue | undefined;
  remove<TValue extends object = Record<string, any>>(
    keys: Array<keyof TValue>,
  ): TValue;
  remove<TValue extends object = Record<string, any>>(
    prefix: string,
    keys: Array<keyof TValue>,
  ): TValue;

  assign(data: Record<string, MQAttributeValue>): this;
  assign(prefix: string, data: Record<string, MQAttributeValue>): this;
}

export type IMyQuery<T extends Element> = MQSelection<T> &
  MQManipulation<T> &
  MQUtils<T> &
  MQEventHandler<T> &
  MQDirective<T> & {
    data: T extends HTMLElement ? MQDataSet<T> : undefined;
    attribute: MQAttribute<T>;
    classlist: MQClassList<T>;
  };

import { MQPlugin } from './main';
import { MQDirective } from './types/directive';
