/**
 * Element Builder - Factory for creating HTML elements
 *
 * Provides type-safe factory functions for creating HTML elements with
 * support for reactive signals, directives, and scoped setup.
 */

import MQuery from '.';
import { DirectiveRegistry } from './directives/directive-registry';
import { isReactiveSource, getReactiveValue } from './directives/directive';
import { HTML_TAGS, HtmlTagName, TagElement, HtmlTagTypeMap } from './tags';

// --- Types for Memory Safety ---
type CleanupFn = () => void;
type ElementWithCleanup = HTMLElement & { __cleanups?: CleanupFn[] };

/**
 * Register a cleanup function to be called when the element is destroyed
 * (Note: You need to manually call these if removing elements programmatically
 * without using the framework's flow control, or rely on WeakRefs in the future)
 */
function registerCleanup(el: Node, fn: CleanupFn) {
  const node = el as any;
  if (!node.__cleanups) node.__cleanups = [];
  node.__cleanups.push(fn);
}

/**
 * Flatten nested arrays of children
 */
function flattenChildren(children: any[]): any[] {
  return children.flat();
}

/**
 * Check if a value is a DOM Node
 */
function isNode(value: any): value is Node {
  return typeof value === 'object' && value !== null && 'nodeType' in value;
}

/**
 * Check if a value is a valid props object
 */
function isPropsObject(value: any): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isNode(value) &&
    !isReactiveSource(value) &&
    !Array.isArray(value)
  );
}

/**
 * Handle reactive attributes/properties with Cleanup
 */
function setReactiveProperty(
  element: HTMLElement,
  key: string,
  source: any,
): void {
  const initialValue = getReactiveValue(source);
  if (initialValue !== undefined) {
    setProperty(element, key, initialValue);
  }

  const cleanup = source.subscribe((value: any) => {
    setProperty(element, key, value);
  });
  registerCleanup(element, cleanup);
}

/**
 * Resolve class value to a string (Optimized for performance)
 */
function resolveClass(value: any): string {
  if (typeof value === 'string') return value;
  if (!value) return '';

  if (Array.isArray(value)) {
    let str = '';
    for (let i = 0; i < value.length; i++) {
      const resolved = resolveClass(value[i]);
      if (resolved) str += (str ? ' ' : '') + resolved;
    }
    return str;
  }

  if (typeof value === 'object') {
    let str = '';
    for (const key in value) {
      if (value[key]) str += (str ? ' ' : '') + key;
    }
    return str;
  }
  return '';
}

/**
 * Apply resolved class to an element
 */
function applyClass(element: HTMLElement, value: any): void {
  const className = resolveClass(value);
  if (className) {
    element.className = className;
  } else if (element.className) {
    element.removeAttribute('class');
  }
}

/**
 * Handle reactive class binding with Cleanup
 */
function setReactiveClass(element: HTMLElement, source: any): void {
  const initialValue = getReactiveValue(source);
  if (initialValue !== undefined) {
    applyClass(element, initialValue);
  }
  const cleanup = source.subscribe((value: any) => {
    applyClass(element, value);
  });
  registerCleanup(element, cleanup);
}

/**
 * Compose class names from multiple arguments (clsx-like utility)
 */
export function cx(...args: any[]): string {
  return resolveClass(args);
}

/**
 * Set property or attribute on element
 */
function setProperty(element: HTMLElement, key: string, value: any): void {
  // Fast path for style string
  if (key === 'style' && typeof value === 'string') {
    element.setAttribute('style', value);
    return;
  }

  if (key in element) {
    (element as any)[key] = value;
  } else if (value === false || value === null || value === undefined) {
    element.removeAttribute(key);
  } else {
    element.setAttribute(key, String(value));
  }
}

/**
 * Handle reactive style object
 */
