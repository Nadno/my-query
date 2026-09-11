/** Predicados locais da slice element: distinguem props, tupla de componente e nó. */
import type { ComponentTuple } from '../types';
/** `[Component, props]` — tupla lazy/cacheável (não é signal nem Node nem array de nós). */
export declare function isComponentTuple(value: unknown): value is ComponentTuple;
/** Primeiro arg de `createTag` na forma elemento: um objeto de props (não Node/array/signal). */
export declare function isProps(value: unknown): value is Record<string, unknown>;
