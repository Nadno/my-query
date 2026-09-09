/**
 * `buildNode` — percorre a árvore de um bloco, injeta as regras CSS no acumulador (`ctx.out`)
 * e monta o `StyleHandle` (callable + `self`/`flags`/`variants`/`keyframes`/`slots`/partes).
 */

import { STYLE_HANDLE } from '../types';
import { compile, compileKeyframes, pushRule, toKebab, type PartRefs } from './emit';
import type { BuildCtx } from './scope';
import { partClass, RESERVED } from './scope';
import { mergeParts, splitShortcutParts } from './parts';
import type { CSSObject, FlagBody, SlotRef, StyleConfig, StyleHandle } from './types';

const RESERVED_PART_NAMES = new Set(['self', 'flags', 'variants', 'keyframes', 'slots']);

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
    for (const pk in partsOverride) pushObj(ctx, `${sel} .${partClass(ctx.scope, ctx.block, pk)}`, partsOverride[pk]!);
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

export function buildNode(config: StyleConfig, ctx: BuildCtx, path: string[]): StyleHandle {
  const { decls: rawDecls, parts: shortcutParts } = splitShortcutParts(config);
  const mergedParts = mergeParts(shortcutParts, rawDecls.parts as Record<string, StyleConfig> | undefined);

  // Seletor de self do nó. Em native, a raiz vira `:scope` e sub-partes descem dela
  // (`:scope .-scp-card-title`) — a classe do root não se repete. Em prefixed, encadeia classes.
  const isRoot = path.length === 1;
  const selfSel = ctx.native
    ? path.map((c, i) => (i === 0 ? ':scope' : `.${c}`)).join(' ')
    : path.map((c) => `.${c}`).join(' ');
  // Classe própria deste nó (`card` no root; `-block-title` numa parte).
  const selfCls = path[path.length - 1]!;

  // Nomes de parte do nó atual → classe, para o resolver `$nome`.
  const partRefs: PartRefs = {};
  if (mergedParts) {
    for (const key in mergedParts) {
      if (RESERVED_PART_NAMES.has(key)) continue;
      partRefs[key] = partClass(ctx.scope, ctx.block, key);
    }
  }

  // Mapa nome de slot → classe selecionada (para flags/variants mirarem).
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
      const cls = partClass(ctx.scope, ctx.block, key);
      parts[key] = buildNode(mergedParts[key]!, ctx, [...path, cls]);
    }
  }

  const defaults = config.defaults ?? {};
  const ownSelf = isRoot ? ctx.root : selfCls;
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
