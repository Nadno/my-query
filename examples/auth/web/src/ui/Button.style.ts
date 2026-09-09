import { style } from 'mini-q/style';

export default style('btn', {
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  color: '#fff',
  transition: 'all .2s ease',
  '&:hover': { transform: 'translateY(-2px)' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed', transform: 'none' },
  variants: {
    variant: {
      primary: {
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
      },
      ghost: { background: 'none', opacity: 0.8, color: 'inherit' },
      danger: {
        background: 'var(--danger-faint)',
        color: 'var(--danger)',
        border: '1px solid rgba(239,68,68,.3)',
      },
    },
    size: {
      sm: {
        padding: '.5rem var(--space-lg)',
        fontSize: 'var(--text-sm)',
        borderRadius: 'var(--radius-sm)',
      },
      md: {
        padding: 'var(--space-lg)',
        fontSize: 'var(--text-md)',
        borderRadius: 'var(--radius-md)',
      },
    },
  },
  defaults: { variant: 'primary', size: 'md' },
});
