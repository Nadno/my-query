/**
 * `buildNode` — percorre a árvore de um bloco, injeta as regras CSS no acumulador (`ctx.out`)
 * e monta o `StyleHandle` (callable + `self`/`flags`/`variants`/`keyframes`/`slots`/partes).
 */
import type { BuildCtx } from './scope';
import type { StyleConfig, StyleHandle } from './types';
export declare function buildNode(config: StyleConfig, ctx: BuildCtx, path: string[]): StyleHandle;
