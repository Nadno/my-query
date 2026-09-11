/** `use` — aplicação de behaviors + behaviors base (model, show). */
import { type Bindable } from './reactive';
import type { Behavior, MQ } from './types';
export declare function applyUse(ctx: MQ, use: Behavior | Behavior[]): void;
/** Signal com leitura e escrita de `.value` (contrato mínimo p/ two-way). */
export interface WritableSignal<T> {
    value: T;
}
/** Valor two-way suportado por `model`, conforme o tipo de controle. */
export type ModelValue = string | number | boolean | (string | number)[];
/** Opções de `$model` para alinhar com `v-model` do Vue. */
export interface ModelOptions {
    /** Valor escrito quando um checkbox único está marcado. Default: `true`. */
    trueValue?: unknown;
    /** Valor escrito quando desmarcado. Default: `false`. */
    falseValue?: unknown;
    /** Sincroniza DOM→signal no `change` em vez de `input` (só afeta o modo string). */
    lazy?: boolean;
    /** Casta o `value` string → número ao escrever (`looseToNumber`: falha → mantém string). */
    number?: boolean;
    /** Apara espaços do `value` string ao escrever. */
    trim?: boolean;
}
type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
/**
 * Two-way binding para inputs/select/textarea. O modo é **auto-detectado** pelo
 * elemento + tipo do valor atual do signal:
 * - `<input type="checkbox">` com signal **array** → grupo (alterna `el.value` no array);
 * - `<input type="checkbox">` caso contrário → booleano (`.checked`);
 * - `<input type="radio">` → grupo de seleção única; marca se `el.value === signal`, escreve `el.value` ao selecionar;
 * - `<select multiple>` → array dos `value` selecionados;
 * - demais (`text`/`number`/`textarea`/`select` simples) → `el.value` string.
 *
 * Ligação DOM←signal via `bind`; DOM→signal via `$on` (cleanup automático no escopo).
 * Um checkbox-group deve inicializar o signal como array.
 */
export declare function model(signal: WritableSignal<string>): Behavior<FieldElement>;
export declare function model(signal: WritableSignal<string>, options: ModelOptions): Behavior<FieldElement>;
export declare function model(signal: WritableSignal<number>): Behavior<FieldElement>;
export declare function model(signal: WritableSignal<number>, options: ModelOptions): Behavior<FieldElement>;
export declare function model(signal: WritableSignal<boolean>): Behavior<HTMLInputElement>;
export declare function model(signal: WritableSignal<boolean>, options: ModelOptions): Behavior<HTMLInputElement>;
export declare function model(signal: WritableSignal<(string | number)[]>): Behavior<HTMLInputElement | HTMLSelectElement>;
export declare function model(signal: WritableSignal<(string | number)[]>, options: ModelOptions): Behavior<HTMLInputElement | HTMLSelectElement>;
/**
 * Alterna `hidden` conforme a condição (preserva estado, sem desmontar).
 * Sem teardown imperativo: o cleanup do `bind` já é auto-registrado no escopo,
 * então não há nada a mover para `onUnmounted`.
 */
export declare function show(cond: Bindable<boolean>): Behavior<HTMLElement>;
/** Alvo de `$useTeleport`: seletor, elemento, ou função que resolve um deles. */
export type TeleportTarget = string | Element | (() => string | Element);
/**
 * Teleporta o **próprio elemento do contexto** (`ctx.element`) para outro lugar da DOM,
 * fora da árvore do pai — útil para modais, toasts e overlays que precisam escapar de
 * `overflow:hidden` ou de contextos de empilhamento (z-index) do pai.
 *
 * - **Só monta**: sem `open` interno — quem decide renderizar é o `$when` externo.
 * - **Alvo reativo**: se `target` for função, um `effect` observa o alvo resolvido e
 *   **move o nó vivo** para o novo alvo (sem desmontar/remontar). O `stop` do effect é
 *   registrado no escopo, então para no unmount (cobre o caso de `$when`).
 * - **Cleanup**: ao desmontar o escopo, o `disposeScope` do pai já remove os nós; o
 *   behavior só precisa parar o effect do alvo reativo.
 */
export declare function useTeleport(target: TeleportTarget): Behavior<Element>;
export {};
