import { style } from 'mini-q/style';

export const sToastHost = style('toast-host', {
  position: 'fixed',
  top: 'var(--space-lg)',
  right: 'var(--space-lg)',
  zIndex: 'var(--z-toast)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxWidth: 360,
});

// `type` é exclusivo (error XOR success) → variante, não flags.
export const sToast = style('toast', {
  padding: '.85rem var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--line)',
  background: 'var(--bg-elevated)',
  boxShadow: 'var(--shadow-md)',
  variants: {
    type: {
      error: { borderColor: 'rgba(239,68,68,.4)', color: '#fecaca' },
      success: { borderColor: 'rgba(16,185,129,.4)', color: '#a7f3d0' },
    },
  },
});
