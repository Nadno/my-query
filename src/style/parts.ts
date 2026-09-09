/**
 * `parts` — normalização do config de um bloco: separa o açúcar `>nome` (atalho para partes)
 * do resto das declarações, recursivamente, e mescla com `parts` explícito (precedência do atalho).
 */

import type { StyleConfig } from './types';

/** Separa chaves `>nome` (atalho para partes) do resto do config, recursivamente. */
export function splitShortcutParts(config: StyleConfig): {
  decls: Record<string, unknown>;
  parts: Record<string, StyleConfig>;
} {
  const decls: Record<string, unknown> = {};
  const parts: Record<string, StyleConfig> = {};
  for (const key in config) {
    if (key.startsWith('>')) {
      const name = key.slice(1);
      const value = config[key];
      if (value && typeof value === 'object') {
        const { decls: nestedDecls, parts: nestedParts } = splitShortcutParts(value as StyleConfig);
        parts[name] = { ...nestedDecls, parts: nestedParts } as StyleConfig;
      } else {
        console.warn(`[mini-q] "${key}" deve ser um objeto de estilo — ignorado.`);
      }
      continue;
    }
    decls[key] = config[key];
  }
  return { decls, parts };
}

/** Junta partes do atalho `>nome` com partes declaradas em `parts` (atalho prevalece em conflito). */
export function mergeParts(
  shortcut: Record<string, StyleConfig>,
  explicit?: Record<string, StyleConfig>,
): Record<string, StyleConfig> {
  if (!explicit) return shortcut;
  const merged: Record<string, StyleConfig> = {};
  for (const k in explicit) merged[k] = explicit[k]!;
  for (const k in shortcut) {
    const { decls: nestedDecls, parts: nestedParts } = splitShortcutParts(shortcut[k]!);
    if (explicit[k]) {
      const { decls: expDecls, parts: expParts } = splitShortcutParts(explicit[k]!);
      merged[k] = mergeParts(nestedParts, expParts);
      merged[k] = { ...expDecls, ...nestedDecls, parts: merged[k] } as StyleConfig;
    } else {
      merged[k] = { ...nestedDecls, parts: nestedParts } as StyleConfig;
    }
  }
  return merged;
}
