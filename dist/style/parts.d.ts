/**
 * `parts` — normalização do config de um bloco: separa o açúcar `>nome` (atalho para partes)
 * do resto das declarações, recursivamente, e mescla com `parts` explícito (precedência do atalho).
 */
import type { StyleConfig } from './types';
/** Separa chaves `>nome` (atalho para partes) do resto do config, recursivamente. */
export declare function splitShortcutParts(config: StyleConfig): {
    decls: Record<string, unknown>;
    parts: Record<string, StyleConfig>;
};
/** Junta partes do atalho `>nome` com partes declaradas em `parts` (atalho prevalece em conflito). */
export declare function mergeParts(shortcut: Record<string, StyleConfig>, explicit?: Record<string, StyleConfig>): Record<string, StyleConfig>;
