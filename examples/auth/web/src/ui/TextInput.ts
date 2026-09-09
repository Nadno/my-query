import $ from 'mini-q';
import { $model } from 'mini-q';
import type { WritableSignal } from '../composables/$useMask';
import $useMask from '../composables/$useMask';
import { sInput } from './Field.style';

export function TextInput(p: {
  value: WritableSignal<string>;
  type?: string;
  placeholder?: string;
  autocomplete?: string;
  mask?: (raw: string) => string;
  onBlur?: () => void;
}) {
  return $.input({
    class: sInput,
    type: p.type ?? 'text',
    placeholder: p.placeholder,
    autoComplete: p.autocomplete,
    use: p.mask ? $useMask(p.value, p.mask) : $model(p.value),
    on: p.onBlur ? { blur: p.onBlur } : undefined,
  });
}
