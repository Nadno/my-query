/**
 * `buildNode` — percorre a árvore de um bloco, injeta as regras CSS no acumulador (`ctx.out`)
 * e monta o `StyleHandle` (callable + `self`/`flags`/`variants`/`keyframes`/`hosts`/partes).
 *
 * Contrato `$` (spec `docs/proposals/style-part-refs.md`):
 *  - parte declarada como `$nome` emite **filho direto** (`& > .-bloco-nome`);
 *  - refs `$` em selector composto são **globais ao bloco** — um único `PartRefs` coleciona
 *    todas as partes do bloco (depth-independent), resolvendo refs de qualquer profundidade;
 *  - legacy `parts:{}` (deprecado) mantém **descendente** (`& .-bloco-nome`); `$nome` prevalece
 *    em conflito de nome.
 */

import { STYLE_HANDLE } from '../types';
import { compile, compileKeyframes, pushRule, toKebab, type PartRefs } from './emit';
import type { BuildCtx } from './scope';
import { partClass } from './scope';
import { isDollarPartKey, mergePartConfigs, splitConfig } from './parts';
import type { CSSObject, FlagBody, SlotRef, StyleConfig, StyleHandle } from './types';

/** Nível no path: classe própria + se a subida do pai é filho direto (`>`). */
interface PathLevel {
  cls: string;
  direct: boolean;
}

/** Parte resolvida: config + se o combinador do pai é filho direto. */
interface MergedPart {
  cfg: StyleConfig;
  direct: boolean;
}

const RESERVED_PART_NAMES = new Set(['self', 'flags', 'variants', 'keyframes', 'hosts', 'slots']);

/** Compila `obj` para `sel` e acrescenta as regras ao `ctx.out`. */
function pushObj(ctx: BuildCtx, sel: string, obj: CSSObject, parts?: PartRefs): void {
  for (const rule of compile(sel, obj, parts)) ctx.out.push(rule);
}

/** Injeta o corpo de uma flag/variante: decls + override de `$partes` e `hosts`. */
function injectBody(ctx: BuildCtx, sel: string, body: FlagBody, partMap: Record<string, MergedPart>): void {
  const decls: CSSObject = {};
  const partsOverride: Record<string, CSSObject> = {};
  const hostsOverride: Record<string, CSSObject> = {};
  for (const k in body) {
    if (isDollarPartKey(k)) partsOverride[k.slice(1)] = body[k] as CSSObject;
    else if (k === 'hosts') Object.assign(hostsOverride, body[k] as Record<string, CSSObject>);
    else if (k === 'parts' || k === 'slots') {
      // Legacy de transição: `parts`/`slots` no override de flag.
      console.warn(
        `[mini-q] "${k}" em flag/variante deprecado — use "\$nome" para parte e "hosts" para hospedados.`,
      );
      if (k === 'parts') Object.assign(partsOverride, body[k] as Record<string, CSSObject>);
      else Object.assign(hostsOverride, body[k] as Record<string, CSSObject>);
    } else if (k !== '$') decls[k] = body[k];
  }
  if (Object.keys(decls).length) pushObj(ctx, sel, decls, ctx.partRefs);
  for (const pk in partsOverride) {
    const direct = partMap[pk]?.direct ?? true;
    pushObj(
      ctx,
      `${sel}${direct ? ' > ' : ' '}.${partClass(ctx.scope, ctx.block, pk)}`,
      partsOverride[pk]!,
      ctx.partRefs,
    );
  }
  for (const sk in hostsOverride) {
    const hostSel = ctx.hostSel?.(sk);
    if (!hostSel) {
      console.warn(`[mini-q] host "${sk}" não declarado em hosts de "${ctx.block}" — declare em \`$: { hosts }\`.`);
      continue;
    }
    pushObj(ctx, `${sel} .${hostSel}`, hostsOverride[sk]!, ctx.partRefs);
  }
}

