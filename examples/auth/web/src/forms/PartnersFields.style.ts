import { style } from 'mini-q/style';

export const sPartnerRow = style('partner-row', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto auto',
  gap: '.75rem',
  alignItems: 'end',
  padding: '1rem',
  background: 'rgba(255,255,255,.03)',
  borderRadius: 12,
  border: '1px solid var(--line)',
  '@media (max-width: 720px)': { gridTemplateColumns: '1fr' },
  parts: {
    admin: {
      display: 'flex',
      alignItems: 'center',
      gap: '.4rem',
      fontSize: '.85rem',
      padding: '.5rem .75rem',
      whiteSpace: 'nowrap',
      background: 'transparent',
      color: 'inherit',
      border: '1px solid var(--line)',
      borderRadius: 8,
      cursor: 'pointer',
      flags: {
        on: {
          borderColor: 'rgba(102,126,234,.6)',
          background: 'rgba(102,126,234,.15)',
        },
      },
    },
  },
});
