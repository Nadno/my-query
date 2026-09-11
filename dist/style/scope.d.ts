/**
 * `scope` — lógica de escopo do estilo: motor (native/prefixed), nome/prefixo, hash.
 * Centraliza como classes (do root e das partes) e ids são derivados do escopo de um bloco —
 * a fonte única de nomes, para que classes e `id` nunca colidam entre escopos.
 */
import type { ScopeConfig, StyleConfig } from './types';
/** Hash curto e estável de um nome (base36, 4 chars) para `name: 'hashed'`. */
export declare function hashScope(name: string): string;
/** Resolve o escopo final de um bloco: global do `config` mesclado com o local do `style()`. */
export declare function resolveScope(local: ScopeConfig | undefined, block: string): ScopeConfig;
/** Classe do root do bloco sob o escopo: `[prefixo-]bloco` (prefixed) | `bloco` (native). */
export declare function rootOf(scope: ScopeConfig, block: string): string;
/** Classe de uma parte sob o escopo: `-{prefixo?-}{bloco}-{chave}`. */
export declare function partClass(scope: ScopeConfig, block: string, key: string): string;
/** Constrói um `id` scoped a partir do nome do escopo e de um id local de filho. */
export declare function scopedId(scope: ScopeConfig, block: string, local: string): string;
/** Contexto de construção de um bloco: escopo resolvido + acumulador de regras CSS. */
export interface BuildCtx {
    scope: ScopeConfig;
    block: string;
    /** Classe do root sob o escopo (`acme-card` | `card`). */
    root: string;
    native: boolean;
    /** Regras CSS geradas (seletor plano). Em `native`, embrulhadas em `@scope` ao final. */
    out: string[];
    /** Mapa nome de slot → classe selecionada (para flags/variants mirarem). */
    slots: Record<string, string>;
    /** Resolve a classe selecionada de um slot declarado neste nó. */
    slotSel?: (k: string) => string | undefined;
}
/** Chaves reservadas do `StyleConfig` (não são declarações de CSS). */
export declare const RESERVED: Set<string>;
export declare function parseLocalScope(config: StyleConfig): ScopeConfig | undefined;
