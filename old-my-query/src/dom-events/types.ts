export type DOMEventOptions = AddEventListenerOptions & {
  delegatedTarget?: string;
};

export type DOMEventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap;

export type DOMEventKeyMap =
  | keyof WindowEventMap
  | keyof DocumentEventMap
  | keyof HTMLElementEventMap;

/**
 * Custom event map — extend via declaration merging to add your own custom events.
 *
 * @example
 * declare module '@/dom-events/types' {
 *   interface DOMCustomEventKeyMap {
 *     ':my-event': CustomEvent<{ data: string }>;
 *   }
 * }
 */
export interface DOMCustomEventKeyMap {
  ':click-outside': PointerEvent;
  ':focus-outside': FocusEvent;
  ':interact-outside': PointerEvent | FocusEvent;
  ':hover': MouseEvent;
}

/**
 * Modifier map — extend via declaration merging to add your own modifiers.
 *
 * @example
 * declare module '@/dom-events/types' {
 *   interface DOMModifiers {
 *     '.throttle': { delay: number };
 *   }
 * }
 */
export interface DOMModifiers {
  '.once': {};
  '.prevent': {};
  '.self': {};
  '.capture': {};
  '.delegate': { delegatedTarget: string };
}

export type DOMModifierDeclaration =
  | keyof DOMModifiers
  | { $$: keyof DOMModifiers; $?: any; [key: string]: any };

/**
 * Narrows `event.target` and `event.currentTarget` to a specific element type,
 * preserving all other event properties and methods.
 *
 * @example
 * const handler = (e: TargetedEvent<InputEvent, HTMLInputElement>) => {
 *   e.target.value; // HTMLInputElement
 * };
 */
export type TargetedEvent<TEvent extends Event, TTarget extends EventTarget> =
  TEvent & {
    readonly target: TTarget;
    readonly currentTarget: TTarget;
  };
