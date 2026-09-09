import { style } from 'mini-q/style';

export const sPartnerRow = style('partner-row', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto auto',
  gap: 'var(--space-md)',
  alignItems: 'end',
  padding: 'var(--space-lg)',
  background: 'rgba(255,255,255,.03)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--line)',
  '@media (max-width: 720px)': { gridTemplateColumns: '1fr' },
  parts: {
    admin: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xs)',
      fontSize: 'var(--text-sm)',
      padding: 'var(--space-sm) var(--space-md)',
      whiteSpace: 'nowrap',
      background: 'transparent',
      color: 'inherit',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      flags: {
        on: {
          borderColor: 'rgba(102,126,234,.6)',
          background: 'var(--accent-faint)',
        },
      },
    },
  },
});
