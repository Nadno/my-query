import { RawJSON } from '@/mini-stack/primitives';
import { MQAttributeValue } from '../../../types';

/**
 * MQAttribute - DOM attribute methods with static methods
 * 
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 */
export const MQueryAttribute = {
  /**
   * Check if element has attribute
   */
  has(element: Element, name: string, value?: MQAttributeValue): boolean {
    let hasAttr = element.hasAttribute(name);
    if (hasAttr && value !== undefined) hasAttr = MQueryAttribute.get(element, name) === value;
    return hasAttr;
  },

  /**
   * Get attribute value
   */
  get(element: Element, name: string, defaultValue?: unknown): unknown {
    const value = element.getAttribute(name);
    if (!value) return value === null ? defaultValue : value;
    return RawJSON.parse(value);
  },

  /**
   * Set attribute value
   */
  set(element: Element, name: string, value: MQAttributeValue): Element {
    element.setAttribute(name, RawJSON.stringify(value));
    return element;
  },

  /**
   * Remove attribute
   */
  remove(element: Element, name: string): unknown {
    const result = MQueryAttribute.get(element, name);
    element.removeAttribute(name);
    return result;
  },

  /**
   * Assign multiple attributes
   */
  assign(element: Element, attributes: Record<string, MQAttributeValue>): Element {
    Object.entries(attributes).forEach(([name, value]) =>
      MQueryAttribute.set(element, name, value),
    );
    return element;
  },
};

/**
 * @deprecated Use MQAttribute instead
 * Backward compatibility alias
 */
export const QueryAttribute = MQueryAttribute;

export default MQueryAttribute;
