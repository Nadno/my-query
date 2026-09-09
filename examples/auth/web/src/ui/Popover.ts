import $ from 'mini-q';
import { $when, type Child } from 'mini-q';
import sPopover from './Popover.style';

export function Popover(p: {
  hostOn: Record<string, unknown>;
  hostUse: unknown;
  open: () => boolean;
  trigger: Child;
  panel: () => Child;
}) {
  return $.div(
    {
      class: sPopover,
      on: p.hostOn as never,
      use: p.hostUse as never,
    },
    p.trigger,
    $when(
      () => p.open(),
      () => $.div({ class: sPopover.panel }, p.panel()),
    ),
  );
}
