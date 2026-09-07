/**
 * `createTag` — fábrica de tag com assinatura dupla:
 *  - `$.tag(setupFn)` → Componente `(props) => Element` (a closure roda no build);
 *  - `$.tag(props?, ...children)` → Element (props aplicadas, children anexados).
 */

import { isSignal } from '../reactive';
import { applyProps } from './props';
import { appendChild } from './children';
import { isProps } from './guards';
import type { Component, MQ, Props, TagElement, TagName } from '../types';

export function createTag<T extends TagName>(
  tag: T,
  setup: (props: Record<string, unknown>, ctx: MQ<TagElement<T>>) => unknown,
): Component;
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

  // Forma componente: primeiro arg é função (setup)
  if (typeof first === 'function' && !isSignal(first)) {
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
  if (isProps(first)) {
    applyProps(el, ctx, first);
    start = 1;
  }
  for (let i = start; i < args.length; i++) appendChild(el, args[i]);
  return el as TagElement<T>;
}
