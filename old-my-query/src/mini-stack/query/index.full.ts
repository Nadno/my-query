/**
 * MQuery Full - All Plugins
 * 
 * This is the full-featured MQuery bundle with all available plugins:
 * - Selection (query, find, children, etc.)
 * - Mutation (html, append, remove, etc.)
 * - Attribute (get, set, remove attributes)
 * - Event (on, off, $on, $off)
 * - ClassList (add, remove, toggle CSS classes)
 * - DataSet (data-* attribute helpers)
 * - Utils (is, matches, hasFocus, contains)
 * - Directives (built-in: show, trap-focus, overlay, roving-index, inert, if, model)
 * - Collection (MQueryCollection for multiple elements)
 * 
 * For a lighter bundle, use index.ts (standard) or index.light.ts
 * 
 * @example
 * import MQuery from '@mini-stack/query/full';
 * 
 * // All plugins are pre-installed
 * const $el = new MQuery(element);
 * $el.html('<div>content</div>');
 * $el.addClass('active');
 * $el.data('key', 'value');
 */

import { MQCore, MyQueryBase } from '../../types';

// Import built-in directives to register them
import './directives/builtin/show';
import './directives/builtin/trap-focus';
import './directives/builtin/overlay';
import './directives/builtin/roving-index';
import './directives/builtin/inert';
import './directives/builtin/if';
import './directives/builtin/model';

import { MQPlugin } from '@/main';
import { MQFullPlugin } from './plugins';

/**
 * MQuery Full Class
 * 
 * This is the full-featured MQuery class with all plugins pre-installed.
 */
export default class MQuery<T extends Element> implements MQCore<T> {
  /**
   * Get element from selector or existing MQuery/Element
   */
  public static getElement<TElement extends Element>(
    elementOrSelector: string | TElement | MyQueryBase<TElement>,
  ): TElement | null {
    return typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : MQuery.elementFrom(elementOrSelector);
  }

  /**
   * Extract element from MQuery or return as-is
   */
  public static elementFrom<TElement extends Element>(
    element: TElement | MyQueryBase<TElement>,
  ): TElement {
    if (MQuery.isMyQuery<TElement>(element)) return element.element;
    return element as TElement;
  }

  /**
   * Check if object is an MQuery instance
   */
  public static isMyQuery<TElement extends Element>(
    element: any,
  ): element is MQuery<TElement> {
    return !!element && element instanceof MQuery;
  }

  /**
   * Install a plugin to extend MQuery functionality
   */
  public static use(plugin: MQPlugin) {
    plugin.install(MQuery.prototype);
  }

  /**
   * The underlying DOM element
   */
  public element: T;

  constructor(element: T) {
    this.element = element;
  }

  // Note: classlist and attribute are provided via mixins
}

// Apply full plugin to add all methods
MQuery.use(MQFullPlugin);
