import $ from 'mini-q';
import { $when } from 'mini-q';
import { style } from 'mini-q/style';

export const popoverStyle = style('popover', {
  position: 'relative',
  parts: {
    panel: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + .5rem)',
      minWidth: 180,
      padding: '.5rem',
      background: '#2a2a2a',
      border: '1px solid var(--line)',
      borderRadius: 12,
      boxShadow: '0 12px 32px rgba(0,0,0,.4)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: '.25rem',
    },
  },
});

export function Popover(p: {
  hostOn: Record<string, unknown>;
  hostUse: unknown;
  open: () => boolean;
  trigger: unknown;
  panel: () => unknown;
}) {
  return $.div(
    {
      class: popoverStyle,
      on: p.hostOn as never,
      use: p.hostUse as never,
    },
    p.trigger,
    $when(
      () => p.open(),
      () => $.div({ class: popoverStyle.panel }, p.panel()),
    ),
  );
}
