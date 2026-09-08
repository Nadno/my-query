/** Adapter de reatividade para @preact/signals-core. */

import { signal as createSignal, effect, untracked, Signal } from '@preact/signals-core';
import type { ReactiveAdapter } from '../reactive';

export const preact: ReactiveAdapter = {
  isSignal: (value) => value instanceof Signal,
  getValue: <T>(signal: unknown) => (signal as Signal<T>).value,
  effect: (run) => effect(run),
  untrack: (fn) => untracked(fn),
  signal: <T>(initial: T) => createSignal<T>(initial),
  setValue: <T>(signal: unknown, value: T) => {
    (signal as Signal<T>).value = value;
  },
};
