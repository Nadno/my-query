import { style } from 'mini-q/style';

export const sTabs = style('tabs', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xl)',
  parts: {
    list: {
      display: 'flex',
      gap: 'var(--space-xs)',
      borderBottom: '1px solid var(--line)',
      padding: 0,
      margin: 0,
      listStyle: 'none',
    },
    tab: {
      padding: 'var(--space-sm) var(--space-lg)',
      background: 'none',
      border: 'none',
      borderBottom: '2px solid transparent',
      color: 'var(--fg-muted)',
      font: 'inherit',
      cursor: 'pointer',
      fontSize: 'var(--text-md)',
      flags: {
        active: {
          color: 'var(--fg)',
          borderColor: 'var(--accent)',
        },
      },
    },
    panel: {
      padding: 'var(--space-sm) 0',
    },
  },
});
