import { Type, Task } from '@/mini-stack/primitives';
import {
  CustomEventFactory,
  CustomEventListener,
} from './query-custom-event-handler';

export const clickOutsideFactory: CustomEventFactory<'pointerdown'> = ({
  handler,
  target,
  dispose,
  getContext,
}) => {
  const isOnce = () => !!getContext().originalOptions?.once;
  return {
    identifier: 'click-outside',
    event: 'pointerdown',
    handler: (e) => {
      const $clickTarget = e.target as Element | null,
        $target = target as HTMLElement;
      if ($target.contains($clickTarget)) return;
      handler(e);
      if (isOnce()) dispose();
    },
    adder(event, handler, options) {
      window.addEventListener(event, handler, options);
    },
    remover(event, handler, options) {
      window.removeEventListener(event, handler, options);
    },
  };
};

export const focusOutsideFactory: CustomEventFactory<'focusout'> = ({
  handler,
  target,
  dispose,
  getContext,
}) => {
  const isOnce = () => !!getContext().originalOptions?.once;
  return {
    identifier: 'focus-outside',
    event: 'focusout',
    handler: (e) => {
      const $target = target as HTMLElement | null,
        $relatedTarget = (e as FocusEvent).relatedTarget as Element;
      if (!!$target && $target.contains($relatedTarget)) return;

      handler(e);

      if (isOnce()) dispose();
    },
    adder(event, handler, options) {
      target.addEventListener(event, handler, options);
    },
    remover(event, handler, options) {
      target.removeEventListener(event, handler, options);
    },
  };
};

export const interactOutsideFactory: CustomEventFactory<
  ['pointerdown', 'focusout']
> = ({ handler, target, dispose, getContext }) => {
  const isOnce = () => !!getContext().originalOptions?.once;
  return {
    identifier: 'interact-outside',
    event: ['pointerdown', 'focusout'],
    handler: (e) => {
      if (e.type === 'focusout') {
        const $target = target as HTMLElement | null,
          $relatedTarget = (e as FocusEvent).relatedTarget as Element | null;
        if (!!$target && $target.contains($relatedTarget)) return;
        handler(e);
        if (isOnce()) dispose();
      } else {
        const $clickTarget = e.target as Element,
          $target = target as HTMLElement;
        if ($target.contains($clickTarget)) return;
        handler(e);
        if (isOnce()) dispose();
      }
    },
    adder([clickEvent, focusEvent], handler, options) {
      window.addEventListener(clickEvent, handler, options);
      target.addEventListener(focusEvent, handler, options);
    },
    remover([clickEvent, focusEvent], handler, options) {
      window.removeEventListener(clickEvent, handler, options);
      target.removeEventListener(focusEvent, handler, options);
    },
  };
};

export const hoverFactory: CustomEventFactory<
  ['mouseover', 'mouseout'],
  [CustomEventListener, CustomEventListener]
> = ({ handler, target, args = [], getContext, dispose }) => {
  let cleanupHover: AnyFunction | null = null,
    isHovering = false,
    currentTarget: null | HTMLElement = null;

  const [delegationTarget, delayIn = 100, delayOut = 250] = args as [
    string | undefined,
    number | undefined,
    number | undefined,
  ];

  const isOnce = () => !!getContext().originalOptions?.once;

  if (delegationTarget) {
    const getDelegatedTarget = (event: Event): HTMLElement | null => {
      return delegationTarget
        ? event.target &&
            (event.target as HTMLElement).closest(delegationTarget)
        : (event.target as HTMLElement);
    };

    const cleanup = (callback = cleanupHover) => {
      if (Type.isFunction(callback)) {
        callback();
        if (callback === cleanupHover) cleanupHover = null;
      }
    };

    const handleMouseOut = Task.debounce((event: MouseEvent) => {
      if (!isHovering) return;

      const $relatedTarget = event.relatedTarget as HTMLElement | null,
        isSameTarget =
          !!$relatedTarget &&
          !!currentTarget &&
          currentTarget.contains($relatedTarget);

      if (isSameTarget) return;

      isHovering = false;
      cleanup();
      currentTarget = null;

      if (isOnce()) dispose();
    }, delayOut);

    const handleMouseOver = Task.debounce((event: MouseEvent) => {
      if (isHovering && isOnce()) return;

      isHovering = true;
      currentTarget = getDelegatedTarget(event);
      cleanupHover = (handler as AnyFunction)(event, currentTarget);
    }, delayIn);

    const wrappedHandleMouseOver = (event: MouseEvent) => {
      const isSameTarget =
        !!currentTarget && currentTarget.contains(event.target as HTMLElement);

      if (isSameTarget) return handleMouseOut.cancel();
      if (currentTarget) {
        handleMouseOut.cancel();
        setTimeout(
          ((cleanupHover) => () => {
            cleanup(cleanupHover);
            if (isOnce()) dispose();
          })(cleanupHover),
          delayOut,
        );
      }

      handleMouseOver(event);
    };

    const wrappedHandleMouseOut = (event: MouseEvent) => {
      const $outToTarget =
        event.relatedTarget &&
        (event.relatedTarget as HTMLElement).closest(delegationTarget);

      if (!$outToTarget) handleMouseOver.cancel();
      if (!currentTarget) return;
      handleMouseOut(event);
    };

    return {
      identifier: 'hover',
      event: ['mouseover', 'mouseout'],
      handler: [wrappedHandleMouseOver, wrappedHandleMouseOut],
      adder(
        [mouseMoveEvent, mouseOutEvent],
        [handleMouseOver, handleMouseOut],
        options,
      ) {
        target.addEventListener(mouseMoveEvent, handleMouseOver, options);
        target.addEventListener(mouseOutEvent, handleMouseOut, options);
      },
      remover(
        [mouseMoveEvent, mouseOutEvent],
        [handleMouseOver, handleMouseOut],
        options,
      ) {
        target.removeEventListener(mouseMoveEvent, handleMouseOver, options);
        target.removeEventListener(mouseOutEvent, handleMouseOut, options);
      },
    };
  }

  const handleMouseOut = Task.debounce((event: Event) => {
    if (!isHovering) return;

    isHovering = false;

    if (Type.isFunction(cleanupHover)) {
      cleanupHover(event as MouseEvent);
      cleanupHover = null;
    }

    currentTarget = null;

    if (isOnce()) dispose();
  }, delayOut);

  const handleMouseOver = Task.debounce((event: Event) => {
    handleMouseOut.cancel();

    if (isHovering) return;

    isHovering = true;

    currentTarget = delegationTarget
      ? event.target && (event.target as HTMLElement).closest(delegationTarget)
      : (event.target as HTMLElement);

    cleanupHover = (handler as AnyFunction)(event, currentTarget);
  }, delayIn);

  return {
    identifier: 'hover',
    event: ['mouseover', 'mouseout'],
    handler: [handleMouseOver, handleMouseOut],
    adder(
      [mouseOverEvent, mouseOutEvent],
      [handleMouseOver, handleMouseOut],
      options,
    ) {
      target.addEventListener(mouseOverEvent, handleMouseOver, options);
      target.addEventListener(mouseOutEvent, handleMouseOut, options);
    },
    remover(
      [mouseOverEvent, mouseOutEvent],
      [handleMouseOver, handleMouseOut],
      options,
    ) {
      target.removeEventListener(mouseOverEvent, handleMouseOver, options);
      target.removeEventListener(mouseOutEvent, handleMouseOut, options);
    },
  };
};
