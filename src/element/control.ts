/**
 * Control-flow. `when(cond, then, else?)` devolve uma função-região: só a `cond`
 * é rastreada; a construção do ramo roda destrastreada, então signals lidos ao montar
 * a subárvore NÃO viram dependência da região (evita remontar a árvore inteira).
 */

import { read, untrack, type Bindable } from '../reactive';

export function when(
  cond: Bindable<unknown>,
  thenFn: () => unknown,
  elseFn?: () => unknown,
): () => unknown {
  return () => (read(cond) ? untrack(thenFn) : elseFn ? untrack(elseFn) : null);
}
