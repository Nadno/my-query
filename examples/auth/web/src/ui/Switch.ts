import $ from 'mini-q';
import type { Signal } from '@preact/signals-core';
import { sSwitch } from './Switch.style';

export function Switch(p: {
  checked: Signal<boolean> | (() => boolean);
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) {
  const isChecked = () =>
    typeof p.checked === 'function' ? p.checked() : p.checked.value;

  const id = `sw-${Math.random().toString(36).slice(2, 8)}`;

  return $.label(
    { class: sSwitch, for: id },
    $.input({
      id,
      type: 'checkbox',
      $checked: () => isChecked(),
      role: 'switch',
      aria: { checked: () => isChecked() },
      style: 'position:absolute;opacity:0;width:1px;height:1px;',
      on: {
        change: (e: Event) => {
          const target = e.target as HTMLInputElement;
          p.onChange(target.checked);
        },
      },
    }),
    $.span({
      $class: () => sSwitch.track({ on: isChecked() }),
      aria: { hidden: true },
    }, $.span({ $class: () => sSwitch.thumb({ on: isChecked() }) })),
    $.span(
      { style: 'display:flex;flex-direction:column;gap:var(--space-xs)' },
      $.span({ class: sSwitch.label }, p.label),
      p.hint ? $.span({ class: sSwitch.hint }, p.hint) : undefined,
    ),
  );
}
