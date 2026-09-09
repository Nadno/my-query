import { signal } from '@preact/signals-core';
import { Task } from '@/$stdlib/task';
import type { TimeInput } from '@/$stdlib/time-span';

export interface Toast {
  id: number;
  type: 'error' | 'success';
  message: string;
}

export const toasts = signal<Toast[]>([]);
let nextId = 1;

export function useToast() {
  function push(type: Toast['type'], message: string, ms: TimeInput = '4s') {
    const id = nextId++;
    toasts.value = [...toasts.value, { id, type, message }];
    Task.wait(`toast_${id}`, ms, () => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    });
  }
  return {
    error: (message: string) => push('error', message),
    success: (message: string) => push('success', message),
  };
}
