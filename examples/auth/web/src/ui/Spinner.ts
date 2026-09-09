import $ from 'mini-q';
import { style } from 'mini-q/style';

const sSpinner = style('spinner', {
  display: 'inline-block',
  width: '1.25em',
  height: '1.25em',
  border: '2px solid var(--line)',
  borderTopColor: 'var(--accent)',
  borderRadius: '50%',
  animation: 'mq-spin 1s linear infinite',
});

style.css('@keyframes mq-spin', {
  to: { transform: 'rotate(360deg)' },
});

export function Spinner() {
  return $.span({ class: sSpinner });
}
