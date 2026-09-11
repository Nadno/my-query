/**
 * `scope` — lógica de escopo do estilo: motor (native/prefixed), nome/prefixo, hash.
 * Centraliza como classes (do root e das partes) e ids são derivados do escopo de um bloco —
 * a fonte única de nomes, para que classes e `id` nunca colidam entre escopos.
 */

import { getGlobalScope } from './config';
import { toKebab } from './emit';
import type { PartRefs } from './emit';
import type { ScopeConfig, StyleConfig } from './types';

/** Hash curto e estável de um nome (base36, 4 chars) para `name: 'hashed'`. */
export function hashScope(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const out = (h >>> 0).toString(36);
  return out.length <= 4 ? out : out.slice(-4);
}

/** Resolve o escopo final de um bloco: global do `config` mesclado com o local do `style()`. */
export function resolveScope(local: ScopeConfig | undefined, block: string): ScopeConfig {
  const merged: ScopeConfig = { ...getGlobalScope(), ...local };
  if (merged.name === 'hashed') merged.name = hashScope(block);
  if (!merged.strategy) merged.strategy = 'prefixed';
  return merged;
}

/** Classe do root do bloco sob o escopo: `[prefixo-]bloco` (prefixed) | `bloco` (native). */
export function rootOf(scope: ScopeConfig, block: string): string {
  if (scope.strategy === 'prefixed' && scope.name && scope.name !== 'hashed') {
    return `${scope.name}-${block}`;
  }
  return block;
}

/** Classe de uma parte sob o escopo: `-{prefixo?-}{bloco}-{chave}`. */
export function partClass(scope: ScopeConfig, block: string, key: string): string {
  const prefix = scope.name && scope.name !== 'hashed' ? scope.name : block;
  return `-${prefix}-${toKebab(key)}`;
}

/** Constrói um `id` scoped a partir do nome do escopo e de um id local de filho. */
export function scopedId(scope: ScopeConfig, block: string, local: string): string {
  const base = scope.name && scope.name !== 'hashed' ? `${scope.name}-${block}` : block;
  return `${base}-${local}`;
}

/** Contexto de construção de um bloco: escopo resolvido + acumulador de regras CSS. */
export interface BuildCtx {
  scope: ScopeConfig;
  block: string;
  /** Classe do root sob o escopo (`acme-card` | `card`). */
  root: string;
  native: boolean;
  /** Regras CSS geradas (seletor plano). Em `native`, embrulhadas em `@scope` ao final. */
  out: string[];
  /** Mapa de refs `$` GLOBAL do bloco (todas as partes, depth-independent). */
  partRefs: PartRefs;
  /** Resolve a classe do host declarado em `$: { hosts }`. */
  hostSel?: (k: string) => string | undefined;
}

/** Chaves reservadas do `StyleConfig` (não são declarações de CSS). */
export const RESERVED = new Set(['$', 'parts', 'scope', 'flags', 'variants', 'defaults', 'slots', 'hosts', 'keyframes']);

/** Lê o escopo local do bloco: da ficha técnica `$: { scope }`. (Legacy: `scope` no topo.) */
export function parseLocalScope(config: StyleConfig): ScopeConfig | undefined {
  const meta = (config as { $?: { scope?: ScopeConfig } }).$;
  if (meta?.scope) return meta.scope;
  return (config as { scope?: ScopeConfig }).scope as ScopeConfig | undefined;
}
