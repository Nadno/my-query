import $ from 'mini-q';
import { $when, type Child } from 'mini-q';
import sField, { sInput } from './Field.style';

export function Field(p: {
  label: string;
  error?: () => string;
  hint?: () => string;
  control: Child;
}) {
  return $.div(
    { $class: () => sField({ invalid: !!p.error?.() }) },
    $.label({ class: sField.label }, p.label),
    p.control,
    $when(
      () => !!(p.hint && p.hint() && !p.error?.()),
      () => $.p({ class: sField.hint }, () => p.hint?.() ?? ''),
    ),
    $when(
      () => !!p.error?.(),
      () => $.p({ class: sField.error }, () => p.error?.() ?? ''),
    ),
  );
}
