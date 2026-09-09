/**
 * `mini-q/style` — engine de CSS-in-JS + breakpoints. Entry-point **opcional**
 * (fora do core de DOM). Barril público.
 *
 * - `emit`   — objeto JS → CSS → injeção no `<style id="mq-styles">`.
 * - `build`  — `style(nome, config)` → `StyleHandle` (namespace de entidade).
 * - `config` — breakpoints (`@nome` no CSS + `media` reativo).
 * - `media`  — signal<boolean> reativo a partir de `matchMedia`.
 * - `types`  — contrato público (`CSSObject`/`StyleConfig`/`StyleHandle`/…).
 */

export { compile, inject, css } from './emit';
export { style, parts } from './build';
export { config } from './config';
export type { MiniQConfig } from './config';
export { media } from './media';
export { hashScope, scopedId } from './scope';
export type { ScopeConfig, ScopeStrategy } from './types';
export type {
  CSSValue,
  CSSObject,
  StyleObject,
  StyleConfig,
  FlagBody,
  SlotRef,
  StyleHandle,
  StyleApi,
} from './types';
export { cx } from '../dom/nodes';
