import { style } from 'mini-q/style';

export default style('stepper', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  gap: 'var(--space-sm)',
  parts: {
    item: {
      flex: 1,
      padding: '.6rem var(--space-md)',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(255,255,255,.04)',
      border: '1px solid var(--line)',
      fontSize: 'var(--text-sm)',
      textAlign: 'center',
      color: 'var(--fg-muted)',
      flags: {
        active: {
          color: 'var(--fg)',
          borderColor: 'rgba(102,126,234,.6)',
          background: 'var(--accent-faint)',
        },
        done: { color: 'var(--fg)' },
      },
    },
  },
});
