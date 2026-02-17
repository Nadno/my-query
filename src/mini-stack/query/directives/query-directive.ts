/**
 * QueryDirective - Directive management capability
 * 
 * Provides .directive() method for attaching behaviors to elements.
 * Uses WeakMap to store directive instances without causing memory leaks.
 */

import { Type } from '@/mini-stack/primitives';
import { DirectiveInstance, IQueryDirective, ReactiveSource } from '@/types/directive';
import { DirectiveClass, isDirectiveClass, isReactiveSource, getReactiveValue } from './directive';
import { DirectiveRegistry } from './directive-registry';

/**
 * Internal storage for directive instances
 * WeakMap<Element, Map<directiveId, DirectiveInstance>>
 */
const _directives = new WeakMap<Element, Map<string, DirectiveInstance>>();

/**
 * Generate unique ID for directive instance
 */
function generateId(name: string, _element: Element): string {
  return `${name}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get or create directive map for an element
 */
function getDirectiveMap(element: Element): Map<string, DirectiveInstance> {
  let map = _directives.get(element);
  if (!map) {
    map = new Map();
    _directives.set(element, map);
  }
  return map;
}

/**
 * Directive management capability for MyQuery
 */
export class QueryDirective<T extends Element> implements IQueryDirective<T> {
  public readonly element: T;

  constructor(element: T) {
    this.element = element;
  }

  /**
   * Apply a directive to the element
   * @param nameOrClass - Directive name (string) or directive class
   * @param value - Optional value to pass to the directive
   */
  directive(
    nameOrClass: string | DirectiveClass<any, any>,
    value: any = true,
  ): this {
    // Resolve directive class
    let directiveClass: DirectiveClass<any, any>;
    let directiveName: string;

    if (isDirectiveClass(nameOrClass)) {
      directiveClass = nameOrClass;
      // Use class name as default name
      directiveName = nameOrClass.name || 'anonymous';
    } else if (Type.isString(nameOrClass)) {
      directiveName = nameOrClass;
      const resolved = DirectiveRegistry.get(directiveName);
      if (!resolved) {
        console.warn(`Directive '${directiveName}' is not registered.`);
        return this;
      }
      directiveClass = resolved;
    } else {
      return this;
    }

    // Get or create directive map for this element
    const directiveMap = getDirectiveMap(this.element);
    const directiveId = `${directiveName}`;

    // Check if directive already exists
    const existing = directiveMap.get(directiveId);

    if (existing) {
      // Update existing directive
      // (oldValue kept for potential future use in hooks)
      
      // Call unmount on old value if reactive
      if (existing.unsubscribe) {
        existing.unsubscribe();
        existing.unsubscribe = undefined;
      }

      // Update value
      existing.value = value;

      const isRaw = !!(directiveClass as any).rawReactive;

      // Handle reactive source
      if (isReactiveSource(value) && !isRaw) {
        existing.unsubscribe = this._handleReactive(existing, value);
      } else if (existing.instance.update) {
        // Call update lifecycle (rawReactive gets signal, others get plain value)
        existing.instance.update(value);
      }

      return this;
    }

    // Create new directive instance
    const instance = new directiveClass(this.element as Element);
    const directiveInstance: DirectiveInstance = {
      id: generateId(directiveName, this.element),
      name: directiveName,
      directive: directiveClass,
      instance,
      value,
    };

    const isRaw = !!(directiveClass as any).rawReactive;

    // Handle reactive source (skip auto-subscription for rawReactive directives)
    if (isReactiveSource(value) && !isRaw) {
      directiveInstance.unsubscribe = this._handleReactive(directiveInstance, value);
    }

    // Store in map
    directiveMap.set(directiveId, directiveInstance);
    // Call mount lifecycle
    // rawReactive directives receive the signal itself; others get the unwrapped value
    if (instance.mount) {
      instance.mount(value);
    }

    return this;
  }

  /**
   * Handle reactive source subscription
   */
  private _handleReactive(
    directiveInstance: DirectiveInstance,
    reactive: ReactiveSource,
  ): () => void {
    // Get initial value if available
    const initialValue = getReactiveValue(reactive);
    if (initialValue !== undefined && directiveInstance.instance.update) {
      directiveInstance.instance.update(initialValue);
    }

    // Subscribe to changes
    return reactive.subscribe((newValue) => {
      if (directiveInstance.instance.update) {
        directiveInstance.instance.update(newValue);
      }
    });
  }
}
