import $ from 'mini-q';
import { toasts, type Toast } from '../composables/useToast';

const host = $.style('toast-host', {
  position: 'fixed',
  top: '1rem',
  right: '1rem',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  gap: '.5rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxWidth: 360,
});

// `type` é exclusivo (error XOR success) → variante, não flags.
const item = $.style('toast', {
  padding: '.85rem 1rem',
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: '#2a2a2a',
  boxShadow: '0 8px 24px rgba(0,0,0,.35)',
  variants: {
    type: {
      error: { borderColor: 'rgba(239,68,68,.4)', color: '#fecaca' },
      success: { borderColor: 'rgba(16,185,129,.4)', color: '#a7f3d0' },
    },
  },
});

function ToastItem(t: Toast & { key?: number }) {
  return $.li({ class: item({ type: t.type }) }, t.message);
}

export function ToastHost() {
  return $.ul({ class: host }, () =>
    toasts.value.map(
      (t) =>
        [ToastItem, { ...t, key: t.id }] as [
          typeof ToastItem,
          Toast & { key: number },
        ],
    ),
  );
}
