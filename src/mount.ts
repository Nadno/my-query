/** `mount` — abre o escopo raiz de lifecycle e injeta a árvore no alvo. */

import { createScope, disposeScope, runInScope, flushMounted } from './lifecycle';
import { getElement } from './dom/nodes';
import { appendChild } from './element';
import type { Component } from './types';

export type Mountable =
  | Node
  | Component
  | [Component, Record<string, unknown>]
  | (() => unknown);

export function mount(
  target: string | Element,
  component: Mountable,
  props?: Record<string, unknown>,
): () => void {
  const parent = getElement(target);
  const scope = createScope(null);
  const nodes: Node[] = [];

  runInScope(scope, () => {
    const rendered =
      typeof component === 'function'
        ? (component as Component)(props ?? {})
        : component;

    const before = parent.childNodes.length;
    appendChild(parent, rendered);
    for (let i = before; i < parent.childNodes.length; i++) {
      const n = parent.childNodes[i];
      if (n) nodes.push(n);
    }
  });

  // nó já conectado: roda os `onMounted` pendentes (cada um no seu escopo)
  flushMounted();

  return () => {
    disposeScope(scope);
    for (const n of nodes) (n as ChildNode).remove();
  };
}
