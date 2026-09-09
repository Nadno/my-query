import { style } from 'mini-q/style';

style.css(':root', {
  colorScheme: 'dark',

  // paleta
  '--bg': '#1a1a1a',
  '--bg-elevated': '#2a2a2a',
  '--fg': '#ffffff',
  '--fg-muted': 'rgba(255,255,255,.7)',
  '--fg-subtle': 'rgba(255,255,255,.55)',
  '--card': 'rgba(255,255,255,.05)',
  '--line': 'rgba(255,255,255,.1)',

  '--accent': '#667eea',
  '--accent-2': '#764ba2',
  '--accent-faint': 'rgba(102,126,234,.15)',
  '--danger': '#ef4444',
  '--danger-faint': 'rgba(239,68,68,.2)',
  '--ok': '#10b981',
  '--ok-faint': 'rgba(16,185,129,.2)',

  // espaçamento
  '--space-xs': '.25rem',
  '--space-sm': '.5rem',
  '--space-md': '.75rem',
  '--space-lg': '1rem',
  '--space-xl': '1.25rem',
  '--space-2xl': '1.5rem',
  '--space-3xl': '2rem',

  // raios
  '--radius-sm': '8px',
  '--radius-md': '10px',
  '--radius-lg': '12px',
  '--radius-xl': '16px',

  // sombras
  '--shadow-sm': '0 4px 12px rgba(0,0,0,.25)',
  '--shadow-md': '0 8px 24px rgba(0,0,0,.35)',
  '--shadow-lg': '0 12px 32px rgba(0,0,0,.4)',

  // z-index
  '--z-popover': '20',
  '--z-toast': '2000',

  // tipografia
  '--font-ui': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  '--text-sm': '.85rem',
  '--text-md': '1rem',
  '--text-lg': '1.25rem',
  '--text-xl': '1.6rem',
});

style.css('*', { boxSizing: 'border-box' });

style.css('body', {
  margin: 0,
  fontFamily: 'var(--font-ui)',
  background: 'var(--bg)',
  color: 'var(--fg)',
  lineHeight: 1.6,
});