function setReactiveStyle(element: HTMLElement, value: any) {
  // Case 1: The whole style object is a signal
  if (isReactiveSource(value)) {
    const cleanup = value.subscribe((newStyles: any) => {
      for (const k in newStyles) {
        (element.style as any)[k] = String(newStyles[k]);
      }
    });
    registerCleanup(element, cleanup);
    return;
  }

  // Case 2: Static object with some signals inside
  if (typeof value === 'object' && value !== null) {
    for (const k in value) {
      const propValue = value[k];
      if (isReactiveSource(propValue)) {
        // Initial
        const init = getReactiveValue(propValue);
        if (init !== undefined) (element.style as any)[k] = String(init);

        // Subscribe
        const cleanup = propValue.subscribe((v: any) => {
          (element.style as any)[k] = String(v);
        });
        registerCleanup(element, cleanup);
      } else {
        (element.style as any)[k] = String(propValue);
      }
    }
  }
}

/**
 * Converte qualquer valor (Array, String, Node) em um array plano de Nodes DOM.
 */
function toNodes(value: any): Node[] {
  if (value === null || value === undefined || value === false) return [];

  if (Array.isArray(value)) {
    // Recursividade para arrays aninhados
    const nodes: Node[] = [];
    for (let i = 0; i < value.length; i++) {
      nodes.push(...toNodes(value[i]));
    }
    return nodes;
  }

  if (isNode(value)) return [value];

  // Primitivos viram texto
  return [document.createTextNode(String(value))];
}

// 4. Children Application (Recursive & Optimized)
const appendChild = (element: HTMLElement, child: any) => {
  if (child === null || child === undefined) return;

  // A. Array (Recursion) - Otimiza listas aninhadas
  if (Array.isArray(child)) {
    const len = child.length;
    for (let i = 0; i < len; i++) {
      appendChild(element, child[i]);
    }
    return;
  }

  // B. Reactive Child (Anchor Pattern)
  if (isReactiveSource(child)) {
    const anchor = document.createTextNode('');
    element.appendChild(anchor);

    let currentNodes: Node[] = [];

    const cleanup = child.subscribe((newVal: any) => {
      // Limpeza rápida
      for (let i = 0; i < currentNodes.length; i++) {
        const node = currentNodes[i];
        if (node.parentNode === element) element.removeChild(node);
      }

      // Normalização interna (usa a mesma lógica de appendChild se possível ou helper)
      // Como toNodes cria array, usamos fragment para batch insert
      const newNodes = toNodes(newVal);

      if (newNodes.length > 0) {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < newNodes.length; i++) {
          fragment.appendChild(newNodes[i]);
        }
        element.insertBefore(fragment, anchor);
      }
      currentNodes = newNodes;
    });
    registerCleanup(element, cleanup);
    return;
  }

  // C. Static Node
  if (isNode(child)) {
    element.appendChild(child);
    return;
  }

  // D. Static Primitive
  element.appendChild(document.createTextNode(String(child)));
};

/**
 * Create an HTML element with the given tag name and arguments
 * Optimized: No array slicing, direct index iteration, native recursion.
 */
