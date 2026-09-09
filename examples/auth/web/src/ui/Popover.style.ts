import { style } from 'mini-q/style';

export default style('popover', {
  position: 'relative',
  parts: {
    panel: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + var(--space-sm))',
      minWidth: 180,
      padding: 'var(--space-sm)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 'var(--z-popover)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xs)',
    },
  },
});
