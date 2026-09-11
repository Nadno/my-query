/**
 * `build` — orquestrador do estilo: `$.style(nome, config)` → `StyleHandle`.
 *
 * Monta o escopo e o contexto, delega a recursão de partes ao `buildNode`, e emite o CSS:
 * - `native` → agrupa `ctx.out` num único `@scope (.root) to (…)`.
 * - `prefixed` → injeta as regras planas (classes com prefixo do nome do escopo).
 *
 * A recursão e a montagem do handle vivem em `buildNode.ts`; a lógica de escopo/nome em `scope.ts`.
 */
import type { StyleApi, StyleConfig, StyleHandle } from './types';
export declare const style: StyleApi;
/**
 * @deprecated Use `$.style(name, { parts: { … } })` e acesse `handle.x`. Alias por 1 versão.
 */
export declare function parts<T extends StyleConfig>(name: string, tree: Record<string, T>): StyleHandle;
