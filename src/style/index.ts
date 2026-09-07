/**
 * Subsistema de estilo (`$.style`). Barril público.
 *
 * - `emit`  — objeto JS → CSS → injeção no `<style id="mq-styles">`.
 * - `build` — `$.style(nome, config)` → `StyleHandle` (namespace de entidade).
 * - `types` — contrato público (`CSSObject`/`StyleConfig`/`StyleHandle`/…).
 */

export { compile, inject, css } from './emit';
export { style, parts } from './build';
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
