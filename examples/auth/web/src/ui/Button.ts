import $ from 'mini-q';
import type { Bindable } from 'mini-q';
import sButton from './Button.style';

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
      class: sButton({ variant: p.variant ?? 'primary', size: p.size ?? 'md' }),
      type: p.type ?? 'button',
      $disabled: p.disabled,
      on: p.onClick ? { click: p.onClick } : undefined,
    },
    typeof p.label === 'function' ? p.label : p.label,
  );
}
