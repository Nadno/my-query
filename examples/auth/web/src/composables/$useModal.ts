import { signal } from '@preact/signals-core';

export function $useModal(initial = false) {
  const open = signal(initial);
  return {
    open,
    isOpen: () => open.value,
    show: () => {
      open.value = true;
    },
    hide: () => {
      open.value = false;
    },
    toggle: () => {
      open.value = !open.value;
    },
  };
}
