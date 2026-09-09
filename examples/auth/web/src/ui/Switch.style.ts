import { style } from 'mini-q/style';

export const sSwitch = style('switch', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
  cursor: 'pointer',
  userSelect: 'none',
  parts: {
    track: {
      width: 40,
      height: 22,
      borderRadius: 999,
      background: 'var(--line)',
      position: 'relative',
      transition: 'background .2s ease',
      flags: {
        on: {
          background: 'var(--accent)',
        },
      },
    },
    thumb: {
      position: 'absolute',
      top: 2,
      left: 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      transition: 'transform .2s ease',
      transform: 'translateX(0)',
      flags: {
        on: {
          transform: 'translateX(18px)',
        },
      },
    },
    label: {
      color: 'var(--fg)',
      fontSize: 'var(--text-md)',
    },
    hint: {
      color: 'var(--fg-muted)',
      fontSize: 'var(--text-sm)',
    },
  },
});
