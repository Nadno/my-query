import { signal as t, untracked as n, effect as l, Signal as c } from "@preact/signals-core";
const f = {
  isSignal: (e) => e instanceof c,
  getValue: (e) => e.value,
  effect: (e) => l(e),
  untrack: (e) => n(e),
  signal: (e) => t(e),
  setValue: (e, a) => {
    e.value = a;
  }
};
export {
  f as preact
};
