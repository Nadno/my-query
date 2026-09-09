import $ from 'mini-q';
import { $when, $on, $handle, type Child, type Behavior, type MQ } from 'mini-q';
import { Teleport } from './Teleport';
import sPopover from './Popover.style';
import { sPopoverOuterPanel } from './PopoverPanel.style';

function useDocumentEscape(onClose: () => void): Behavior<HTMLDivElement> {
  return (ctx) => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  };
}

function usePanelEscape(onClose: () => void): Behavior<HTMLDivElement> {
  return (ctx) =>
    $on(ctx, 'keydown', [onClose, $handle.keys('Escape'), $handle.prevent, $handle.stop]);
}

function useFocusPanel(): Behavior<HTMLDivElement> {
  return (ctx) => {
    ctx.element.tabIndex = -1;
    ctx.element.focus();
  };
}

function usePanelPosition(triggerId: string): Behavior<HTMLDivElement> {
  return (ctx) => {
    const panel = ctx.element;
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    const place = () => {
      const rect = trigger.getBoundingClientRect();
      panel.style.position = 'absolute';
      panel.style.left = `${rect.left + window.scrollX}px`;
      panel.style.top = `${rect.bottom + window.scrollY + 8}px`;
      panel.style.minWidth = `${rect.width}px`;
    };

    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);

    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  };
}

export function Popover(p: {
  hostOn: Record<string, unknown>;
  hostUse: unknown;
  open: () => boolean;
  trigger: Child;
  triggerId?: string;
  panel: () => Child;
  onClose: () => void;
}) {
  const trigger = $.span(
    { id: p.triggerId, style: 'display:inline-flex' },
    p.trigger,
  );

  return $.div(
    {
      class: sPopover,
      on: p.hostOn as never,
      use: p.hostUse as never,
    },
    trigger,
    $when(
      () => p.open(),
      () =>
        Teleport({
          target: 'body',
          children: $.div(
            {
              class: sPopoverOuterPanel,
              use: [
                useFocusPanel(),
                usePanelEscape(p.onClose),
                useDocumentEscape(p.onClose),
                ...(p.triggerId ? [usePanelPosition(p.triggerId)] : []),
              ],
            },
            p.panel(),
          ),
        }),
    ),
  );
}