function _createTag<T extends HtmlTagName>(
  tag: T,
  ...args: any[]
): TagElement<T> {
  // 1. Creation
  const element = document.createElement(tag) as TagElement<T>;

  // Lazy Wrapper
  let mq: MQuery<any> | undefined;

  let props: Record<string, any> | undefined;

  // Controle de fluxo para filhos:
  // Se for Setup, usamos o retorno da função.
  // Se for padrão, usamos o próprio 'args' começando de um índice.
  let childrenSource: any[] = args;
  let childStartIndex = 0;

  // 2. Argument Resolution (Zero Slice)
  const argLen = args.length;
  if (argLen > 0) {
    const first = args[0];

    if (typeof first === 'function' && !isReactiveSource(first)) {
      // Case A: Scoped Setup
      mq = new MQuery(element);
      const res = first(mq);
      // Se setup retornar algo, usamos isso como fonte de filhos
      if (res !== undefined && res !== null) {
        childrenSource = Array.isArray(res) ? res : [res];
        childStartIndex = 0;
      } else {
        childrenSource = []; // Setup não retornou nada
      }
    } else if (isPropsObject(first)) {
      // Case B: Props + Children
      props = first;
      childStartIndex = 1; // Filhos começam no índice 1
    } else {
      // Case C: Children Only
      childStartIndex = 0; // Filhos começam no índice 0
    }
  }

  // 3. Props Application (Mantido igual, omitido aqui para focar na mudança)
  if (props) {
    const keys = Object.keys(props);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const val = props[key];

      // ... (mesma lógica de props da versão anterior: Class, Events, Styles, Directives) ...
      // Cole aqui o bloco de props da resposta anterior
      if (key === 'class') {
        if (isReactiveSource(val)) setReactiveClass(element, val);
        else applyClass(element, val);
        continue;
      }
      if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
        if (typeof val === 'function')
          element.addEventListener(key.slice(2).toLowerCase(), val);
        continue;
      }
      if (key === 'style') {
        if (typeof val === 'string') element.setAttribute('style', val);
        else setReactiveStyle(element, val);
        continue;
      }
      if (DirectiveRegistry.has(key)) {
        if (!mq) mq = new MQuery(element);
        if (isReactiveSource(val)) {
          const cleanup = val.subscribe((v: any) => mq!.directive(key, v));
          registerCleanup(element, cleanup);
        } else {
          mq.directive(key, val);
        }
        continue;
      }
      if (key === 'directives' && typeof val === 'object') {
        if (!mq) mq = new MQuery(element);
        for (const dirName in val) {
          if (!DirectiveRegistry.has(dirName)) continue;
          const dirVal = val[dirName];
          if (isReactiveSource(dirVal)) {
            const cleanup = dirVal.subscribe((v: any) =>
              mq!.directive(dirName, v),
            );
            registerCleanup(element, cleanup);
          } else {
            mq.directive(dirName, dirVal);
          }
        }
        continue;
      }
      if (isReactiveSource(val)) {
        setReactiveProperty(element, key, val);
      } else {
        setProperty(element, key, val);
      }
    }
  }

  // 5. Main Loop (Itera direto na fonte definida no passo 2)
  const len = childrenSource.length;
  for (let i = childStartIndex; i < len; i++) {
    appendChild(element, childrenSource[i]);
  }

  return element;
}

// ... (Imports e Types anteriores mantidos) ...

/**
 * Helper: Check if string starts with '$' (ASCII 36)
 * Extremely fast check compared to regex or slice
 */
function isReactiveKey(key: string): boolean {
  return key.charCodeAt(0) === 36;
}

/**
 * Create an HTML element with the given tag name and arguments
 * OPTIMIZATION: Explicit Reactive Props ($prefix)
 * Eliminates 'isReactiveSource' checks for static props.
 */
