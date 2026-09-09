import { style } from 'mini-q/style';

export const sSettings = style('settings', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2xl)',
  parts: {
    group: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-lg)',
      paddingBottom: 'var(--space-xl)',
      borderBottom: '1px solid var(--line)',
    },
    groupTitle: {
      margin: 0,
      fontSize: 'var(--text-md)',
      fontWeight: 600,
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 'var(--space-lg)',
      flexWrap: 'wrap',
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xs)',
    },
  },
});
