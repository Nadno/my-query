/**
 * `buildNode` — percorre a árvore de um bloco, injeta as regras CSS no acumulador (`ctx.out`)
 * e monta o `StyleHandle` (callable + `self`/`flags`/`variants`/`keyframes`/`hosts`/partes).
 *
 * Contrato `$` (spec `docs/proposals/style-part-refs.md`):
 *  - parte declarada como `$nome` emite **filho direto** (`& > .-bloco-nome`);
 *  - refs `$` em selector composto são **globais ao bloco** — um único `PartRefs` coleciona
 *    todas as partes do bloco (depth-independent), resolvendo refs de qualquer profundidade;
 *  - legacy `parts:{}` (deprecado) mantém **descendente** (`& .-bloco-nome`); `$nome` prevalece
 *    em conflito de nome.
 */
import type { BuildCtx } from './scope';
import type { StyleConfig, StyleHandle } from './types';
/** Nível no path: classe própria + se a subida do pai é filho direto (`>`). */
interface PathLevel {
    cls: string;
    direct: boolean;
}
export declare function buildNode(config: StyleConfig, ctx: BuildCtx, path: PathLevel[]): StyleHandle;
export {};
