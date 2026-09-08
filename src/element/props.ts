/**
 * Props → elemento. Chaves especiais (`class`/`style`/`data`/`on`/`use`/`key`) e o
 * `$`-prefixo reativo (`$disabled`, `$class`, …) que liga a fonte via `bind`.
 */

import { bind, type Bindable } from '../reactive';
import { resolveClass } from '../dom/nodes';
import { applyEvents } from '../events/apply';
import type { ClassValue, MQ } from '../types';

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

/**
 * Aplica as props ao elemento e **devolve** o valor de `use` (behaviors) sem aplicá-lo:
 * o caller (`createTag`) roda os behaviors **depois** de anexar os filhos, para que o
 * elemento já esteja completo (ex.: `$model` num `<select>` precisa das `<option>`).
 */
export function applyProps(
  el: Element,
  ctx: MQ,
  props: Record<string, unknown>,
): unknown {
  let use: unknown;
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
        use = value; // aplicado pelo caller, pós-children
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
  return use;
}
