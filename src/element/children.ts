/**
 * `appendChild` — normaliza qualquer filho renderizável e o injeta no pai:
 * primitivos → texto; Node → direto; array → recursivo; `[Component, props]` →
 * chama o componente; fonte reativa (signal|função) → região reativa.
 */

import { isReactive, type Bindable } from '../reactive';
import { isNode } from '../dom/nodes';
import { isComponentTuple } from './guards';
import { mountReactiveRegion } from './region';
import { TELEPORTED } from '../types';

export function appendChild(parent: Node, child: unknown): void {
  if (child === null || child === undefined || child === false || child === true) return;

  if (isComponentTuple(child)) {
    appendChild(parent, child[0](child[1] ?? {}));
    return;
  }

  if (Array.isArray(child)) {
    for (let i = 0; i < child.length; i++) appendChild(parent, child[i]);
    return;
  }

  if (isReactive(child)) {
    mountReactiveRegion(parent, child as Bindable<unknown>);
    return;
  }

  if (isNode(child)) {
    // Elemento teleportado já vive no alvo — não anexa ao pai.
    if ((child as Element & { [TELEPORTED]?: boolean })[TELEPORTED]) return;
    parent.appendChild(child);
    return;
  }

  parent.appendChild(document.createTextNode(String(child)));
}
