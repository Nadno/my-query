import $ from 'mini-q';
import type { Bindable, Child } from 'mini-q';
import { Spinner } from './Spinner';
import sButton from './Button.style';

export function Button(p: {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: Bindable<boolean>;
  loading?: Bindable<boolean>;
  onClick?: (e: Event) => void;
  label: string | (() => string);
}) {
  const busy = () => {
    const v = typeof p.loading === 'function' ? p.loading() : p.loading;
    return !!v;
  };

  const content: Child = () => {
    if (busy()) {
      return $.span(
        { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' } },
        [Spinner, {}],
        typeof p.label === 'function' ? p.label : p.label,
      );
    }
    return typeof p.label === 'function' ? p.label : p.label;
  };

  return $.button(
    {
      class: sButton({ variant: p.variant ?? 'primary', size: p.size ?? 'md' }),
      type: p.type ?? 'button',
      $disabled: () => {
        const d = typeof p.disabled === 'function' ? p.disabled() : p.disabled;
        return !!d || busy();
      },
      on: p.onClick ? { click: p.onClick } : undefined,
    },
    content,
  );
}
