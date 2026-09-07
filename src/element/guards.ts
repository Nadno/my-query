/** Predicados locais da slice element: distinguem props, tupla de componente e nó. */

import { isSignal } from '../reactive';
import { isNode } from '../dom/nodes';
import type { ComponentTuple } from '../types';

/** `[Component, props]` — tupla lazy/cacheável (não é signal nem Node nem array de nós). */
export function isComponentTuple(value: unknown): value is ComponentTuple {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'function' &&
    !isSignal(value[0]) &&
    (value[1] == null ||
      (typeof value[1] === 'object' && !isNode(value[1]) && !Array.isArray(value[1])))
  );
}

/** Primeiro arg de `createTag` na forma elemento: um objeto de props (não Node/array/signal). */
export function isProps(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isNode(value) &&
    !Array.isArray(value) &&
    !isSignal(value)
  );
}
