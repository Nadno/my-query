import { DOMEvent } from './event';
import { DOMEventOptions, DOMCustomEventKeyMap, TargetedEvent } from './types';

type DOMEventTarget = Element | Window | Document;

const _instances = new WeakMap<DOMEventTarget, DOMEvent<any>>();

function _getInstance(target: DOMEventTarget): DOMEvent<any> {
  let instance = _instances.get(target);
  if (!instance) {
    instance = new DOMEvent(target as any);
    _instances.set(target, instance);
  }
  return instance;
}

/**
 * Adds an event listener to a DOM target and returns a cleanup function.
 *
 * @example
 * const remove = $on(window, 'resize', handler);
 * remove(); // removes the listener
 *
 * @example
 * const remove = $on(button, 'click', handler, { once: true });
 * remove();
 */
export function $on<TEvent extends keyof WindowEventMap>(
  target: Window,
  event: TEvent,
  handler: (e: TargetedEvent<WindowEventMap[TEvent], Window>) => void,
  options?: DOMEventOptions,
): () => void;
export function $on<TEvent extends keyof DocumentEventMap>(
  target: Document,
  event: TEvent,
  handler: (e: TargetedEvent<DocumentEventMap[TEvent], Document>) => void,
  options?: DOMEventOptions,
): () => void;
export function $on<TTarget extends Element, TEvent extends keyof HTMLElementEventMap>(
  target: TTarget,
  event: TEvent,
  handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], TTarget>) => void,
  options?: DOMEventOptions,
): () => void;
export function $on(
  target: DOMEventTarget,
  event: string,
  handler: EventListener,
  options?: DOMEventOptions,
): () => void;
export function $on(
  target: DOMEventTarget,
  event: string,
  handler: EventListener,
  options?: DOMEventOptions,
): () => void {
  _getInstance(target).on(event as any, handler, options);
  return () => $off(target, event, handler, options);
}

/**
 * Removes an event listener from a DOM target.
 *
 * @example
 * $off(window, 'resize', handler);
 */
export function $off<TEvent extends keyof WindowEventMap>(
  target: Window,
  event: TEvent,
  handler: (e: TargetedEvent<WindowEventMap[TEvent], Window>) => void,
  options?: DOMEventOptions,
): void;
export function $off<TEvent extends keyof DocumentEventMap>(
  target: Document,
  event: TEvent,
  handler: (e: TargetedEvent<DocumentEventMap[TEvent], Document>) => void,
  options?: DOMEventOptions,
): void;
export function $off<TTarget extends Element, TEvent extends keyof HTMLElementEventMap>(
  target: TTarget,
  event: TEvent,
  handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], TTarget>) => void,
  options?: DOMEventOptions,
): void;
export function $off(
  target: DOMEventTarget,
  event: string,
  handler: EventListener,
  options?: DOMEventOptions,
): void;
export function $off(
  target: DOMEventTarget,
  event: string,
  handler: EventListener,
  options?: DOMEventOptions,
): void {
  _getInstance(target).off(event as any, handler, options);
}

/**
 * Declarative event listener with modifier support. Returns a cleanup function.
 * Supports modifiers (`once`, `prevent`, `self`, `capture`) and custom events (`:hover`, `:click-outside`, etc.)
 *
 * @example
 * const remove = $listen(button, ['click', 'once', 'prevent'], handler);
 * remove(); // removes the listener
 *
 * @example
 * const remove = $listen(dialog, [':click-outside', 'once'], handler);
 * remove();
 *
 * @example
 * const remove = $listen(list, [':hover', { $$: 'delegate', $: '.item' }], handler);
 * remove();
 */
export function $listen<TEvent extends keyof WindowEventMap>(
  target: Window,
  declarations: [TEvent, ...any[]],
  handler: (e: TargetedEvent<WindowEventMap[TEvent], Window>) => void,
  options?: DOMEventOptions,
): () => void;
export function $listen<TEvent extends keyof DocumentEventMap>(
  target: Document,
  declarations: [TEvent, ...any[]],
  handler: (e: TargetedEvent<DocumentEventMap[TEvent], Document>) => void,
  options?: DOMEventOptions,
): () => void;
export function $listen<TTarget extends Element, TEvent extends keyof HTMLElementEventMap>(
  target: TTarget,
  declarations: [TEvent, ...any[]],
  handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], TTarget>) => void,
  options?: DOMEventOptions,
): () => void;
export function $listen<TEvent extends keyof DOMCustomEventKeyMap>(
  target: DOMEventTarget,
  declarations: [TEvent, ...any[]],
  handler: (e: DOMCustomEventKeyMap[TEvent]) => void,
  options?: DOMEventOptions,
): () => void;
export function $listen(
  target: DOMEventTarget,
  declarations: [string, ...any[]],
  handler: EventListener,
  options?: DOMEventOptions,
): () => void;
export function $listen(
  target: DOMEventTarget,
  declarations: [string, ...any[]],
  handler: EventListener,
  options?: DOMEventOptions,
): () => void {
  _getInstance(target).$on(declarations as any, handler, options);
  return () => _getInstance(target).$off(declarations as any, handler, options);
}

/**
 * Registers multiple event listeners in a single batch, all tied to one
 * AbortController. Returns a cleanup function that removes every listener
 * registered inside the callback with a single `abort()` call.
 *
 * @example
 * const cleanup = $onBatch(el, (on, listen) => {
 *   on('click', handleClick);
 *   on('focus', handleFocus, { capture: true });
 *   listen([':click-outside'], handleOutside);
 * });
 * cleanup(); // all three listeners removed at once
 */
export function $onBatch(
  target: DOMEventTarget,
  callback: (
    on: (event: string, handler: EventListener, options?: DOMEventOptions) => void,
    listen: (declarations: [string, ...any[]], handler: EventListener, options?: DOMEventOptions) => void,
  ) => void,
): () => void {
  const controller = new AbortController();
  const { signal } = controller;

  const batchOn = (event: string, handler: EventListener, options?: DOMEventOptions) => {
    _getInstance(target).on(event as any, handler, { ...options, signal });
  };

  const batchListen = (
    declarations: [string, ...any[]],
    handler: EventListener,
    options?: DOMEventOptions,
  ) => {
    _getInstance(target).$on(declarations as any, handler, { ...options, signal });
  };

  callback(batchOn, batchListen);
  return () => controller.abort();
}
