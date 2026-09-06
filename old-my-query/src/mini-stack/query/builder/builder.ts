/**
 * Element Builder — lean factory for creating HTML elements.
 *
 * Responsibilities:
 *  - Create the DOM element
 *  - Resolve arguments (setup fn | props + children | children only)
 *  - Dispatch each prop to PropsVisitors
 *  - Append children (static or reactive via anchor pattern)
 *
 * All prop handling and reactive tracking go through MQSignalBinder.adapter.
 * No direct dependency on the directives system.
 */

import { MQSignalBinder } from './binder';
import { HTML_TAGS, HtmlTagName, TagElement, HtmlTagTypeMap } from '../tags';
import { MQBuilderCleanup } from './cleanup';
import { BuilderPropsContext, PropsVisitors } from './props-visitor';
import { resolveClass } from './utils';
import { MQMountComponent } from '../types';
import { HTMLElementInstanceMap, HTMLElementTagMap } from '@/html-types';
import getElement from '@/utils/getElement';

function isNode(value: any): value is Node {
  return typeof value === 'object' && value !== null && 'nodeType' in value;
}

function isPropsObject(value: any): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isNode(value) &&
    !MQSignalBinder.adapter?.isSignal(value) &&
    !Array.isArray(value)
  );
}

function toNodes(value: any): Node[] {
  if (value === null || value === undefined || value === false) return [];
  if (Array.isArray(value)) {
    const nodes: Node[] = [];
    for (let i = 0; i < value.length; i++) nodes.push(...toNodes(value[i]));
    return nodes;
  }
  if (isNode(value)) return [value];
  return [document.createTextNode(String(value))];
}

/**
 * Compose class names from multiple arguments (clsx-like utility).
 */
export function cx(...args: any[]): string {
  return resolveClass(args);
}

const appendChild = (element: HTMLElement, child: any) => {
  if (child === null || child === undefined) return;

  if (Array.isArray(child)) {
    for (let i = 0; i < child.length; i++) appendChild(element, child[i]);
    return;
  }

  const adapter = MQSignalBinder.adapter;
  if (adapter?.isSignal(child) || typeof child === 'function') {
    const anchor = document.createTextNode('');
    element.appendChild(anchor);
    let currentNodes: Node[] = [];
    const dispose = adapter.effect(() => {
      const newVal = typeof child === 'function' ? child() :adapter.getValue(child);
      for (let i = 0; i < currentNodes.length; i++) {
        const n = currentNodes[i];
        if (n.parentNode === element) element.removeChild(n);
      }
      const newNodes = toNodes(newVal);
      if (newNodes.length > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < newNodes.length; i++)
          fragment.appendChild(newNodes[i]);
        element.insertBefore(fragment, anchor);
      }
      currentNodes = newNodes;
    });
    MQBuilderCleanup.attachDispose(element, `__child_${anchor}`, dispose);
    return;
  }

  if (isNode(child)) {
    element.appendChild(child);
    return;
  }

  element.appendChild(document.createTextNode(String(child)));
};

function applyProps(element: HTMLElement, props: Record<string, any>) {
  const keys = Object.keys(props);
  for (let i = 0; i < keys.length; i++) {
    const context: BuilderPropsContext = {
      cleanup: MQBuilderCleanup,
      element,
      key: keys[i],
      value: props[keys[i]],
    };
    PropsVisitors.handle(context);
  }
}

const createTag = Object.assign(
  function createTag<T extends keyof HTMLElementTagMap>(
    tag: T,
    ...args: any[]
  ): any {
    const argLen = args.length;
    const first = argLen > 0 ? args[0] : undefined;

    // MQComponentFactory path — deferred creation, returns MQComponent
    if (typeof first === 'function' && !MQSignalBinder.adapter?.isSignal(first)) {
      return (componentProps: any) => {
        const el = document.createElement(tag) as HTMLElement;
        const result = first(componentProps ?? {});
        if (Array.isArray(result)) {
          for (let i = 0; i < result.length; i++) appendChild(el, result[i]);
        } else if (typeof result === 'function') {
          appendChild(el, result);
        }
        else if (result !== null && result !== undefined) {
          const { children, ...attrs } = result as Record<string, any>;
          applyProps(el, attrs);
          if (children !== undefined) appendChild(el, children);
        }
        return el;
      };
    }

    // Immediate element creation
    const element = document.createElement(tag) as HTMLElementInstanceMap[HTMLElementTagMap[T]];
    const el = element as unknown as HTMLElement;

    let props: Record<string, any> | undefined;
    let childStartIndex = 0;

    if (argLen > 0) {
      if (isPropsObject(first)) {
        props = first;
        childStartIndex = 1;
      }
    }

    if (props) applyProps(el, props);

    for (let i = childStartIndex; i < argLen; i++) {
      appendChild(el, args[i]);
    }

    return element;
  },
  {
    visitors: PropsVisitors,
  },
);

const mountTag: MQMountComponent = (target, component, props) => {
  const root = typeof target === 'string' ? getElement(target) : target;
  if (!root) return;
  MQBuilderCleanup.observeRoot(root);
  if (typeof component === 'function') {
    queueMicrotask(() => root.appendChild(component(props)));
  } else {
    queueMicrotask(() => root.appendChild(component));
  }
};

export function createTagFactories(mq: any) {
  const forbidden = new Set(['object', 'constructor', 'prototype']);

  mq.mount = mountTag;

  for (const tag of HTML_TAGS) {
    if (!forbidden.has(tag)) {
      mq[tag] = (...args: any[]) => createTag(tag as any, ...args);
    }
  }
}

export type { HtmlTagName, TagElement, HtmlTagTypeMap };

