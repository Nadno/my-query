import { style } from 'mini-q/style';

export const sAccordion = style('accordion', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  parts: {
    section: {
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--card)',
    },
    trigger: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--space-md) var(--space-lg)',
      background: 'none',
      border: 'none',
      color: 'var(--fg)',
      font: 'inherit',
      fontSize: 'var(--text-md)',
      cursor: 'pointer',
      textAlign: 'left',
      '&:hover': { background: 'rgba(255,255,255,.03)' },
    },
    marker: {
      transition: 'transform .2s ease',
      flags: {
        open: { transform: 'rotate(180deg)' },
      },
    },
    panel: {
      padding: '0 var(--space-lg) var(--space-lg)',
      color: 'var(--fg-muted)',
      lineHeight: 1.6,
    },
  },
});
