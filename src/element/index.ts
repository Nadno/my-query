/**
 * Slice element — construção de nós DOM a partir de builders. Barril público.
 *
 * - `create`   — `createTag` (fábrica dupla setup|elemento).
 * - `props`    — `applyProps` (chaves especiais + `$`-prefixo reativo).
 * - `children` — `appendChild` (normaliza qualquer filho renderizável).
 * - `region`   — região reativa keyed (listas/fontes reativas).
 * - `control`  — `when` (control-flow).
 * - `guards`   — predicados locais (`isComponentTuple`/`isProps`).
 */

export { createTag } from './create';
export { appendChild } from './children';
export { when } from './control';
