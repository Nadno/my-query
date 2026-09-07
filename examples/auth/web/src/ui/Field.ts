import $ from 'mini-q';

export const fieldStyle = $.style('field', {
  base: { display: 'flex', flexDirection: 'column', gap: '.5rem', flex: '1 1 180px' },
  parts: {
    label: { base: { fontSize: '.9rem', opacity: 0.8 } },
    error: { base: { margin: 0, color: 'var(--danger)', fontSize: '.85rem' } },
    hint: { base: { margin: 0, opacity: 0.65, fontSize: '.8rem' } },
  },
  flags: { invalid: {} },
});

// override cross-bloco: input inválido (o control é o bloco `input`, não uma parte de `field`)
$.style.css('.field.--invalid .input', { borderColor: 'rgba(239,68,68,.55)' });

export const inputClass = $.style('input', {
  base: {
    padding: '.875rem 1rem',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    color: 'var(--fg)',
    fontSize: '1rem',
    width: '100%',
    '&:focus': { outline: 'none', borderColor: 'rgba(102,126,234,.5)' },
    '&:disabled': { opacity: 0.6 },
  },
}).self;

export function Field(p: {
  label: string;
  error?: () => string;
  hint?: () => string;
  control: unknown;
}) {
  return $.div(
    {
      $class: () => $.cx(fieldStyle.self, p.error?.() && fieldStyle.flags.invalid),
    },
    $.label({ class: fieldStyle.parts.label.self }, p.label),
    p.control,
    $.when(
      () => !!(p.hint && p.hint() && !p.error?.()),
      () => $.p({ class: fieldStyle.parts.hint.self }, () => p.hint?.() ?? ''),
    ),
    $.when(
      () => !!p.error?.(),
      () => $.p({ class: fieldStyle.parts.error.self }, () => p.error?.() ?? ''),
    ),
  );
}
