import { style } from 'mini-q/style';

export const sLoginLayout = style('login-layout', {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 'var(--space-2xl)',
  alignItems: 'start',
  '@media (min-width: 900px)': {
    gridTemplateColumns: '1fr 1fr',
  },
});

export const sLoginHero = style('login-hero', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xl)',
  parts: {
    brand: {
      fontSize: 'var(--text-xl)',
      fontWeight: 800,
      margin: 0,
      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    pitch: {
      margin: 0,
      color: 'var(--fg-muted)',
      fontSize: 'var(--text-md)',
      lineHeight: 1.6,
    },
  },
});

export const sTestimonialCard = style('testimonial-card', {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-lg)',
  padding: 'var(--space-2xl)',
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-xl)',
  minHeight: 220,
  parts: {
    quote: {
      margin: 0,
      fontSize: 'var(--text-md)',
      color: 'var(--fg)',
      lineHeight: 1.6,
    },
    author: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--fg)',
    },
    role: {
      margin: 0,
      color: 'var(--fg-muted)',
      fontSize: 'var(--text-sm)',
    },
  },
});
