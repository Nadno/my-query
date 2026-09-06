/**
 * MQUtils - DOM utility methods with static methods
 *
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 */
export const MQUtils = {
  /**
   * Check if element matches any of the selectors
   */
  is(
    element: Element,
    selectors: string | Element | null | Array<string | Element | null>,
  ): boolean {
    if (Array.isArray(selectors)) {
      return selectors.some((selector) => {
        if (typeof selector !== 'string') return element === selector;
        return element.matches(selector);
      });
    }

    if (typeof selectors !== 'string') return element === selectors;
    return MQUtils.matches(element, selectors as string);
  },

  /**
   * Check if element matches selector
   */
  matches(element: Element, selector: string | string[]): boolean {
    if (Array.isArray(selector)) selector = selector.join(', ');
    return element.matches(selector);
  },

  /**
   * Check if element has focus
   */
  hasFocus(element: Element): boolean {
    return element === document.activeElement;
  },

  /**
   * Check if element or its descedants has focus
   */
  containsFocus(element: Element): boolean {
    return (
      element === document.activeElement ||
      element.contains(document.activeElement)
    );
  },

  /**
   * Check if element contains node
   */
  contains(element: Element, node: Node | null): boolean {
    return element.contains(node);
  },
};

export default MQUtils;
