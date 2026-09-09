/**
 * Type-test de `$.each` — compilado pelo `npm run typecheck` (TS2578 falha se um
 * `@ts-expect-error` não consumir erro nenhum). Não é teste de runtime.
 *
 * As promessas de tipo que isso trava:
 *  - `Comp` recebe o **próprio item**: subconjunto aceito; campo que o item não
 *    tem → erro **no call site** (não dentro da lib).
 *  - `key` é **reservada**: `keyFn` prevalece sobre um `key` do próprio item; a
 *    `Comp` não lê `key` tipada (igual React — `key` não é dado).
 *  - Fonte aceita signal, função derivada, array cru e `readonly` array.
 *  - Fonte nullish (`Signal<T[] | null>`) é recusada em tipo (guard `?? []` é
 *    só defesa de runtime).
 */
import { signal } from '@preact/signals-core';
import { createTag } from '../create';
import { each } from '../control';

const mk = () => createTag('li');

interface Tx {
  id: number;
  title: string;
}

/* ---- positivos ---- */

// A. item exato
const RowA = (t: Tx) => { void t; return mk(); };
const a1 = each(signal<Tx[]>([]), RowA, (t) => t.id);

// B. subconjunto do item é aceito (Comp lê menos do que o item tem)
const RowB = (t: { id: number }) => { void t; return mk(); };
const b1 = each(signal<Tx[]>([]), RowB, (t) => t.id);

// C. item já tem `key` de um tipo e keyFn devolve outro: compila (keyFn vence;
//    a chave de reconciliação é a do keyFn). `key` em dado do item não sobrevive.
interface WithKey {
  key: string;
  id: number;
}
const RowD = (t: WithKey) => { void t; return mk(); };
const d1 = each(signal<WithKey[]>([]), RowD, () => 1);

// D2. idem com key numérica + keyFn string
interface WithKeyNum {
  key: number;
  id: number;
}
const RowE = (t: WithKeyNum) => { void t; return mk(); };
const e1 = each(signal<WithKeyNum[]>([]), RowE, () => 'k');

// E. fontes: função derivada, array cru, readonly array
const g1 = each(() => [{ id: 1 }], RowB, (t) => t.id);
const g2 = each([{ id: 1 }], RowB, (t) => t.id);
const g3 = each([{ id: 1 }] as readonly { id: number }[], RowB, (t) => t.id);

/* ---- negativos (must-error) ---- */

// N1. Comp quer campo que o item não tem → erro no call site
const RowM1 = (t: { id: number; extra: boolean }) => { void t.extra; return mk(); };
// @ts-expect-error item não tem `extra`
const n1 = each(signal<{ id: number }[]>([]), RowM1, (t) => t.id);

// N2. Comp lê `key` mas o item não a declara → erro (key não é dado)
const RowM2 = (t: { key: string; id: number }) => { void t.key; return mk(); };
// @ts-expect-error `key` é reservada: Comp não lê key tipada
const n2 = each(signal<{ id: number }[]>([]), RowM2, (t) => t.id);

// N3. fonte nullish → recusada em tipo
const hSig = signal<Tx[] | null>(null);
// @ts-expect-error fonte nullish não é lista
const n3 = each(hSig, RowA, (t) => t.id);

void [a1, b1, d1, e1, g1, g2, g3, n1, n2, n3];
