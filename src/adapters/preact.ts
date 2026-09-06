/** Adapter de reatividade para @preact/signals-core. */

import { effect, Signal } from '@preact/signals-core';
import type { ReactiveAdapter } from '../reactive';

export const preact: ReactiveAdapter = {
  isSignal: (value) => value instanceof Signal,
  getValue: <T>(signal: unknown) => (signal as Signal<T>).value,
  effect: (run) => effect(run),
};
