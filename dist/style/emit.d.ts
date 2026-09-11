/**
 * Emissão: objeto JS → regras CSS (string) → injeção num `<style id="mq-styles">`.
 * camelCase→kebab, números→`px` (exceto unitless), aninhamento `&`/`@media`/`@supports`.
 */
import type { CSSObject } from './types';
export declare function toKebab(prop: string): string;
/** Mapa nome de parte → classe (`title` → `-block-title`) usado no resolver de seletores. */
export type PartRefs = Record<string, string>;
/**
 * Resolve referências a partes em um seletor: um token `$nome` vira a classe da parte, **só se**
 * o nome corresponder a uma parte declarada no nó atual (senão fica como está). O `$` é
 * inequívoco — nunca é seletor de atributo CSS — então não conflita com `[type="text"]` etc.
 * Ex.: `'& > $title'` → `.card .-card-card > .-card-title`.
 */
export declare function resolvePartRefs(selector: string, parts?: PartRefs): string;
/** Compila `obj` para `selector` em strings de regra (sem injetar no DOM). */
export declare function compile(selector: string, obj: CSSObject, parts?: PartRefs): string[];
export declare function compileKeyframes(name: string, steps: CSSObject): string;
/** Anexa uma regra crua (idempotente por string). */
export declare function pushRule(rule: string): void;
/** Compila `obj` para `selector` e injeta cada regra no DOM. */
export declare function inject(selector: string, obj: CSSObject, parts?: PartRefs): void;
/**
 * Agrupa um `@scope` para o motor `native`: `@scope (sel) { regra }`.
 * `sel` é o seletor do root (`.card`); `to?` a cláusula de limite. Se `rules`
 * vazio, devolve vazio. Cada regra vira um `@scope` próprio (dedup por string preservado).
 */
export declare function scopeBlock(rules: string[], sel: string, to?: string): string[];
/** Estilo global / escape hatch (ex.: `$.style.css('body', { margin: 0 })`). */
export declare function css(selector: string, obj: CSSObject): void;
