/**
 * MQClassList - DOM classList methods with static methods
 * 
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 */
export const MQueryClassList = {
  /**
   * Add class(es) to element
   */
  add(element: Element, ...tokens: string[]): Element {
    element.classList.add(...tokens);
    return element;
  },

  /**
   * Check if element has class
   */
  has(element: Element, token: string): boolean {
    return element.classList.contains(token);
  },

  /**
   * Remove class(es) from element
   */
  remove(element: Element, ...tokens: string[]): Element {
    element.classList.remove(...tokens);
    return element;
  },

  /**
   * Replace a class with another
   */
  replace(element: Element, token: string, newToken: string): boolean {
    return element.classList.replace(token, newToken);
  },

  /**
   * Check if element supports a given class
   */
  supports(element: Element, token: string): boolean {
    return element.classList.supports(token);
  },

  /**
   * Toggle class on element
   */
  toggle(element: Element, token: string, force?: boolean): boolean {
    return element.classList.toggle(token, force);
  },
};

/**
 * @deprecated Use MQClassList instead
 * Backward compatibility alias
 */
export const QueryClassList = MQueryClassList;

export default MQueryClassList;
