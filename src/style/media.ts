/**
 * `$.media` — breakpoint reativo. Cria um signal<boolean> que reflete `matchMedia`
 * (aceita nome de breakpoint registrado, número, ou query crua), com cleanup no escopo.
 */

import { createSignal } from '../reactive';
import { registerCleanup } from '../lifecycle';
import { resolveMedia } from './config';

export function media(nameOrQuery: string): { readonly value: boolean } {
  const query = resolveMedia(nameOrQuery);

  if (typeof matchMedia === 'undefined') {
    // ambiente sem matchMedia (SSR/teste sem mock): signal estático `false`
    return createSignal(false) as { readonly value: boolean };
  }

  const mql = matchMedia(query);
  const sig = createSignal(mql.matches);
  const onChange = (e: MediaQueryListEvent) => {
    sig.value = e.matches;
  };
  mql.addEventListener('change', onChange);
  registerCleanup(() => mql.removeEventListener('change', onChange));

  return sig as { readonly value: boolean };
}
