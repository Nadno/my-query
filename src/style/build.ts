/**
 * Build: `$.style(nome, config)` → `StyleHandle` (namespace de entidade).
 *
 * Nomes: parte = `-{bloco}-{chave}` em toda profundidade, combinador descendente automático;
 * flag = `.sel.--flag`, variante = `.sel.--grupo-valor`, keyframes escopado (`{bloco}-{nome}`).
 * Chaves reservadas explícitas — partes e variantes coexistem.
 */

import { toKebab, compileKeyframes, inject, pushRule, css } from './emit';
import type { CSSObject, FlagBody, StyleApi, StyleConfig, StyleHandle } from './types';

const RESERVED = new Set(['base', 'parts', 'flags', 'variants', 'defaults', 'keyframes']);

/** Classe de uma parte: nome completo do bloco + chave, em toda profundidade. */
function partClass(block: string, key: string): string {
  return `-${block}-${toKebab(key)}`;
}

const registered = new Set<string>();
const warnedDup = new Set<string>();

function warnDup(name: string): void {
  if (registered.has(name) && !warnedDup.has(name)) {
    warnedDup.add(name);
    console.warn(`[mini-q] estilo "${name}" registrado mais de uma vez — as regras podem colidir.`);
  }
  registered.add(name);
}

/** Injeta o corpo de uma flag/variante: decls no seletor + `parts` de override. */
function injectBody(sel: string, body: FlagBody, block: string): void {
  const decls: CSSObject = {};
  let partsOverride: Record<string, CSSObject> | undefined;
  for (const k in body) {
    if (k === 'parts') {
      partsOverride = body[k] as Record<string, CSSObject>;
      continue;
    }
    decls[k] = body[k];
  }
  if (Object.keys(decls).length) inject(sel, decls);
  if (partsOverride) {
    for (const pk in partsOverride) inject(`${sel} .${partClass(block, pk)}`, partsOverride[pk]!);
  }
}

function buildNode(config: StyleConfig, block: string, path: string[]): StyleHandle {
  const selfClass = path[path.length - 1]!;
  const selfSel = path.map((c) => `.${c}`).join(' ');

  // Declarações da própria parte: `base` + escalares/`&…`/`@…` no nível (base opcional).
  const decls: CSSObject = { ...(config.base ?? {}) };
  for (const key in config) {
    if (RESERVED.has(key)) continue;
    const value = config[key];
    if (value == null) continue;
    if (typeof value !== 'object') {
      decls[key] = value as string | number | boolean;
      continue;
    }
    if (key.startsWith('&') || key.startsWith('@')) {
      decls[key] = value as CSSObject; // pseudo/self ou at-rule
      continue;
    }
    console.warn(
      `[mini-q] chave "${key}" ignorada em "${block}" — partes vão sob "parts", flags sob "flags", variantes sob "variants".`,
    );
  }
  if (Object.keys(decls).length) inject(selfSel, decls);

  const flags: Record<string, string> = {};
  if (config.flags) {
    for (const name in config.flags) {
      injectBody(`${selfSel}.--${name}`, config.flags[name]!, block);
      flags[name] = `--${name}`;
    }
  }

  const variants: Record<string, Record<string, string>> = {};
  if (config.variants) {
    for (const group in config.variants) {
      variants[group] = {};
      const options = config.variants[group]!;
      for (const value in options) {
        injectBody(`${selfSel}.--${group}-${value}`, options[value]!, block);
        variants[group]![value] = `--${group}-${value}`;
      }
    }
  }

  const keyframes: Record<string, string> = {};
  if (config.keyframes) {
    for (const name in config.keyframes) {
      const kn = `${block}-${toKebab(name)}`;
      pushRule(compileKeyframes(kn, config.keyframes[name]!));
      keyframes[name] = kn;
    }
  }

  const parts: Record<string, StyleHandle> = {};
  if (config.parts) {
    for (const key in config.parts) {
      parts[key] = buildNode(config.parts[key]!, block, [...path, partClass(block, key)]);
    }
  }

  const defaults = config.defaults ?? {};
  const handle = ((props: Record<string, unknown> = {}): string => {
    const tokens: string[] = [selfClass];
    const merged: Record<string, unknown> = { ...defaults, ...props };
    for (const k in merged) {
      const v = merged[k];
      if (v == null || v === false) continue;
      if (variants[k] && typeof v === 'string' && variants[k]![v]) tokens.push(`--${k}-${v}`);
      else if (flags[k] !== undefined && v === true) tokens.push(`--${k}`);
    }
    return tokens.join(' ');
  }) as StyleHandle;

  return Object.assign(handle, { self: selfClass, parts, flags, variants, keyframes }) as StyleHandle;
}

function styleFn(name: string, config?: StyleConfig): StyleHandle | string {
  warnDup(name);
  if (config == null) return name;
  return buildNode(config, name, [name]);
}

export const style: StyleApi = Object.assign(styleFn, { css }) as StyleApi;

/**
 * @deprecated Use `$.style(name, { parts: { … } })` e acesse `handle.parts.x`. Alias por 1 versão.
 */
export function parts<T extends StyleConfig>(name: string, tree: Record<string, T>): StyleHandle;
export function parts(name: string): string;
export function parts(name: string, tree?: Record<string, StyleConfig>): StyleHandle | string {
  return tree == null ? (style(name) as string) : style(name, { parts: tree });
}
