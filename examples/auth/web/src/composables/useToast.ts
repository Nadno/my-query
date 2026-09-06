import { signal } from '@preact/signals-core';

export interface Toast {
  id: number;
  type: 'error' | 'success';
  message: string;
}

export const toasts = signal<Toast[]>([]);
let nextId = 1;

export function useToast() {
  function push(type: Toast['type'], message: string, ms = 4000) {
    const id = nextId++;
    toasts.value = [...toasts.value, { id, type, message }];
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, ms);
  }
  return {
    error: (message: string) => push('error', message),
    success: (message: string) => push('success', message),
  };
}