function createTag<T extends HtmlTagName>(
  tag: T,
  ...args: any[]
): TagElement<T> {
  // 1. Creation
  const element = document.createElement(tag) as TagElement<T>;

  let mq: MQuery<any> | undefined;
  let props: Record<string, any> | undefined;

  // Children Source Control
  let childrenSource: any[] = args;
  let childStartIndex = 0;

  // 2. Argument Resolution
  const argLen = args.length;
  if (argLen > 0) {
    const first = args[0];
    if (typeof first === 'function' && !isReactiveSource(first)) {
      // Scoped Setup
      mq = new MQuery(element);
      const res = first(mq);
      if (res !== undefined && res !== null) {
        childrenSource = Array.isArray(res) ? res : [res];
        childStartIndex = 0;
      } else {
        childrenSource = [];
      }
    } else if (isPropsObject(first)) {
      props = first;
      childStartIndex = 1;
    } else {
      childStartIndex = 0;
    }
  }

  // 3. Props Application (Explicit Reactive $)
  if (props) {
    const keys = Object.keys(props);
    const len = keys.length;

    for (let i = 0; i < len; i++) {
      const key = keys[i];
      const val = props[key];

      // --- A. Special Props (Class / Style) ---

      // Static Class
      if (key === 'class') {
        applyClass(element, val);
        continue;
      }
      // Reactive Class ($class)
      if (key === '$class') {
        setReactiveClass(element, val);
        continue;
      }

      // Static Style
      if (key === 'style') {
        // Aceita string ou objeto estático
        if (typeof val === 'string') element.setAttribute('style', val);
        else setReactiveStyle(element, val); // Reutiliza lógica de objeto para estático também se quiser, ou cria applyStyle estático
        continue;
      }
      // Reactive Style ($style)
      if (key === '$style') {
        setReactiveStyle(element, val);
        continue;
      }

      // --- B. Events (Always static function reference) ---
      if (key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110) {
        // 'on'
        if (typeof val === 'function') {
          element.addEventListener(key.slice(2).toLowerCase(), val);
        }
        continue;
      }

      // --- C. Directives (Behavioral) ---
      if (DirectiveRegistry.has(key)) {
        const DirClass = DirectiveRegistry.get(key)!;

        // 1. Instanciação Direta (Performance: Evita new MyQuery(element))
        const instance = new DirClass(element);

        // 2. Registra Cleanup do Ciclo de Vida (Chama unmount quando o elemento morrer)
        if (instance.unmount) {
          registerCleanup(element, () => instance.unmount!());
        }

        // 3. Reatividade ou Estático
        if (isReactiveSource(val)) {
          // A. Reactive ($show: signal)
          // Mount com valor inicial (unwrapped)
          const initVal = getReactiveValue(val);
          instance.mount(initVal);

          // Subscribe para Updates
          if (instance.update) {
            const cleanup = val.subscribe((v: any) => instance.update!(v));
            registerCleanup(element, cleanup);
          }
        } else {
          // B. Static (show: true)
          instance.mount(val);
        }
        continue;
      }

      // Suporte a objeto 'directives: { ... }'
      if (key === 'directives' && typeof val === 'object') {
        for (const dirName in val) {
          const directiveName = isReactiveKey(dirName)
            ? dirName.substring(1)
            : dirName;
          if (!DirectiveRegistry.has(directiveName)) continue;

          const DirClass = DirectiveRegistry.get(directiveName)!;
          const dirVal = val[dirName];

          const instance = new DirClass(element);
          if (instance.unmount)
            registerCleanup(element, () => instance.unmount!());

          if (isReactiveKey(dirName)) {
            instance.mount(getReactiveValue(dirVal));
            if (instance.update) {
              registerCleanup(
                element,
                dirVal.subscribe((v) => instance.update!(v)),
              );
            }
          } else {
            instance.mount(dirVal);
          }
        }
        continue;
      }

      // --- D. Generic Attributes (The Big Optimization) ---

      // Case 1: Reactive Attribute (Starts with $)
      if (isReactiveKey(key)) {
        // Remove o '$' do início (ex: '$disabled' -> 'disabled')
        // .slice(1) é muito rápido em V8
        setReactiveProperty(element, key.slice(1), val);
      }
      // Case 2: Static Attribute (No checks needed!)
      else {
        setProperty(element, key, val);
      }
    }
  }

  // 4. Children Application (Mantém igual - Anchor Pattern)
  const appendChild = (child: any) => {
    if (child === null || child === undefined) return;

    if (Array.isArray(child)) {
      for (let i = 0; i < child.length; i++) appendChild(child[i]);
      return;
    }

    // Children ainda precisam de verificação automática
    // pois não tem "chave" para por o prefixo $.
    if (isReactiveSource(child)) {
      const anchor = document.createTextNode('');
      element.appendChild(anchor);
      let currentNodes: Node[] = [];
      const cleanup = child.subscribe((newVal: any) => {
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
      registerCleanup(element, cleanup);
      return;
    }

    if (isNode(child)) {
      element.appendChild(child);
      return;
    }

    element.appendChild(document.createTextNode(String(child)));
  };

  // 5. Main Loop
  const len = childrenSource.length;
  for (let i = childStartIndex; i < len; i++) {
    appendChild(childrenSource[i]);
  }

  return element;
}

export function createTagFactories(mq: any) {
  const forbiddenTags = ['object', 'constructor', 'prototype'];
  for (const tag of HTML_TAGS) {
    if (!forbiddenTags.includes(tag)) {
      mq[tag] = (...args: any[]) => createTag(tag as any, ...args);
    }
  }
}

export type { HtmlTagName, TagElement, HtmlTagTypeMap };

