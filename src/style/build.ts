/**
 * Build: `$.style(nome, config)` → `StyleHandle` (namespace de entidade, JS-first).
 *
 * Um handle único e callable, com as partes **promovidas** ao próprio objeto (`field.input`),
 * mais `self`/`flags`/`variants`/`keyframes`/`slots`. Declarações ficam no topo do config
 * (sem `base`). Nomes: parte = `-{bloco}-{chave}` em toda profundidade, combinador descendente;
 * flag = `.sel.--is-{nome}`, variante = `.sel.--{grupo}-{valor}`; keyframes escopado `{bloco}-{nome}`;
 * slot = bloco estrangeiro hospedado, mirado por flags/variants via descendente.
 *
 * Escopo (docs/proposals/style-scope.md): dois motores alternativos.
 * - `prefixed` (default): classes com prefixo (nome do escopo) + regras planas — comportamento atual.
 * - `native`: classes sem prefixo, mas **todas** as regras do bloco agrupadas num único
 *   `@scope (.bloco) to (…)` — escopo real (resolve Popover/Toast teleportado).
 */

import { STYLE_HANDLE } from '../types';
import { toKebab, compileKeyframes, pushRule, scopeBlock, compile, inject, type PartRefs } from './emit';
import { getGlobalScope } from './config';
import type { CSSObject, FlagBody, SlotRef, ScopeConfig, StyleApi, StyleConfig, StyleHandle } from './types';

const RESERVED = new Set(['parts', 'scope', 'flags', 'variants', 'defaults', 'slots', 'keyframes']);
const RESERVED_PART_NAMES = new Set(['self', 'flags', 'variants', 'keyframes', 'slots']);

/** Hash curto e estável de um nome (base36, 4 chars) para `name: 'hashed'`. */
export function hashScope(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const out = (h >>> 0).toString(36);
  return out.length <= 4 ? out : out.slice(-4);
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
      merged[k] = { ...expDecls, ...nestedDecls, parts: merged[k] } as StyleConfig;
    } else {
      merged[k] = { ...nestedDecls, parts: nestedParts } as StyleConfig;
    }
  }
  return merged;
}

