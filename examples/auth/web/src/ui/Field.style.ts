import { style } from 'mini-q/style';

export const sInput = style('input', {
  padding: '.875rem var(--space-lg)',
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--fg)',
  fontSize: 'var(--text-md)',
  width: '100%',
  '&:focus': { outline: 'none', borderColor: 'rgba(102,126,234,.5)' },
  '&:disabled': { opacity: 0.6 },
});

export default style('field', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm)',
  // flex-basis no eixo principal: cresce em linha, não força altura em coluna
  flex: '1 1 auto',
  minWidth: '180px',
  parts: {
    label: { fontSize: '.9rem', color: 'var(--fg-muted)' },
    error: { margin: 0, color: 'var(--danger)', fontSize: 'var(--text-sm)' },
    hint: { margin: 0, color: 'var(--fg-subtle)', fontSize: '.8rem' },
  },
  // o control é um bloco estrangeiro (`input`) → slot, não parte
  slots: { control: sInput },
  flags: { invalid: { slots: { control: { borderColor: 'rgba(239,68,68,.55)' } } } },
});
