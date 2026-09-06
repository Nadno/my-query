/**
 * Builder utility functions — pure/static helpers used by MQBuilderPlugin visitors.
 * No reactivity here; reactive prop handling is done via MQSignalBinder.adapter in plugins.
 */

export function resolveClass(value: any): string {
  if (typeof value === 'string') return value;
  if (!value) return '';
  if (Array.isArray(value)) {
    let str = '';
    for (let i = 0; i < value.length; i++) {
      const r = resolveClass(value[i]);
      if (r) str += (str ? ' ' : '') + r;
    }
    return str;
  }
  if (typeof value === 'object') {
    let str = '';
    for (const k in value) {
      if (value[k]) str += (str ? ' ' : '') + k;
    }
    return str;
  }
  return '';
}

export function applyClass(element: HTMLElement, value: any): void {
  const className = resolveClass(value);
  if (className) {
    element.className = className;
  } else if (element.className) {
    element.removeAttribute('class');
  }
}

export function setProperty(element: HTMLElement, key: string, value: any): void {
  if (key in element) {
    (element as any)[key] = value;
  } else if (value === false || value === null || value === undefined) {
    element.removeAttribute(key);
  } else {
    element.setAttribute(key, String(value));
  }
}

export function applyStyle(element: HTMLElement, value: any): void {
  if (typeof value === 'string') {
    element.setAttribute('style', value);
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const k in value) (element.style as any)[k] = String(value[k]);
  }
}