export function buildNode(config: StyleConfig, ctx: BuildCtx, path: PathLevel[]): StyleHandle {
  const { meta, parts: dollarParts, explicitParts, decls: rawDecls } = splitConfig(config);

  // Partes: $nome (filho direto `& >`) + legacy parts:{} (descendente `& `).
  // $nome em conflito de nome vence **e mescla decls** com a versão legacy (`mergePartConfigs`).
  const mergedParts: Record<string, MergedPart> = {};
  const warnedReserved = new Set<string>();
  for (const key in explicitParts) {
    if (RESERVED_PART_NAMES.has(key)) {
      warnedReserved.add(key);
      console.warn(
        `[mini-q] parte "${key}" em "${ctx.block}" usa um nome reservado do handle (self/flags/variants/keyframes/hosts/slots) — renomeie.`,
      );
      continue;
    }
    mergedParts[key] = { cfg: explicitParts[key]!, direct: false };
  }
  for (const key in dollarParts) {
    if (RESERVED_PART_NAMES.has(key)) {
      if (!warnedReserved.has(key)) {
        console.warn(
          `[mini-q] parte "${key}" em "${ctx.block}" usa um nome reservado do handle (self/flags/variants/keyframes/hosts/slots) — renomeie.`,
        );
      }
      continue;
    }
    const prev = mergedParts[key];
    mergedParts[key] = prev
      ? { cfg: mergePartConfigs(dollarParts[key]!, prev.cfg), direct: true }
      : { cfg: dollarParts[key]!, direct: true };
  }

  // Seletor de self do nó, respeitando o combinador de cada nível: filho direto (`>`) para
  // `$nome`, descendente (` `) para legacy `parts:{}`. Ex.: blocos `$a: { $b }` →
  // `.bloco > .-bloco-a > .-bloco-b`; legacy `parts:{ a:{ parts:{ b } } }` → `.bloco .-a .-b`.
  const isRoot = path.length === 1;
  const selfSel = (ctx.native ? ':scope' : `.${path[0]!.cls}`) + path
    .slice(1)
    .map((l) => (l.direct ? ` > .${l.cls}` : ` .${l.cls}`))
    .join('');
  // Classe própria deste nó (`card` no root; `-block-title` numa parte).
  const selfCls = path[path.length - 1]!.cls;

  // Mapa host → classe selecionada (para flags/variants mirarem o host hospedado).
  // Legacy: `meta.slots` (topo legacy) alimenta o mesmo mapa durante a transição.
  const hostSel: Record<string, string> = {};
  const hostsMeta = (meta.hosts ?? meta.slots) as Record<string, SlotRef> | undefined;
  if (hostsMeta) {
    for (const name in hostsMeta) {
      const ref = hostsMeta[name]!;
      hostSel[name] = typeof ref === 'string' ? ref : ref.self;
    }
  }

  const flagsMeta = meta.flags ?? {};
  const variantsMeta = meta.variants ?? {};
  const defaultsMeta = meta.defaults ?? {};
  const keyframesMeta = meta.keyframes ?? {};

  ctx.hostSel = (k: string) => hostSel[k];

  // Declarações da própria parte. `rawDecls` = tudo que não é $:/$nome/parts/legacy.
  const decls: CSSObject = {};
  for (const key in rawDecls) {
    if (isDollarPartKey(key)) continue;
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
    // Chave-objeto no topo: seletor composto com refs $ (ex.: `'$foo > $bar'`).
    // Sem `$`, é tentativa de parte solta — avisa (falha que fala).
    if (!String(key).includes('$')) {
      console.warn(
        `[mini-q] chave "${key}" ignorada em "${ctx.block}" — declare partes como "\$nome", condicionais em "\$: flags/variants".`,
      );
    } else {
      decls[key] = value as CSSObject;
    }
  }
  if (Object.keys(decls).length) pushObj(ctx, selfSel, decls, ctx.partRefs);

  const flags: Record<string, string> = {};
  for (const name in flagsMeta) {
    injectBody(ctx, `${selfSel}.--is-${name}`, flagsMeta[name]!, mergedParts);
    flags[name] = `--is-${name}`;
  }

  const variants: Record<string, Record<string, string>> = {};
  for (const group in variantsMeta) {
    variants[group] = {};
    const options = variantsMeta[group]!;
    for (const value in options) {
      injectBody(ctx, `${selfSel}.--${group}-${value}`, options[value]!, mergedParts);
      variants[group]![value] = `--${group}-${value}`;
    }
  }

  const keyframes: Record<string, string> = {};
  for (const name in keyframesMeta) {
    const kn = `${ctx.block}-${toKebab(name)}`;
    pushRule(compileKeyframes(kn, keyframesMeta[name]!));
    keyframes[name] = kn;
  }

  const parts: Record<string, StyleHandle> = {};
  for (const key in mergedParts) {
    const cls = partClass(ctx.scope, ctx.block, key);
    parts[key] = buildNode(mergedParts[key]!.cfg, ctx, [
      ...path.map((l) => ({ ...l })),
      { cls, direct: mergedParts[key]!.direct },
    ]);
  }

  const defaults = defaultsMeta;
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

  Object.assign(
    handle,
    { self: ownSelf, flags, variants, keyframes, hosts: { ...hostSel }, slots: { ...hostSel } },
    parts,
  );
  Object.defineProperty(handle, STYLE_HANDLE, { value: true });
  return handle;
}
