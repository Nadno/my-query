/**
 * Control-flow. Só as **condições** são rastreadas; a construção da **view** roda
 * destrastreada (`untrack`), então signals lidos ao montar a subárvore NÃO viram
 * dependência da região (evita remontar a árvore inteira — "bug 1"). O separador
 * entre condição e construção é a **posição**: o runtime não distingue um read de
 * condição de um de construção sem rastrear, e rastrear reintroduz o bug 1.
 *
 * - `match([cond, view], …, fallback?)` — multi-via flat; 1ª cond truthy vence.
 * - `when(cond, then, else?)` — açúcar de 2 casos sobre `match`.
 * - `switchOn(selector, cases, fallback?)` — despacho por chave (enum-like).
 * - `ELSE` — sentinela truthy p/ escrever o catch-all em forma de tupla.
 * - `each(items, Comp, keyFn)` — lista keyed a partir de fonte reativa (açúcar de região).
 */
import { type Bindable } from '../reactive';
import type { Component } from '../types';
/** Sentinela de catch-all: `[$.else, view]` — sempre "verdadeiro". */
export declare const ELSE: unique symbol;
type View = () => unknown;
type Case = readonly [cond: Bindable<unknown> | typeof ELSE, view: View];
type MatchArg = Case | View;
/** Multi-via flat: 1ª cond truthy (ou `ELSE`) vence; view montada destrastreada. */
export declare function match(...cases: MatchArg[]): View;
/** Açúcar de 2 casos sobre `match` (mantém o contrato de `when`). */
export declare function when(cond: Bindable<unknown>, thenFn: View, elseFn?: View): View;
/** Despacho por chave (enum-like); `String(selector)` indexa `cases`. */
export declare function switchOn<T>(selector: Bindable<T>, cases: Record<string, View>, fallback?: View): View;
/**
 * Lista keyed a partir de uma fonte (signal, função ou array — readonly ok). Devolve
 * uma View (região): cada item vira `[Comp, { ...item, key: keyFn(item) }]`.
 * `Comp` recebe o **próprio item** como props (o tipo erra se o item não tiver o
 * que `Comp` precisa). **`key` é reservada**: o `keyFn` prevalece sobre um `key`
 * que o item já tenha (não carregue dado sob `key`; a `Comp` não lê `key` tipada —
 * igual React). Para filtrar, passe a fonte derivada (`() => arr.filter(...)`);
 * para props derivadas ou branching, use a tupla crua.
 */
export declare function each<T>(items: Bindable<readonly T[]>, Comp: Component<T>, key: (item: T) => string | number): View;
export {};
