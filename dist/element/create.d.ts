/**
 * `createTag` — fábrica de tag com assinatura dupla:
 *  - `$.tag(() => valor)` → Element (filho reativo — açúcar sem `{}`);
 *  - `$.tag(setupFn)` → Componente `(props) => Element` (a closure roda no build);
 *  - `$.tag(props?, ...children)` → Element (props aplicadas, children anexados).
 *
 * A desambiguação do 1º arg função é por **aridade**: `() => valor` (0 params) é filho
 * reativo; `(props, ctx) => filhos` (≥1 param) é setup. Setup que ignora props → use a
 * closure (forma canônica).
 */
import type { Component, NonEmptyFn, Props, SetupFn, TagElement, TagName } from '../types';
export declare function createTag<T extends TagName, F extends SetupFn<T> = SetupFn<T>>(tag: T, setup: NonEmptyFn<F>): Component;
export declare function createTag<T extends TagName>(tag: T, child: () => unknown): TagElement<T>;
export declare function createTag<T extends TagName>(tag: T, props?: Props<T>, ...children: unknown[]): TagElement<T>;
