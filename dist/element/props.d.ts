/**
 * Props → elemento. Chaves especiais (`class`/`style`/`data`/`on`/`use`/`key`) e o
 * `$`-prefixo reativo (`$disabled`, `$class`, …) que liga a fonte via `bind`.
 */
import type { MQ } from '../types';
/**
 * Aplica as props ao elemento e **devolve** o valor de `use` (behaviors) sem aplicá-lo:
 * o caller (`createTag`) roda os behaviors **depois** de anexar os filhos, para que o
 * elemento já esteja completo (ex.: `$model` num `<select>` precisa das `<option>`).
 */
export declare function applyProps(el: Element, ctx: MQ, props: Record<string, unknown>): unknown;
