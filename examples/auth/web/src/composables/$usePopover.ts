import { effect, signal } from '@preact/signals-core';
import $, { type Behavior } from 'mini-q';
import { $handle } from 'mini-q';

export default function $usePopover() {
  const open = signal(false);
  const close = () => {
    open.value = false;
  };
  const toggle = () => {
    open.value = !open.value;
  };

  const use: Behavior<HTMLElement> = (ctx) => {
    ctx.element.tabIndex = -1;
    const stop = effect(() => {
      if (open.value) ctx.element.focus();
    });
    return stop;
  };

  const on = {
    clickOutside: close,
    focusOutside: close,
    keydown: [close, $handle.keys('Escape')] as const,
  };

  return { open, close, toggle, on, use };
}
