import $ from 'mini-q';
import type { Bindable } from 'mini-q';

export const btnClass = $.style('btn', {
  base: {
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    color: '#fff',
    transition: 'all .2s ease',
    '&:hover': { transform: 'translateY(-2px)' },
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed', transform: 'none' },
  },
  variants: {
    variant: {
      primary: {
        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
      },
      ghost: { background: 'none', opacity: 0.8, color: 'inherit' },
      danger: {
        background: 'rgba(239,68,68,.2)',
        color: 'var(--danger)',
        border: '1px solid rgba(239,68,68,.3)',
      },
    },
    size: {
      sm: { padding: '.5rem 1rem', fontSize: '.85rem', borderRadius: 8 },
      md: { padding: '1rem', fontSize: '1rem', borderRadius: 10 },
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
}) as (p?: Record<string, string>) => string;

export function Button(p: {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: Bindable<boolean>;
  onClick?: (e: Event) => void;
  label: string | (() => string);
}) {
  return $.button(
    {
      class: btnClass({ variant: p.variant ?? 'primary', size: p.size ?? 'md' }),
      type: p.type ?? 'button',
      $disabled: p.disabled,
      on: p.onClick ? { click: p.onClick } : undefined,
    },
    typeof p.label === 'function' ? p.label : p.label,
  );
}
