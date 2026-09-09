import { style } from 'mini-q/style';

export const sModal = style('modal', {
  position: 'fixed',
  inset: 0,
  zIndex: 'calc(var(--z-toast) - 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-lg)',
  parts: {
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,.55)',
      backdropFilter: 'blur(2px)',
    },
    content: {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: 520,
      maxHeight: '85vh',
      overflowY: 'auto',
      padding: 'var(--space-2xl)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-xl)',
    },
    title: {
      margin: 0,
      fontSize: 'var(--text-lg)',
    },
    actions: {
      display: 'flex',
      gap: 'var(--space-md)',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
});
