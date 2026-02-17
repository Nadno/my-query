import { Type } from '@/mini-stack/primitives';
import { ModifierFactory } from './query-handler-modifiers';

export type EventHandlerModifierMeta = {
  target: EventTarget;
  options?: AddEventListenerOptions;
};

export type EventHandlerModifierFactory<TMeta extends object = {}> =
  ModifierFactory<EventHandlerModifierMeta & TMeta, AnyFunction>;

const resolveHandler = (
  handler: AnyFunction | AnyFunction[],
  wrapper: AnyFunction,
) =>
  Type.isArray(handler)
    ? handler.map((_handler) => wrapper(_handler))
    : wrapper(handler);

export const captureFactory: EventHandlerModifierFactory = function capture(
  handler,
  { target, options },
) {
  return {
    identifier: 'capture',
    handler,
    meta: {
      target,
      options: {
        ...options,
        capture: true,
      },
    },
  };
};

export const onceFactory: EventHandlerModifierFactory = function once(
  handler,
  { target, options, end },
) {
  const wrappedHandler = end
    ? resolveHandler(handler, (_handler) => (e: Event, ...args: any[]) => {
        if (Type.isFunction(end)) end();
        return _handler(e, ...args);
      })
    : handler;

  return {
    identifier: 'once',
    handler: wrappedHandler,
    meta: {
      target,
      options: end
        ? options
        : {
            ...options,
            once: true,
          },
    },
  };
};

export const selfFactory: EventHandlerModifierFactory = function self(
  handler,
  { target, options, delegatedTarget },
) {
  return {
    identifier: 'self',
    handler: resolveHandler(
      handler,
      (_handler) =>
        (e: Event, ...args: any[]) => {
          const $target = e.target as HTMLElement | null;

          if (
            delegatedTarget
              ? !$target || !$target.matches(delegatedTarget)
              : target !== $target
          )
            return;

          return _handler(e, ...args);
        },
    ),
    meta: { target, options },
  };
};

export const preventDefaultFactory: EventHandlerModifierFactory =
  function preventDefault(handler, { target, options }) {
    return {
      identifier: 'prevent',
      handler: resolveHandler(
        handler,
        (_handler) =>
          (e: Event, ...args: any[]) => {
            e.preventDefault();
            return _handler(e, ...args);
          },
      ),
      meta: {
        target,
        options,
      },
    };
  };

export type EventHandlerDelegateModifierMeta = {
  delegatedTarget: string;
};

export const delegateFactory: EventHandlerModifierFactory<EventHandlerDelegateModifierMeta> =
  function delegate(handler, { target, options, delegatedTarget }) {
    if (!delegatedTarget)
      throw new Error('Missing arg "target" for the delegate modifier!');

    return {
      identifier: `delegate[${delegatedTarget}]`,
      handler: resolveHandler(
        handler,
        (handler) =>
          (e: Event, ...args: any[]) => {
            const $target = e.target as Element | null;
            if (
              !$target ||
              (!$target.matches(delegatedTarget) &&
                !$target.closest(delegatedTarget))
            )
              return;
            return handler(e, ...args);
          },
      ),
      meta: { target, options, delegatedTarget },
    };
  };
