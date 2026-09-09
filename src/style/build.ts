/**
 * Build: `$.style(nome, config)` → `StyleHandle` (namespace de entidade, JS-first).
 *
 * Um handle único e callable, com as partes **promovidas** ao próprio objeto (`field.input`),
 * mais `self`/`flags`/`variants`/`keyframes`/`slots`. Declarações ficam no topo do config
 * (sem `base`). Nomes: parte = `-{bloco}-{chave}` em toda profundidade, combinador descendente;
 * flag = `.sel.--is-{nome}`, variante = `.sel.--{grupo}-{valor}`; keyframes escopado `{bloco}-{nome}`;
 * slot = bloco estrangeiro hospedado, mirado por flags/variants via descendente.
 */

import { STYLE_HANDLE } from '../types';
import { toKebab, compileKeyframes, inject, pushRule, css } from './emit';
import type { CSSObject, FlagBody, SlotRef, StyleApi, StyleConfig, StyleHandle } from './types';

const RESERVED = new Set(['parts', 'flags', 'variants', 'defaults', 'slots', 'keyframes']);
const RESERVED_PART_NAMES = new Set(['self', 'flags', 'variants', 'keyframes', 'slots']);

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

/** Separa chaves `>nome` (atalho para partes) do resto do config, recursivamente. */
function splitShortcutParts(config: StyleConfig): {
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

/** Junta partes do atalho `>nome` com partes declaradas em `parts`. */
function mergeParts(
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
      // re-hidrata decls explícitos + decls do shortcut como config resultante
      merged[k] = { ...expDecls, ...nestedDecls, parts: merged[k] } as StyleConfig;
    } else {
      merged[k] = { ...nestedDecls, parts: nestedParts } as StyleConfig;
    }
  }
  return merged;
}

/** Injeta o corpo de uma flag/variante: decls no seletor + override de `parts` e `slots`. */
function injectBody(sel: string, body: FlagBody, block: string, slots: Record<string, string>): void {
  const decls: CSSObject = {};
  let partsOverride: Record<string, CSSObject> | undefined;
  let slotsOverride: Record<string, CSSObject> | undefined;
  for (const k in body) {
    if (k === 'parts') partsOverride = body[k] as Record<string, CSSObject>;
    else if (k === 'slots') slotsOverride = body[k] as Record<string, CSSObject>;
    else decls[k] = body[k];
  }
  if (Object.keys(decls).length) inject(sel, decls);
  if (partsOverride) {
    for (const pk in partsOverride) inject(`${sel} .${partClass(block, pk)}`, partsOverride[pk]!);
  }
  if (slotsOverride) {
    for (const sk in slotsOverride) {
      const cls = slots[sk];
      if (!cls) {
        console.warn(`[mini-q] slot "${sk}" não declarado em "${block}" — declare em \`slots\`.`);
        continue;
      }
      inject(`${sel} .${cls}`, slotsOverride[sk]!);
    }
  }
}

function buildNode(config: StyleConfig, block: string, path: string[]): StyleHandle {
  const selfClass = path[path.length - 1]!;
  const selfSel = path.map((c) => `.${c}`).join(' ');

  const { decls: rawDecls, parts: shortcutParts } = splitShortcutParts(config);
  const mergedParts = mergeParts(shortcutParts, rawDecls.parts as Record<string, StyleConfig> | undefined);

  // Slots resolvidos primeiro (flags/variants podem mirá-los).
  const slots: Record<string, string> = {};
  if (rawDecls.slots) {
    const slotsConfig = rawDecls.slots as Record<string, SlotRef>;
    for (const name in slotsConfig) {
      const ref = slotsConfig[name]!;
      slots[name] = typeof ref === 'string' ? ref : ref!.self;
    }
  }

  // Declarações da própria parte: tudo que não é chave reservada (sem `base`).
  const decls: CSSObject = {};
  for (const key in rawDecls) {
    if (RESERVED.has(key)) continue;
    const value = rawDecls[key];
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
      injectBody(`${selfSel}.--is-${name}`, config.flags[name]!, block, slots);
      flags[name] = `--is-${name}`;
    }
  }

  const variants: Record<string, Record<string, string>> = {};
  if (config.variants) {
    for (const group in config.variants) {
      variants[group] = {};
      const options = config.variants[group]!;
      for (const value in options) {
        injectBody(`${selfSel}.--${group}-${value}`, options[value]!, block, slots);
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
  if (mergedParts) {
    for (const key in mergedParts) {
      if (RESERVED_PART_NAMES.has(key)) {
        console.warn(
          `[mini-q] parte "${key}" em "${block}" usa um nome reservado do handle (self/flags/variants/keyframes/slots) — renomeie.`,
        );
        continue;
      }
      parts[key] = buildNode(mergedParts[key]!, block, [...path, partClass(block, key)]);
    }
  }

  const defaults = config.defaults ?? {};
  const handle = ((props: Record<string, unknown> = {}): string => {
    const tokens: string[] = [selfClass];
    const merged: Record<string, unknown> = { ...defaults, ...props };
    for (const k in merged) {
      const v = merged[k];
      if (v == null || v === false) continue;
      if (variants[k] && typeof v === 'string' && variants[k]![v]) tokens.push(variants[k]![v]!);
      else if (flags[k] !== undefined && v === true) tokens.push(flags[k]!);
    }
    return tokens.join(' ');
  }) as StyleHandle;

  Object.assign(handle, { self: selfClass, flags, variants, keyframes, slots }, parts);
  Object.defineProperty(handle, STYLE_HANDLE, { value: true });
  return handle;
}

/* --------------------------------------------------------------- style --- */

function styleFn<T extends StyleConfig>(name: string, config: T): StyleHandle<T> {
  warnDup(name);
  return buildNode(config, name, [name]) as StyleHandle<T>;
}

export const style: StyleApi = Object.assign(styleFn, { css }) as StyleApi;

/**
 * @deprecated Use `$.style(name, { parts: { … } })` e acesse `handle.x`. Alias por 1 versão.
 */
export function parts<T extends StyleConfig>(name: string, tree: Record<string, T>): StyleHandle {
  return style(name, { parts: tree });
}
