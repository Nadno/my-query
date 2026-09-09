import $ from 'mini-q';
import { toasts, type Toast } from '../composables/useToast';
import { sToast, sToastHost } from './ToastHost.style';

function ToastItem(t: Toast & { key?: number }) {
  return $.li({ class: sToast({ type: t.type }) }, t.message);
}

export function ToastHost() {
  return $.ul({ class: sToastHost }, () =>
    toasts.value.map(
      (t) =>
        [ToastItem, { ...t, key: t.id }] as [
          typeof ToastItem,
          Toast & { key: number },
        ],
    ),
  );
}
