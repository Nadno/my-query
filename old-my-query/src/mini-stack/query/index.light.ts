/**
 * MQuery Light - Core only, no plugins
 * 
 * This is the minimal MQuery class with only basic element access methods.
 * Use this for maximum tree-shaking and minimal bundle size.
 * 
 * @example
 * import MQuery from '@mini-stack/query/light';
 * 
 * // Basic usage only
 * const $el = new MQuery(document.querySelector('.item'));
 * 
 * // Add plugins as needed
 * import { selectionPlugin, mutationPlugin } from '@mini-stack/query/plugins';
 * MQuery.use(selectionPlugin);
 * MQuery.use(mutationPlugin);
 */

import { MQCore, MyQueryBase } from '../../types';
import { MQPlugin } from '@/main';

/**
 * Light MQuery - Core class without any plugins
 * 
 * This is the base MQuery class with only static methods for element access.
 * All functionality is added via plugins using MQuery.use()
 */
export default class MQuery<T extends Element> implements MyQueryBase<T> {
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
    if (MQuery.isMQElement<TElement>(element)) return element.element;
    return element as TElement;
  }

  /**
   * Check if object is an MQuery instance
   */
  public static isMQElement<TElement extends Element>(
    element: any,
  ): element is MQuery<TElement> {
    return !!element && element instanceof MQuery;
  }

  /**
   * Install a plugin to extend MQuery functionality
   * 
   * @param plugin - The plugin to install
   * 
   * @example
   * MQuery.use(selectionPlugin);
   * MQuery.use(mutationPlugin);
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
}
