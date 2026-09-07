import $ from 'mini-q';

$.style.css(':root', {
  colorScheme: 'dark',
  '--bg': '#1a1a1a',
  '--fg': '#fff',
  '--muted': 'rgba(255,255,255,.7)',
  '--card': 'rgba(255,255,255,.05)',
  '--line': 'rgba(255,255,255,.1)',
  '--accent': '#667eea',
  '--accent-2': '#764ba2',
  '--danger': '#ef4444',
  '--ok': '#10b981',
});

$.style.css('*', { boxSizing: 'border-box' });

$.style.css('body', {
  margin: 0,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  background: 'var(--bg)',
  color: 'var(--fg)',
  lineHeight: 1.6,
});

export const app = $.style('app', {
  maxWidth: 800,
  margin: '0 auto',
  padding: '2rem 1rem',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const header = $.style('header', {
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

export const card = $.style('card', {
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

export const form = $.style('form', {
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

export const authGate = $.style('auth-gate', {
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
