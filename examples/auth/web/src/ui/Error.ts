import $ from 'mini-q';
import { style } from 'mini-q/style';
import type { Child } from 'mini-q';

const sError = style('error-state', {
  padding: 'var(--space-lg) var(--space-2xl)',
  color: '#fecaca',
  background: 'var(--danger-faint)',
  border: '1px solid rgba(239,68,68,.3)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-md)',
});

export function Error(p: { children: Child }) {
  return $.div({ class: sError }, p.children);
}
