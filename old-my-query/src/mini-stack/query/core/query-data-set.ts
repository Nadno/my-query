import { RawJSON } from '@/mini-stack/primitives';
import { MQAttributeValue } from 'src/types';

/**
 * Helper to concat prefix to key
 */
function concatPrefixToKey(prefix: string, key: string): string {
  if (!prefix) return key;
  return prefix + key.substring(0, 1).toUpperCase() + key.substring(1);
}

/**
 * MQDataSet - DOM dataset methods with static methods
 *
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 */
export const MQDataSet = {
  /**
   * Check if element has data attribute
   */
  has(element: HTMLElement, name: string, value?: MQAttributeValue): boolean {
    const result = Object.hasOwn(element.dataset, name);
    if (result && value !== undefined)
      return MQDataSet.get(element, name) === value;
    return result;
  },

  /**
   * Get data attribute value
   */
  get(element: HTMLElement, name: string, defaultValue?: unknown): unknown {
    const result = element.dataset[name];
    if (result == null) return defaultValue;
    return RawJSON.parse(result);
  },

  /**
   * Set data attribute value
   */
  set(element: HTMLElement, name: string, value: MQAttributeValue): Element {
    element.dataset[name] = RawJSON.stringify(value);
    return element;
  },

  /**
   * Remove data attribute
   */
  remove(element: HTMLElement, name: string): unknown {
    const result = MQDataSet.get(element, name);
    delete element.dataset[name];
    return result;
  },

  /**
   * Assign multiple data attributes
   */
  assign(
    element: HTMLElement,
    prefix: string | Record<string, MQAttributeValue>,
    data?: Record<string, MQAttributeValue>,
  ): Element {
    // Handle overload: assign(element, data) vs assign(element, prefix, data)
    const hasPrefix = typeof prefix === 'string';

    if (!hasPrefix) {
      // assign(element, data)
      const dataset = prefix as Record<string, MQAttributeValue>;
      Object.entries(dataset).forEach(([key, value]) =>
        MQDataSet.set(element, key, value),
      );
      return element;
    }

    // assign(element, prefix, data)
    const p = prefix as string;
    const d = data as Record<string, MQAttributeValue>;
    Object.entries(d).forEach(([key, value]) =>
      MQDataSet.set(element, concatPrefixToKey(p, key), value),
    );
    return element;
  },
};

export default MQDataSet;
