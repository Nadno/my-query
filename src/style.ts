/**
 * CSS / `$.style` — orientado a entidade.
 *
 * Bloco legível (`category-card`), filhos/netos por chave (prefixo `-`, combinador
 * descendente), `modifiers` como classe composta `.bloco.--nome`, `keyframes`
 * escopados. Emissão via engine runtime (`compile`/`inject`) num `<style id="mq-styles">`.
 * `base`/`modifiers`/`keyframes` são chaves reservadas; qualquer outra = parte-filha.
 */

import { cx } from './dom/nodes';
import { resolveMedia } from './config';

const UNITLESS = new Set([
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice',
  'borderImageWidth', 'columnCount', 'columns', 'flex', 'flexGrow', 'flexPositive',
  'flexShrink', 'flexNegative', 'flexOrder', 'fontWeight', 'gridArea', 'gridRow',
  'gridRowEnd', 'gridRowSpan', 'gridRowStart', 'gridColumn', 'gridColumnEnd',
  'gridColumnSpan', 'gridColumnStart', 'lineClamp', 'lineHeight', 'opacity', 'order',
  'orphans', 'scale', 'tabSize', 'widows', 'zIndex', 'zoom', 'fillOpacity',
  'floodOpacity', 'stopOpacity', 'strokeDasharray', 'strokeDashoffset',
  'strokeMiterlimit', 'strokeOpacity', 'strokeWidth',
]);

export type StyleObject = {
  [key: string]: string | number | boolean | null | undefined | StyleObject;
};

export interface VariantConfig {
  base?: StyleObject;
  variants: Record<string, Record<string, StyleObject>>;
  defaultVariants?: Record<string, string>;
}

export type VariantFn = (props?: Record<string, string>) => string;

/* --------------------------------------------------------------- emissão --- */

function toKebab(prop: string): string {
  if (prop.startsWith('--')) return prop;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toDecl(key: string, value: string | number | boolean): string | null {
  if (value === false || value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return `${toKebab(key)}: ${UNITLESS.has(key) ? value : `${value}px`}`;
  }
  if (typeof value === 'boolean') return null;
  return `${toKebab(key)}: ${value}`;
}

/** Compila um objeto de estilo em regras CSS (selector { decls } + aninhados). */
export function compile(selector: string, obj: StyleObject): string[] {
  const decls: string[] = [];
  const nested: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    if (value == null || typeof value === 'boolean') continue;
    if (typeof value === 'object') {
      if (key.startsWith('@')) {
        // `@media (...)`/`@supports (...)` (com espaço) = crus; `@md`/`@768` = breakpoint
        const atRule = key.includes(' ') ? key : `@media ${resolveMedia(key.slice(1))}`;
        const inner = compile(selector, value);
        if (inner.length) nested.push(`${atRule} { ${inner.join(' ')} }`);
      } else {
        const next = key.includes('&') ? key.replaceAll('&', selector) : `${selector} ${key}`;
        nested.push(...compile(next, value));
      }
    } else {
      const d = toDecl(key, value);
      if (d) decls.push(d);
    }
  }

  const rules: string[] = [];
  if (decls.length) rules.push(`${selector} { ${decls.join('; ')}; }`);
  rules.push(...nested);
  return rules;
}

function compileKeyframes(name: string, steps: StyleObject): string {
  const frames: string[] = [];
  for (const step in steps) {
    const decls = steps[step];
    if (!decls || typeof decls !== 'object') continue;
    const body: string[] = [];
    for (const prop in decls) {
      const d = toDecl(prop, decls[prop] as string | number | boolean);
      if (d) body.push(d);
    }
    if (body.length) frames.push(`${step} { ${body.join('; ')}; }`);
  }
  return `@keyframes ${name} { ${frames.join(' ')} }`;
}

const injected = new Set<string>();
let tag: HTMLStyleElement | null = null;

function ensureTag(): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null;
  if (tag?.isConnected) return tag;
  tag = document.getElementById('mq-styles') as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = 'mq-styles';
    document.head.appendChild(tag);
  }
  return tag;
}

/** Anexa uma regra crua (idempotente por string). */
function pushRule(rule: string): void {
  const el = ensureTag();
  if (!el || injected.has(rule)) return;
  injected.add(rule);
  el.appendChild(document.createTextNode(`${rule}\n`));
}

/** Injeta regras para `selector` a partir de um objeto JS. */
export function inject(selector: string, obj: StyleObject): void {
  for (const rule of compile(selector, obj)) pushRule(rule);
}

/** Estilo global (ex.: `$.css('body', { margin: 0 })`). */
export function css(selector: string, obj: StyleObject): void {
  inject(selector, obj);
}

/* --------------------------------------------------------------- nomes --- */

const RESERVED = new Set(['base', 'modifiers', 'keyframes']);

function elementWord(block: string): string {
  const segs = block.split('-');
  return segs[segs.length - 1]!;
}

function childClass(block: string, key: string, depth: number): string {
  const k = toKebab(key);
  if (depth === 1) return k.includes('-') ? `-${k}` : `-${elementWord(block)}-${k}`;
  return `-${k}`;
}

function kfName(block: string, name: string): string {
  return `${block}-${toKebab(name)}`;
}

/* --------------------------------------------------------------- tipos --- */

export type EntityTree = {
  base?: StyleObject;
  modifiers?: Record<string, StyleObject>;
  keyframes?: Record<string, StyleObject>;
  [child: string]: unknown;
};

