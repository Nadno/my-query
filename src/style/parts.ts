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
import { partClass } from './scope';
import type { ScopeConfig, StyleConfig, StyleMeta } from './types';

const DOLLAR_PART = /^\$[A-Za-z0-9_-]+$/;

export function isDollarPartKey(key: string): boolean {
  return key !== '$' && DOLLAR_PART.test(key);
}

export interface SplitConfig {
  meta: StyleMeta;
  /** Partes do idioma novo `$nome` (filho direto `& >`). */
  parts: Record<string, StyleConfig>;
  /** Partes legacy `parts:{}`/`>nome` (descendente, compat até migrar). */
  explicitParts: Record<string, StyleConfig>;
  decls: Record<string, unknown>;
}

const RESERVED_REF = new Set(['self', 'flags', 'variants', 'keyframes', 'hosts', 'slots']);

/**
 * Caminho central: separa `$:`/`$nome`/`parts:{}`/`>nome`/decls.
 * `$:` é a forma nova da ficha técnica; as chaves legacy no topo (`flags`/`variants`/
 * `defaults`/`keyframes`/`slots`) também alimentam o meta, na transição.
 * Quando `silent`, não avisa depreciação (usado pela coleta de refs).
 */
export function splitConfigCore(config: StyleConfig, silent = false): SplitConfig {
  const meta: StyleMeta = {};
  const parts: Record<string, StyleConfig> = {};
  const explicitParts: Record<string, StyleConfig> = {};
  const decls: Record<string, unknown> = {};

  for (const key in config) {
    const value = config[key];

    if (key === '$') {
      Object.assign(meta, (value ?? {}) as StyleMeta);
      continue;
    }

    if (isDollarPartKey(key)) {
      const name = key.slice(1);
      if (value && typeof value === 'object') {
        parts[name] = (parts[name] as StyleConfig | undefined)
          ? mergePartConfigs(value as StyleConfig, parts[name]!)
          : (value as StyleConfig);
      } else if (!silent) {
        console.warn(`[mini-q] "${key}" deve ser um objeto de estilo — ignorado.`);
      }
      continue;
    }

    if (key.startsWith('>') || key === 'parts') {
      const entries: Record<string, StyleConfig> = {};
      if (key.startsWith('>')) {
        entries[key.slice(1)] = value as StyleConfig;
      } else if (value && typeof value === 'object') {
        Object.assign(entries, value as Record<string, StyleConfig>);
      }
      if (!silent) {
        console.warn(
          `[mini-q] "${key}" deprecado — declare partes como "\$nome" (\`$${Object.keys(entries)[0]}\`).`,
        );
      }
      for (const name in entries) {
        const v = entries[name]!;
        if (v && typeof v === 'object') {
          explicitParts[name] = (explicitParts[name] as StyleConfig | undefined)
            ? mergePartConfigs(v as StyleConfig, explicitParts[name]!)
            : (v as StyleConfig);
        } else if (!silent) {
          console.warn(`[mini-q] "${key}" deve ser um objeto de estilo — ignorado.`);
        }
      }
      continue;
    }

    // Legacy: keys da ficha técnica no topo (transição → meta). Preferência a `$:` (mesclagem
    // manual: o meta de `$:` já veio; aqui só preenche os vazios).
    if (!silent) {
      switch (key) {
        case 'flags':
        case 'variants':
        case 'defaults':
        case 'keyframes':
        case 'slots':
        case 'hosts':
        case 'scope':
          (meta as unknown as Record<string, unknown>)[key] = value;
          continue;
      }
    } else {
      // coleta de refs: ignora essas (partes declaradas em $nome/parts estão nos mapas)
      if (
        key === 'flags' || key === 'variants' || key === 'defaults' || key === 'keyframes' ||
        key === 'slots' || key === 'hosts' || key === 'scope'
      ) continue;
    }

    decls[key] = value;
  }

  return { meta, parts, explicitParts, decls };
}

/** Mescla partes: a declaração "destaque" (parts/$nome/>nome) prevalece em conflito de chave. */
export function mergePartConfigs(shorthand: StyleConfig, explicit?: StyleConfig): StyleConfig {
  if (!explicit) return shorthand;
  if (!shorthand) return explicit;
  const merged: StyleConfig = {};
  for (const k in explicit) merged[k] = (explicit as Record<string, unknown>)[k];
  for (const k in shorthand) (merged as Record<string, unknown>)[k] = (shorthand as Record<string, unknown>)[k];
  return merged;
}

export function splitConfig(config: StyleConfig): SplitConfig {
  return splitConfigCore(config, false);
}

/**
 * Coleta recursivamente TODAS as refs de parte do bloco (nome → classe).
 * Classes são depth-independent (`-{bloco}-{chave}`, `scope.ts`), então cada
 * `$nome` do bloco resolve para a mesma classe em qualquer profundidade —
 * um único mapa global serve para o "nivelamento" (ref de neto no root).
 * `silent` evita warns de depreciação do `parts:`/`>nome` durante a coleta.
 */
export function collectPartRefs(scope: ScopeConfig, block: string, config: StyleConfig): PartRefs {
  const refs: PartRefs = {};
  const walk = (cfg: StyleConfig): void => {
    const { parts: dollar, explicitParts } = splitConfigCore(cfg, true);
    const all: Record<string, StyleConfig> = { ...explicitParts, ...dollar };
    for (const name in all) {
      if (RESERVED_REF.has(name)) continue;
      refs[name] = partClass(scope, block, name);
      walk(all[name]!);
    }
  };
  walk(config);
  return refs;
}
