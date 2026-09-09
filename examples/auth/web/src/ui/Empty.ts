import $ from 'mini-q';
import { style } from 'mini-q/style';
import type { Child } from 'mini-q';

const sEmpty = style('empty', {
  padding: 'var(--space-2xl)',
  textAlign: 'center',
  color: 'var(--fg-subtle)',
  border: '1px dashed var(--line)',
  borderRadius: 'var(--radius-lg)',
});

export function Empty(p: { children: Child }) {
  return $.div({ class: sEmpty }, p.children);
}
