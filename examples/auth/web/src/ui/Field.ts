import $ from 'mini-q';

export const fieldStyle = $.parts('field', {
  root: { display: 'flex', flexDirection: 'column', gap: '.5rem', flex: '1 1 180px' },
  label: { fontSize: '.9rem', opacity: 0.8 },
  error: { margin: 0, color: 'var(--danger)', fontSize: '.85rem' },
  hint: { margin: 0, opacity: 0.65, fontSize: '.8rem' },
});

$.css('.field--invalid .input', { borderColor: 'rgba(239,68,68,.55)' });

export const inputClass = $.style('input', {
  padding: '.875rem 1rem',
  background: 'rgba(255,255,255,.05)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  color: 'var(--fg)',
  fontSize: '1rem',
  width: '100%',
  '&:focus': { outline: 'none', borderColor: 'rgba(102,126,234,.5)' },
  '&:disabled': { opacity: 0.6 },
});

export function Field(p: {
  label: string;
  error?: () => string;
  hint?: () => string;
  control: unknown;
}) {
  return $.div(
    {
      $class: () =>
        $.cx(fieldStyle.root, p.error?.() && 'field--invalid'),
    },
    $.label({ class: fieldStyle.label }, p.label),
    p.control,
    $.when(
      () => !!(p.hint && p.hint() && !p.error?.()),
      () => $.p({ class: fieldStyle.hint }, () => p.hint?.() ?? ''),
    ),
    $.when(
      () => !!p.error?.(),
      () => $.p({ class: fieldStyle.error }, () => p.error?.() ?? ''),
    ),
  );
}
