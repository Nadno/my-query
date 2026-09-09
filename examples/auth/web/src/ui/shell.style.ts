import { style } from 'mini-q/style';

export const sApp = style('app', {
  maxWidth: 800,
  margin: '0 auto',
  padding: 'var(--space-3xl) var(--space-lg)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-2xl)',
});

export const sHeader = style('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--space-2xl)',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
  borderRadius: 'var(--radius-xl)',
  gap: 'var(--space-lg)',
  parts: {
    title: { fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 },
    subtitle: { margin: 'var(--space-xs) 0 0', opacity: 0.9, fontSize: '.95rem' },
  },
});

export const sCard = style('card', {
  padding: 'var(--space-2xl)',
  background: 'var(--card)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xl)',
  parts: {
    title: { margin: 0, fontSize: 'var(--text-lg)' },
    muted: { margin: 0, color: 'var(--fg-muted)', fontSize: '.9rem' },
  },
});

export const sForm = style('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xl)',
  parts: {
    row: { display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' },
    actions: {
      display: 'flex',
      gap: 'var(--space-md)',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
});

export const sAuthGate = style('auth-gate', {
  margin: 0,
  color: 'var(--fg-muted)',
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
