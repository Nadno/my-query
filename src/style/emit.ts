/**
 * Emissão: objeto JS → regras CSS (string) → injeção num `<style id="mq-styles">`.
 * camelCase→kebab, números→`px` (exceto unitless), aninhamento `&`/`@media`/`@supports`.
 */

import { resolveMedia } from './config';
import type { CSSObject } from './types';

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

export function toKebab(prop: string): string {
  if (prop.startsWith('--')) return prop;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Mapa nome de parte → classe (`title` → `-block-title`) usado no resolver de seletores. */
export type PartRefs = Record<string, string>;

/**
 * Resolve referências a partes em um seletor: um token `$nome` vira a classe da parte, **só se**
 * o nome corresponder a uma parte declarada no nó atual (senão fica como está). O `$` é
 * inequívoco — nunca é seletor de atributo CSS — então não conflita com `[type="text"]` etc.
 * Ex.: `'& > $title'` → `.card .-card-card > .-card-title`.
 */
export function resolvePartRefs(selector: string, parts?: PartRefs): string {
  if (!parts) return selector;
  return selector.replace(/\$([A-Za-z0-9_-]+)/g, (full, name: string) => {
    const cls = parts[name];
    return cls ? `.${cls}` : full;
  });
}

function toDecl(key: string, value: string | number | boolean): string | null {
  if (value === false || value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return `${toKebab(key)}: ${UNITLESS.has(key) ? value : `${value}px`}`;
  }
  if (typeof value === 'boolean') return null;
  return `${toKebab(key)}: ${value}`;
}

/** Compila `obj` para `selector` em strings de regra (sem injetar no DOM). */
export function compile(selector: string, obj: CSSObject, parts?: PartRefs): string[] {
  const decls: string[] = [];
  const nested: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    if (value == null || typeof value === 'boolean') continue;
    if (typeof value === 'object') {
      if (key.startsWith('@')) {
        // `@media (...)`/`@supports (...)` (com espaço) = crus; `@md`/`@768` = breakpoint
        const atRule = key.includes(' ') ? key : `@media ${resolveMedia(key.slice(1))}`;
        const inner = compile(selector, value, parts);
        if (inner.length) nested.push(`${atRule} { ${inner.join(' ')} }`);
      } else {
        const next = key.includes('&') ? resolvePartRefs(key.replaceAll('&', selector), parts) : resolvePartRefs(`${selector} ${key}`, parts);
        nested.push(...compile(next, value, parts));
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

export function compileKeyframes(name: string, steps: CSSObject): string {
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
export function pushRule(rule: string): void {
  const el = ensureTag();
  if (!el || injected.has(rule)) return;
  injected.add(rule);
  el.appendChild(document.createTextNode(`${rule}\n`));
}

/** Compila `obj` para `selector` e injeta cada regra no DOM. */
export function inject(selector: string, obj: CSSObject, parts?: PartRefs): void {
  for (const rule of compile(selector, obj, parts)) pushRule(rule);
}

/**
 * Agrupa um `@scope` para o motor `native`: `@scope (sel) { regra }`.
 * `sel` é o seletor do root (`.card`); `to?` a cláusula de limite. Se `rules`
 * vazio, devolve vazio. Cada regra vira um `@scope` próprio (dedup por string preservado).
 */
export function scopeBlock(rules: string[], sel: string, to?: string): string[] {
  if (rules.length === 0) return [];
  const head = to ? `@scope (${sel}) to (${to})` : `@scope (${sel})`;
  return rules.map((r) => `${head} { ${r} }`);
}

/** Estilo global / escape hatch (ex.: `$.style.css('body', { margin: 0 })`). */
export function css(selector: string, obj: CSSObject): void {
  inject(selector, obj);
}
