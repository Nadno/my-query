import { style } from 'mini-q/style';

export const sInput = style('input', {
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

export default style('field', {
  display: 'flex',
  flexDirection: 'column',
  gap: '.5rem',
  // flex-basis no eixo principal: cresce em linha, não força altura em coluna
  flex: '1 1 auto',
  minWidth: '180px',
  parts: {
    label: { fontSize: '.9rem', opacity: 0.8 },
    error: { margin: 0, color: 'var(--danger)', fontSize: '.85rem' },
    hint: { margin: 0, opacity: 0.65, fontSize: '.8rem' },
  },
  // o control é um bloco estrangeiro (`input`) → slot, não parte
  slots: { control: sInput },
  flags: { invalid: { slots: { control: { borderColor: 'rgba(239,68,68,.55)' } } } },
});
