import { style } from 'mini-q/style';

export const sApp = style('app', {
  maxWidth: 800,
  margin: '0 auto',
  padding: '2rem 1rem',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const sHeader = style('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.5rem',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
  borderRadius: 16,
  gap: '1rem',
  parts: {
    title: { fontSize: '1.6rem', fontWeight: 800, margin: 0 },
    subtitle: { margin: '.25rem 0 0', opacity: 0.9, fontSize: '.95rem' },
  },
});

export const sCard = style('card', {
  padding: '1.5rem',
  background: 'var(--card)',
  borderRadius: 16,
  border: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  parts: {
    title: { margin: 0, fontSize: '1.25rem' },
    muted: { margin: 0, opacity: 0.75, fontSize: '.9rem' },
  },
});

export const sForm = style('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  parts: {
    row: { display: 'flex', gap: '.75rem', flexWrap: 'wrap' },
    actions: {
      display: 'flex',
      gap: '.75rem',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
});

export const sAuthGate = style('auth-gate', {
  margin: 0,
  opacity: 0.8,
  fontSize: '.95rem',
  parts: {
    link: {
      background: 'none',
      border: 'none',
      color: '#c4b5fd',
      cursor: 'pointer',
      padding: 0,
      font: 'inherit',
      textDecoration: 'underline',
    },
  },
});