/** Contexto de construção de um bloco: escopo resolvido + acumulador de regras CSS. */
interface BuildCtx {
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

/** Classe da parte sob o escopo: `-{prefixo?}-{bloco}-{chave}`. */
function partClass(ctx: BuildCtx, key: string): string {
  const prefix = ctx.scope.name && ctx.scope.name !== 'hashed' ? ctx.scope.name : ctx.block;
  return `-${prefix}-${toKebab(key)}`;
}

function resolveScope(local: ScopeConfig | undefined, block: string): ScopeConfig {
  const merged: ScopeConfig = { ...getGlobalScope(), ...local };
  if (merged.name === 'hashed') merged.name = hashScope(block);
  if (!merged.strategy) merged.strategy = 'prefixed';
  return merged;
}

/** Classe do root sob o escopo: `[prefixo-]bloco`. */
function rootOf(scope: ScopeConfig, block: string): string {
  if (scope.strategy === 'prefixed' && scope.name && scope.name !== 'hashed') {
    return `${scope.name}-${block}`;
  }
  return block;
}

/** Compila `obj` para `sel` e acrescenta as regras ao `ctx.out`. */
function pushObj(ctx: BuildCtx, sel: string, obj: CSSObject, parts?: PartRefs): void {
  for (const rule of compile(sel, obj, parts)) ctx.out.push(rule);
}

/** Injeta o corpo de uma flag/variante: decls + override de `parts` e `slots`. */
function injectBody(ctx: BuildCtx, sel: string, body: FlagBody): void {
  const decls: CSSObject = {};
  let partsOverride: Record<string, CSSObject> | undefined;
  let slotsOverride: Record<string, CSSObject> | undefined;
  for (const k in body) {
    if (k === 'parts') partsOverride = body[k] as Record<string, CSSObject>;
    else if (k === 'slots') slotsOverride = body[k] as Record<string, CSSObject>;
    else decls[k] = body[k];
  }
  if (Object.keys(decls).length) pushObj(ctx, sel, decls);
  if (partsOverride) {
    for (const pk in partsOverride) pushObj(ctx, `${sel} .${partClass(ctx, pk)}`, partsOverride[pk]!);
  }
  if (slotsOverride) {
    for (const sk in slotsOverride) {
      const slotSel = ctx.slotSel?.(sk);
      if (!slotSel) {
        console.warn(`[mini-q] slot "${sk}" não declarado em "${ctx.block}" — declare em \`slots\`.`);
        continue;
      }
      pushObj(ctx, `${sel} .${slotSel}`, slotsOverride[sk]!);
    }
  }
}

function buildNode(config: StyleConfig, ctx: BuildCtx, path: string[]): StyleHandle {
  const { decls: rawDecls, parts: shortcutParts } = splitShortcutParts(config);
  const mergedParts = mergeParts(shortcutParts, rawDecls.parts as Record<string, StyleConfig> | undefined);

  // Seletor de self do nó. Em native, a raiz vira `:scope` e sub-partes descem dela
  // (`:scope .-scp-card-title`) — a classe do root não se repete. Em prefixed, encadeia classes.
  const isRoot = path.length === 1;
  const selfSel = ctx.native
    ? path.map((c, i) => (i === 0 ? ':scope' : `.${c}`)).join(' ')
    : path.map((c) => `.${c}`).join(' ');
  /** Classe própria deste nó (`card` no root; `-block-title` numa parte). */
  const selfCls = path[path.length - 1]!;

  // Nomes de parte do nó atual → classe, para o resolver `$nome`.
  const partRefs: PartRefs = {};
  if (mergedParts) {
    for (const key in mergedParts) {
      if (RESERVED_PART_NAMES.has(key)) continue;
      partRefs[key] = partClass(ctx, key);
    }
  }

  // Mapa nome de slot → classe selecionada (para flags mirarem).
  const slotSel: Record<string, string> = {};
  if (rawDecls.slots) {
    const slotsConfig = rawDecls.slots as Record<string, SlotRef>;
    for (const name in slotsConfig) {
      const ref = slotsConfig[name]!;
      slotSel[name] = typeof ref === 'string' ? ref : ref.self;
    }
  }
  ctx.slots = slotSel;
  ctx.slotSel = (k: string) => slotSel[k];

  // Declarações da própria parte.
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
      decls[key] = value as CSSObject;
      continue;
    }
    console.warn(
      `[mini-q] chave "${key}" ignorada em "${ctx.block}" — partes vão sob "parts", flags sob "flags", variantes sob "variants".`,
    );
  }
  if (Object.keys(decls).length) pushObj(ctx, selfSel, decls, partRefs);

  const flags: Record<string, string> = {};
  if (config.flags) {
    for (const name in config.flags) {
      injectBody(ctx, `${selfSel}.--is-${name}`, config.flags[name]!);
      flags[name] = `--is-${name}`;
    }
  }

  const variants: Record<string, Record<string, string>> = {};
  if (config.variants) {
    for (const group in config.variants) {
      variants[group] = {};
      const options = config.variants[group]!;
      for (const value in options) {
        injectBody(ctx, `${selfSel}.--${group}-${value}`, options[value]!);
        variants[group]![value] = `--${group}-${value}`;
      }
    }
  }

  const keyframes: Record<string, string> = {};
  if (config.keyframes) {
    for (const name in config.keyframes) {
      const kn = `${ctx.block}-${toKebab(name)}`;
      pushRule(compileKeyframes(kn, config.keyframes[name]!));
      keyframes[name] = kn;
    }
  }

  const parts: Record<string, StyleHandle> = {};
  if (mergedParts) {
    for (const key in mergedParts) {
      if (RESERVED_PART_NAMES.has(key)) {
        console.warn(
          `[mini-q] parte "${key}" em "${ctx.block}" usa um nome reservado do handle (self/flags/variants/keyframes/slots) — renomeie.`,
        );
        continue;
      }
      const cls = partClass(ctx, key);
      parts[key] = buildNode(mergedParts[key]!, ctx, [...path, cls]);
    }
  }

  const defaults = config.defaults ?? {};
  const ownSelf = isRoot ? rootOf(ctx.scope, ctx.block) : selfCls;
  const handle = ((props: Record<string, unknown> = {}): string => {
    const tokens: string[] = [ownSelf];
    const merged: Record<string, unknown> = { ...defaults, ...props };
    for (const k in merged) {
      const v = merged[k];
      if (v == null || v === false) continue;
      if (variants[k] && typeof v === 'string' && variants[k]![v]) tokens.push(variants[k]![v]!);
      else if (flags[k] !== undefined && v === true) tokens.push(flags[k]!);
    }
    return tokens.join(' ');
  }) as StyleHandle;

  Object.assign(handle, { self: ownSelf, flags, variants, keyframes, slots: { ...slotSel } }, parts);
  Object.defineProperty(handle, STYLE_HANDLE, { value: true });
  return handle;
}

/* --------------------------------------------------------------- style --- */

function styleFn<T extends StyleConfig>(name: string, config: T): StyleHandle<T> {
  warnDup(name);
  const scope = resolveScope(config.scope as ScopeConfig | undefined, name);
  const ctx: BuildCtx = {
    scope,
    block: name,
    root: rootOf(scope, name),
    native: scope.strategy === 'native',
    out: [],
    slots: {},
  };

  const handle = buildNode(config, ctx, [ctx.root]);

  // Emite: native agrupa tudo em `@scope (.root) to (…)`; prefixed injeta plano.
  const rules = ctx.native ? scopeBlock(ctx.out, `.${ctx.root}`, scope.to) : ctx.out;
  for (const rule of rules) pushRule(rule);

  return handle as StyleHandle<T>;
}

export const style: StyleApi = Object.assign(styleFn, { css: inject }) as StyleApi;

/**
 * @deprecated Use `$.style(name, { parts: { … } })` e acesse `handle.x`. Alias por 1 versão.
 */
export function parts<T extends StyleConfig>(name: string, tree: Record<string, T>): StyleHandle {
  return style(name, { parts: tree });
}
