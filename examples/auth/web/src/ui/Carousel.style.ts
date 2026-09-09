import { style } from 'mini-q/style';

export const sCarousel = style('carousel', {
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  parts: {
    viewport: {
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      width: '100%',
    },
    container: {
      display: 'flex',
      touchAction: 'pan-y pinch-zoom',
    },
    slide: {
      flex: '0 0 100%',
      minWidth: 0,
    },
    controls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-md)',
      marginTop: 'var(--space-lg)',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      border: 'none',
      padding: 0,
      background: 'var(--line)',
      cursor: 'pointer',
      transition: 'background .2s ease',
      flags: {
        active: { background: 'var(--accent)' },
      },
    },
    arrow: {
      background: 'none',
      border: 'none',
      color: 'var(--fg-muted)',
      cursor: 'pointer',
      fontSize: '1.25rem',
      lineHeight: 1,
      padding: 'var(--space-xs)',
      '&:disabled': { opacity: 0.3, cursor: 'default' },
    },
  },
});
