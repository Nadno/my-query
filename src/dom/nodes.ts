/** Helpers de nó DOM e resolução de classe. */

import { STYLE_HANDLE } from '../types';
import type { ClassValue } from '../types';

export function isNode(value: unknown): value is Node {
  return (
    typeof value === 'object' &&
    value !== null &&
    'nodeType' in (value as Record<string, unknown>)
  );
}

/** Resolve `class` (string | array | record) para uma string única. */
export function resolveClass(value: ClassValue): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (!value) return '';

  // StyleHandle: callable branded → usa a string de classe dele (com defaults).
  // Função sem brand é ignorada (evita enumerar props de função como classes).
  if (typeof value === 'function') {
    return (value as { [STYLE_HANDLE]?: boolean })[STYLE_HANDLE]
      ? resolveClass((value as () => ClassValue)())
      : '';
  }

  if (Array.isArray(value)) {
    let out = '';
    for (let i = 0; i < value.length; i++) {
      const part = resolveClass(value[i]);
      if (part) out += (out ? ' ' : '') + part;
    }
    return out;
  }

  let out = '';
  for (const key in value) {
    if (value[key]) out += (out ? ' ' : '') + key;
  }
  return out;
}

/** Util de classname condicional (clsx-like). */
export function cx(...args: ClassValue[]): string {
  return resolveClass(args);
}

/** Converte qualquer valor primitivo/array/Node num array plano de nós. */
export function toNodes(value: unknown): Node[] {
  if (value === null || value === undefined || value === false || value === true) {
    return [];
  }
  if (Array.isArray(value)) {
    const nodes: Node[] = [];
    for (let i = 0; i < value.length; i++) nodes.push(...toNodes(value[i]));
    return nodes;
  }
  if (isNode(value)) return [value];
  return [document.createTextNode(String(value))];
}

/** Resolve um alvo (seletor | elemento) para um Element. */
export function getElement(target: string | Element): Element {
  if (typeof target === 'string') {
    const found = document.querySelector(target);
    if (!found) throw new Error(`[mini-q] Nenhum elemento para o seletor "${target}".`);
    return found;
  }
  return target;
}
