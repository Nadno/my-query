import $ from 'mini-q';
import { $model } from 'mini-q';
import type { Signal } from '@preact/signals-core';
import { inputClass } from './Field';

export function Select<T extends string>(p: {
  value: Signal<T>;
  options: { value: T; label: string }[];
  onChange?: () => void;
}) {
  return $.select(
    {
      class: inputClass,
      use: $model(p.value as unknown as { value: string }),
      on: p.onChange ? { change: p.onChange } : undefined,
    },
    ...p.options.map((o) => $.option({ value: o.value }, o.label)),
  );
}
