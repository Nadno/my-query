/**
 * Element — `createTag` com assinatura dupla:
 *  - `$.tag(setupFn)` → Componente `(props) => Element`
 *  - `$.tag(props?, ...children)` → Element
 *
 * Children aceitam: primitivos, Node, arrays, `[Component, props]` (lazy/cache),
 * e fontes reativas (signal | função) — estas viram região com âncora + reconciliação
 * keyed para listas.
 */

import {
  createScope,
  disposeScope,
  registerCleanup,
  runInScope,
  type Scope,
} from './lifecycle';
import { bind, isReactive, isSignal, read, untrack, type Bindable } from './reactive';
import { isNode, resolveClass, toNodes } from './dom/nodes';
import { applyEvents } from './events/apply';
import { applyUse } from './behaviors';
import type {
  ClassValue,
  Component,
  ComponentTuple,
  MQ,
  Props,
  TagElement,
  TagName,
} from './types';

/* ------------------------------------------------------------------ props --- */

function applyClass(el: Element, value: ClassValue): void {
  const className = resolveClass(value);
  if (className) el.className = className;
  else if (el.className) el.removeAttribute('class');
}

function applyStyle(el: HTMLElement, value: string | Partial<CSSStyleDeclaration>): void {
  if (typeof value === 'string') {
    el.setAttribute('style', value);
    return;
  }
  for (const key in value) {
    const v = value[key as keyof CSSStyleDeclaration];
    if (v != null) (el.style as unknown as Record<string, string>)[key] = String(v);
  }
}

function setAttr(el: Element, key: string, value: unknown): void {
  if (value === false || value === null || value === undefined) {
    el.removeAttribute(key);
    return;
  }
  if (key in el) {
    (el as unknown as Record<string, unknown>)[key] = value;
    return;
  }
  el.setAttribute(key, String(value));
}

function applyProps(el: Element, ctx: MQ, props: Record<string, unknown>): void {
  for (const key in props) {
    const value = props[key];

    switch (key) {
      case 'key':
        continue;
      case 'class':
        applyClass(el, value as ClassValue);
        continue;
      case '$class':
        bind(value as Bindable<ClassValue>, (v) => applyClass(el, v));
        continue;
      case 'style':
        applyStyle(el as HTMLElement, value as string | Partial<CSSStyleDeclaration>);
        continue;
      case '$style':
        bind(value as Bindable<string | Partial<CSSStyleDeclaration>>, (v) =>
          applyStyle(el as HTMLElement, v),
        );
        continue;
      case 'data':
        for (const k in value as Record<string, unknown>) {
          (el as HTMLElement).dataset[k] = String((value as Record<string, unknown>)[k]);
        }
        continue;
      case '$data':
        for (const k in value as Record<string, Bindable<unknown>>) {
          bind((value as Record<string, Bindable<unknown>>)[k], (v) => {
            (el as HTMLElement).dataset[k] = String(v);
          });
        }
        continue;
      case 'on':
        applyEvents(ctx, value as Parameters<typeof applyEvents>[1]);
        continue;
      case 'use':
        applyUse(ctx, value as Parameters<typeof applyUse>[1]);
        continue;
    }

    // $-prefixo → atributo/propriedade reativa
    if (key.charCodeAt(0) === 36) {
      const name = key.slice(1);
      bind(value as Bindable<unknown>, (v) => setAttr(el, name, v));
      continue;
    }

    setAttr(el, key, value);
  }
}

/* --------------------------------------------------------------- children --- */

function isComponentTuple(value: unknown): value is ComponentTuple {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'function' &&
    !isSignal(value[0]) &&
    (value[1] == null ||
      (typeof value[1] === 'object' && !isNode(value[1]) && !Array.isArray(value[1])))
  );
}

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
    parent.appendChild(child);
    return;
  }

  parent.appendChild(document.createTextNode(String(child)));
}

interface RegionEntry {
  nodes: Node[];
  scope: Scope;
}

function mountReactiveRegion(parent: Node, source: Bindable<unknown>): void {
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

  const reconcile = (value: unknown) => {
    disposeVolatile();

    const items = Array.isArray(value) ? value : [value];
    const used = new Set<unknown>();
    const ordered: RegionEntry[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (isComponentTuple(item)) {
        const props = (item[1] ?? {}) as Record<string, unknown>;
        const key = props.key ?? props;
        used.add(key);
        let entry = keyed.get(key);
        if (!entry) {
          const scope = createScope();
          // construir o item NÃO deve virar dependência da região
          const nodes = runInScope(scope, () => untrack(() => toNodes(item[0](props))));
          entry = { nodes, scope };
          keyed.set(key, entry);
        }
        ordered.push(entry);
      } else {
        const scope = createScope();
        const nodes = runInScope(scope, () => untrack(() => toNodes(item)));
        const entry: RegionEntry = { nodes, scope };
        volatile.push(entry);
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

    // reordena de trás pra frente, movendo APENAS nós fora de posição
    // (insertBefore de um nó já correto o removeria/reinseriria, perdendo foco)
    const active = document.activeElement as HTMLElement | null;
    let ref: Node = anchor;
    for (let i = ordered.length - 1; i >= 0; i--) {
      const nodes = ordered[i]!.nodes;
      for (let j = nodes.length - 1; j >= 0; j--) {
        const n = nodes[j]!;
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

  bind(source, reconcile);

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

/**
 * Condicional. Só a `cond` é rastreada; a construção do ramo roda destrastreada,
 * então signals lidos ao montar a subárvore NÃO viram dependência da região
 * (evita remontar a árvore inteira quando esses signals mudam).
 */
export function when(
  cond: Bindable<unknown>,
  thenFn: () => unknown,
  elseFn?: () => unknown,
): () => unknown {
  return () =>
    read(cond) ? untrack(thenFn) : elseFn ? untrack(elseFn) : null;
}

/* ------------------------------------------------------------- createTag --- */

function isProps(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isNode(value) &&
    !Array.isArray(value) &&
    !isSignal(value)
  );
}

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
