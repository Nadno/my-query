/**
 * Type-test de `$when`/`$match`/`$switch`/`$else` — compilado pelo `npm run typecheck`
 * (TS2578 falha se um `@ts-expect-error` não consumir erro). Não é teste de runtime.
 *
 * Contrato travado:
 *  - Ramos são **thunks** (`() => renderizável`) — aceitam elemento, região aninhada,
 *    `null` ou qualquer filho; o tipo é `unknown` por design (é a saída p/ control-flow).
 *  - Condição aceita signal, função derivada ou cru.
 *  - O retorno é uma `View` (= `() => unknown`), usável como `Child`.
 *  - `ELSE` só vale **dentro de uma tupla** `[ELSE, view]` (Case); solto, erra.
 *
 * Costura sabida (não é testável em tipo): uma **tupla crua** em posição de Child/view
 * (`() => [...itens.map(t => [Row, {...t, key}])]`) NÃO confere as props com a `Comp`
 * (`ComponentTuple<P = any>`) — o caminho **tipado** para listas é `$.each`; a tupla crua
 * é o escape hatch para branching/props derivadas, onde o contrato é da `Comp`, não do tipo.
 */
import { signal } from '@preact/signals-core';
import { createTag } from '../create';
import { when, match, switchOn, ELSE } from '../control';
import type { Child } from '../../types';

const li = () => createTag('li');

const open = signal(true);
const inner = signal(true);

/* ---- positivos ---- */

// cond signal | função derivada | cru
const w1 = when(open, () => li());
const w2 = when(() => open.value, () => li(), () => null);
const w3 = when(true, () => li());
// retorno é Child (pode ir em qualquer posição de filho)
const w4: Child = when(false, () => li());

// ramo retornando outra região (view aninhada) — e reage por conta própria
const w5 = when(open, () => when(inner, () => li(), () => null));

// match: tuplas + ELSE em tupla + fallback solto
const m1 = match([open, () => li()], [ELSE, () => null]);
const m3 = match(() => null);

// switchOn: despacho por chave
const key = signal<'a' | 'b'>('a');
const s1 = switchOn(key, { a: () => li(), b: () => null });

/* ---- negativos (must-error) ---- */

// N1. else/thne deve ser thunk, não valor cru
// @ts-expect-error ramo precisa ser função (View)
const n1 = when(open, li());

// N2. ELSE sozinho não é Case — precisa da tupla `[ELSE, view]`
// @ts-expect-error ELSE só vale dentro de uma tupla (Case)
const n2 = match(ELSE, () => li());

void [w1, w2, w3, w4, w5, m1, m3, s1, n1, n2];
