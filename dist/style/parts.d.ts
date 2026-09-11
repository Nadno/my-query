/**
 * `parts` — normalização do config de um bloco.
 *
 * Separa o config em:
 *  - `meta`   → ficha técnica (chave exata `$:`): scope/hosts/defaults/flags/variants/keyframes;
 *  - `parts`  → declaradas como chaves `$nome` (filho direto) e, em transição, `>nome`/`parts:{}`
 *               (legacy, avisa depreciação);
 *  - `decls`  → o resto (declarações CSS, `&…`, `@…` e seletores compostos com refs `$`).
 *
 * Refs `$` em selectores compostos NÃO são resolvidas aqui — quem resolve é o `buildNode` via o
 * mapa GLOBAL de refs do bloco (`collectPartRefs`).
 */
import type { PartRefs } from './emit';
import type { ScopeConfig, StyleConfig, StyleMeta } from './types';
export declare function isDollarPartKey(key: string): boolean;
export interface SplitConfig {
    meta: StyleMeta;
    /** Partes do idioma novo `$nome` (filho direto `& >`). */
    parts: Record<string, StyleConfig>;
    /** Partes legacy `parts:{}`/`>nome` (descendente, compat até migrar). */
    explicitParts: Record<string, StyleConfig>;
    decls: Record<string, unknown>;
}
/**
 * Caminho central: separa `$:`/`$nome`/`parts:{}`/`>nome`/decls.
 * `$:` é a forma nova da ficha técnica; as chaves legacy no topo (`flags`/`variants`/
 * `defaults`/`keyframes`/`slots`) também alimentam o meta, na transição.
 * Quando `silent`, não avisa depreciação (usado pela coleta de refs).
 */
export declare function splitConfigCore(config: StyleConfig, silent?: boolean): SplitConfig;
/** Mescla partes: a declaração "destaque" (parts/$nome/>nome) prevalece em conflito de chave. */
export declare function mergePartConfigs(shorthand: StyleConfig, explicit?: StyleConfig): StyleConfig;
export declare function splitConfig(config: StyleConfig): SplitConfig;
/**
 * Coleta recursivamente TODAS as refs de parte do bloco (nome → classe).
 * Classes são depth-independent (`-{bloco}-{chave}`, `scope.ts`), então cada
 * `$nome` do bloco resolve para a mesma classe em qualquer profundidade —
 * um único mapa global serve para o "nivelamento" (ref de neto no root).
 * `silent` evita warns de depreciação do `parts:`/`>nome` durante a coleta.
 */
export declare function collectPartRefs(scope: ScopeConfig, block: string, config: StyleConfig): PartRefs;
