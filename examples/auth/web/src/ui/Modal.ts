import $ from 'mini-q';
import { $when, $handle } from 'mini-q';
import { effect, type Signal } from '@preact/signals-core';
import type { Child, Behavior } from 'mini-q';
import { FocusScope } from '@/$stdbrowser/focus-scope';
import { sModal } from './Modal.style';
import { Teleport } from './Teleport';

function useFocusScope(onClose: () => void): Behavior<HTMLDivElement> {
  return (ctx) => {
    const scope = FocusScope.of(ctx.element, {
      trap: true,
      isolate: true,
      restoreFocus: true,
      autoFocus: true,
    });
    scope.capture();
    scope.trap();
    scope.isolate();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    ctx.element.addEventListener('keydown', onKey);

    return () => {
      ctx.element.removeEventListener('keydown', onKey);
      scope.restoreOutside();
      scope.release();
      scope.restore();
    };
  };
}

export function Modal(p: {
  open: Signal<boolean>;
  title: string;
  children: Child;
  onClose: () => void;
  actions?: Child;
  overlayClose?: boolean;
}) {
  const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

  return Teleport({
    target: 'body',
    children: $.div(
      {
        class: sModal,
        $style: () => ({ display: p.open.value ? 'flex' : 'none' }),
        use: (ctx) => {
          const stop = effect(() => {
            if (p.open.value) {
              document.body.style.overflow = 'hidden';
            } else {
              document.body.style.overflow = '';
            }
          });
          return () => {
            stop();
            document.body.style.overflow = '';
          };
        },
      },
      $.div({
        class: sModal.overlay,
        on: p.overlayClose !== false ? { click: p.onClose } : undefined,
      }),
      $when(
        () => p.open.value,
        () =>
          $.div(
            {
              class: sModal.content,
              role: 'dialog',
              aria: { modal: true, labelledBy: titleId },
              use: useFocusScope(p.onClose),
            },
            $.h2({ id: titleId, class: sModal.title }, p.title),
            p.children,
            $when(
              () => !!p.actions,
              () => $.div({ class: sModal.actions }, p.actions!),
            ),
          ),
      ),
    ),
  });
}
