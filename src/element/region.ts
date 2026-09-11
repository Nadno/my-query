/**
 * Região reativa: uma fonte (signal|função) vira uma âncora + reconciliação keyed.
 *
 * A construção da subárvore roda **destrastreada** (`untrack`), então signals lidos
 * ao montar um item NÃO viram dependência da região (evita remontar tudo). O reconcile
 * move apenas nós fora de posição e restaura o foco de um nó reusado que precisou mover.
 */

import { createScope, disposeScope, registerCleanup, runInScope, flushMounted, type Scope } from '../lifecycle';
import { getAdapter, read, untrack, type Bindable } from '../reactive';
import { toNodes, isTeleported } from '../dom/nodes';
import { isComponentTuple } from './guards';
import { appendChild } from './children';

interface RegionEntry {
  nodes: Node[];
  scope: Scope;
}

export function mountReactiveRegion(parent: Node, source: Bindable<unknown>): void {
  const anchor = document.createComment('mq');
  parent.appendChild(anchor);

  const keyed = new Map<unknown, RegionEntry>();
  let volatile: RegionEntry[] = [];

  const disposeVolatile = () => {
    for (const entry of volatile) {
      disposeScope(entry.scope);
      for (const n of entry.nodes) (n as ChildNode).remove();
    }
    volatile = [];
  };

  const reconcile = (value: unknown, scope: Scope) => {
    disposeVolatile();

    const items = Array.isArray(value) ? value : [value];
    const used = new Set<unknown>();
    const ordered: RegionEntry[] = [];
    let volatileCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (isComponentTuple(item)) {
        const props = (item[1] ?? {}) as Record<string, unknown>;
        const key = props.key ?? props;
        used.add(key);
        let entry = keyed.get(key);
        if (!entry) {
          const itemScope = createScope();
          // construir o item NÃO deve virar dependência da região
          const nodes = runInScope(itemScope, () => untrack(() => toNodes(item[0](props))));
          entry = { nodes, scope: itemScope };
          keyed.set(key, entry);
        }
        ordered.push(entry);
      } else {
        // Item cru/reativo: monta de verdade via `appendChild` (uma função/região
        // retornada vira sub-região, não `String(fn)` como texto). Anexa no `parent`
        // real e captura os nós pelo intervalo de índices (o loop de reordenação
        // reposiciona depois) — anexar num fragment quebraria uma sub-região, que fecha
        // sobre `parent`. Construir NÃO deve virar dependência da região → `untrack`.
        const before = parent.childNodes.length;
        runInScope(scope, () => untrack(() => appendChild(parent, item)));
        const nodes: Node[] = [];
        for (let k = before; k < parent.childNodes.length; k++) {
          const n = parent.childNodes[k];
          if (n) nodes.push(n);
        }
        const entry: RegionEntry = { nodes, scope };
        volatile.push(entry);
        volatileCount++;
        ordered.push(entry);
      }
    }

    // remove keyed não usados
    for (const [key, entry] of keyed) {
      if (!used.has(key)) {
        disposeScope(entry.scope);
        for (const n of entry.nodes) (n as ChildNode).remove();
        keyed.delete(key);
      }
    }

    // Sem itens voláteis, o escopo da construção não tem dono — descarta já.
    if (volatileCount === 0) disposeScope(scope);

    // reordena de trás pra frente, movendo APENAS nós fora de posição
    // (insertBefore de um nó já correto o removeria/reinseriria, perdendo foco).
    // Nós teleportados vivem no alvo, não no pai — não participam da reordenação.
    const active = document.activeElement as HTMLElement | null;
    let ref: Node = anchor;
    for (let i = ordered.length - 1; i >= 0; i--) {
      const nodes = ordered[i]!.nodes;
      for (let j = nodes.length - 1; j >= 0; j--) {
        const n = nodes[j]!;
        if (isTeleported(n)) continue;
        if (n.nextSibling !== ref) parent.insertBefore(n, ref);
        ref = n;
      }
    }
    // se um nó reusado que estava focado precisou ser movido, restaura o foco
    if (
      active &&
      active !== document.activeElement &&
      active.isConnected &&
      typeof active.focus === 'function'
    ) {
      active.focus({ preventScroll: true });
    }
  };

  const stop = getAdapter().effect(() => {
    const scope = createScope();
    runInScope(scope, () => reconcile(read(source), scope));
    // nós já anexados: roda os onMounted pendentes desta reconciliação
    flushMounted();
  });
  registerCleanup(stop);

  registerCleanup(() => {
    disposeVolatile();
    for (const entry of keyed.values()) {
      disposeScope(entry.scope);
      for (const n of entry.nodes) (n as ChildNode).remove();
    }
    keyed.clear();
    (anchor as ChildNode).remove();
  });
}
