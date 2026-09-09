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

import { isSignal } from '../reactive';
import { applyProps } from './props';
import { applyUse } from '../behaviors';
import { appendChild } from './children';
import { isProps } from './guards';
import type { Component, MQ, NonEmptyFn, Props, SetupFn, TagElement, TagName } from '../types';

export function createTag<T extends TagName, F extends SetupFn<T> = SetupFn<T>>(
  tag: T,
  setup: NonEmptyFn<F>,
): Component;
export function createTag<T extends TagName>(
  tag: T,
  child: () => unknown,
): TagElement<T>;
export function createTag<T extends TagName>(
  tag: T,
  props?: Props<T>,
  ...children: unknown[]
): TagElement<T>;
export function createTag<T extends TagName>(
  tag: T,
  ...args: unknown[]
): TagElement<T> | Component {
  const first = args[0];

  // Forma componente: função com ≥1 param (setup). Função 0-param = filho reativo
  // (cai na forma elemento abaixo — `appendChild` vira região reativa).
  if (typeof first === 'function' && !isSignal(first) && first.length > 0) {
    const setup = first as (props: Record<string, unknown>, ctx: MQ) => unknown;
    return ((props: Record<string, unknown> = {}) => {
      const el = document.createElement(tag);
      const ctx: MQ = { element: el };
      appendChild(el, setup(props, ctx));
      return el;
    }) as Component;
  }

  // Forma elemento
  const el = document.createElement(tag);
  const ctx: MQ = { element: el };
  let start = 0;
  let use: unknown;
  if (isProps(first)) {
    use = applyProps(el, ctx, first);
    start = 1;
  }
  for (let i = start; i < args.length; i++) appendChild(el, args[i]);
  // Behaviors rodam pós-children: o elemento já está completo (ex.: `$model` num
  // `<select>` precisa das `<option>` para refletir o valor inicial).
  if (use != null) applyUse(ctx, use as Parameters<typeof applyUse>[1]);
  return el as TagElement<T>;
}