type ReservedKey = 'base' | 'modifiers' | 'keyframes';
type ChildKey<T> = Exclude<keyof T, ReservedKey>;

type ModsOf<T> = T extends { modifiers: infer M } ? { mods: { [K in keyof M]: string } } : unknown;
type KfOf<T> = T extends { keyframes: infer K } ? { keyframes: { [P in keyof K]: string } } : unknown;
type ChildrenOf<T> = { [C in ChildKey<T>]: StyleReturn<T[C]> };

/** Folha (sem filhos/modifiers/keyframes) = string; senão objeto com `self`. */
export type StyleReturn<T> = [ChildKey<T>] extends [never]
  ? T extends { modifiers: unknown } | { keyframes: unknown }
    ? { self: string } & ModsOf<T> & KfOf<T>
    : string
  : { self: string } & ModsOf<T> & KfOf<T> & ChildrenOf<T>;

/* --------------------------------------------------------------- build --- */

const registered = new Set<string>();
const warnedDup = new Set<string>();

function buildEntity(
  block: string,
  tree: EntityTree,
  path: string[],
  depth: number,
): unknown {
  const selfClass = path[path.length - 1]!;
  const selfSel = path.map((c) => `.${c}`).join(' ');

  // Declarações da própria parte: `base` + escalares/`&…`/`@…` no nível (base é opcional).
  const decls: StyleObject = {};
  if (tree.base && typeof tree.base === 'object') Object.assign(decls, tree.base);

  const children: Record<string, unknown> = {};
  let hasChildren = false;
  for (const key in tree) {
    if (RESERVED.has(key)) continue;
    const value = tree[key];
    if (value == null) continue;
    if (typeof value !== 'object') {
      decls[key] = value as string | number | boolean;
      continue;
    }
    if (key.startsWith('&') || key.startsWith('@')) {
      decls[key] = value as StyleObject; // pseudo/self ou at-rule
      continue;
    }
    hasChildren = true;
    const cls = childClass(block, key, depth + 1);
    children[key] = buildEntity(block, value as EntityTree, [...path, cls], depth + 1);
  }
  if (Object.keys(decls).length) inject(selfSel, decls);

  let mods: Record<string, string> | undefined;
  if (tree.modifiers && typeof tree.modifiers === 'object') {
    mods = {};
    for (const name in tree.modifiers) {
      const modSel = `${selfSel}.--${name}`;
      const value = tree.modifiers[name] as StyleObject;
      const decls: StyleObject = {};
      for (const k in value) {
        const v = value[k];
        // chave-identificador com valor objeto = override de filho direto
        if (v && typeof v === 'object' && !k.startsWith('&') && !k.startsWith('@')) {
          inject(`${modSel} .${childClass(block, k, depth + 1)}`, v as StyleObject);
        } else {
          decls[k] = v;
        }
      }
      inject(modSel, decls);
      mods[name] = `--${name}`;
    }
  }

  let keyframes: Record<string, string> | undefined;
  if (tree.keyframes && typeof tree.keyframes === 'object') {
    keyframes = {};
    for (const name in tree.keyframes) {
      const kn = kfName(block, name);
      pushRule(compileKeyframes(kn, tree.keyframes[name] as StyleObject));
      keyframes[name] = kn;
    }
  }

  if (!hasChildren && !mods && !keyframes) return selfClass;
  return { self: selfClass, ...(mods ? { mods } : {}), ...(keyframes ? { keyframes } : {}), ...children };
}

function warnDup(name: string): void {
  if (registered.has(name) && !warnedDup.has(name)) {
    warnedDup.add(name);
    console.warn(`[mini-q] estilo "${name}" registrado mais de uma vez — as regras podem colidir.`);
  }
  registered.add(name);
}

/* --------------------------------------------------------------- style --- */

function isVariantConfig(config: unknown): config is VariantConfig {
  return typeof config === 'object' && config !== null && 'variants' in config;
}

function buildVariant(name: string, config: VariantConfig): VariantFn {
  if (config.base) inject(`.${name}`, config.base);
  const variants = config.variants ?? {};
  const defaults = config.defaultVariants ?? {};
  for (const variant in variants) {
    const options = variants[variant];
    if (!options) continue;
    for (const value in options) {
      const styles = options[value];
      if (styles) inject(`.${name}--${value}`, styles);
    }
  }
  return (props: Record<string, string> = {}): string => {
    const classes: string[] = [name];
    const merged = { ...defaults, ...props };
    for (const variant in merged) {
      const value = merged[variant];
      if (value != null && variants[variant]?.[value]) classes.push(`${name}--${value}`);
    }
    return classes.join(' ');
  };
}

export function style(name: string, config: VariantConfig): VariantFn;
export function style<T extends EntityTree>(name: string, tree: T): StyleReturn<T>;
export function style(name: string): string;
export function style(
  name: string,
  config?: EntityTree | VariantConfig,
): unknown {
  warnDup(name);
  if (config == null) return name;
  if (isVariantConfig(config)) return buildVariant(name, config);
  return buildEntity(name, config, [name], 0);
}

/**
 * @deprecated Use `$.style(name, { … })` (mesma árvore de entidade). Mantido como alias.
 */
export function parts<T extends EntityTree>(name: string, tree: T): StyleReturn<T>;
export function parts(name: string): string;
export function parts(name: string, tree?: EntityTree): unknown {
  return tree == null ? style(name) : style(name, tree);
}

export { cx };
