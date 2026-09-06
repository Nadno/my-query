import { MQCore } from '@/types';
import { MQManipulation } from '@/types';

type ElementOrSelector = Element | string;

/**
 * Helper to get element from selector or use as-is
 */
function getElementFrom(elementOrSelector: ElementOrSelector): Element | null {
  if (typeof elementOrSelector === 'string') {
    return document.querySelector(elementOrSelector);
  }
  return elementOrSelector;
}

/**
 * MQMutation - DOM manipulation methods with static methods
 *
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 *
 * @example
 * // Direct usage
 * MQMutation.html(element, '<div>content</div>');
 * MQMutation.text(element, 'Hello');
 *
 * // Via MQuery
 * MQuery(element).html('<div>content</div>');
 */
export const MQueryMutation = {
  /**
   * Get or set the innerHTML of an element
   */
  html(element: Element, raw?: string): Element | string {
    if (raw !== undefined) {
      if (raw == null) return element;
      element.innerHTML = raw;
      return element;
    }
    return element.innerHTML;
  },

  /**
   * Get or set the textContent of an element
   */
  text(element: Element, text?: string): Element | string {
    if (text !== undefined) {
      if (text == null) return element;
      element.textContent = text;
      return element;
    }
    return element.textContent ?? '';
  },

  /**
   * Replace an element with another element or selector
   */
  replace(element: Element, elementOrSelector: ElementOrSelector): Element {
    const newElement = getElementFrom(elementOrSelector);
    if (!newElement) return element;

    MQueryMutation.beforeElement(element, newElement);
    element.remove();

    return element;
  },

  /**
   * Swap two elements
   */
  swap(element: Element, elementOrSelector: ElementOrSelector): Element {
    const target = getElementFrom(elementOrSelector);
    if (!target) return element;

    const referenceElement = document.createElement('span');
    element.insertAdjacentElement('beforebegin', referenceElement);

    MQueryMutation.replace(element, target);

    referenceElement.replaceWith(element);

    return element;
  },

  /**
   * Insert content/elements before the element
   */
  before(element: Element, ...elements: (string | Element)[]): Element {
    elements.forEach((el) => {
      if (typeof el === 'string') {
        MQueryMutation.beforeText(element, el);
      } else {
        MQueryMutation.beforeElement(element, el);
      }
    });
    return element;
  },

  /**
   * Insert content/elements at the beginning of the element
   */
  prepend(element: Element, ...elements: (string | Element)[]): Element {
    elements.forEach((el) => {
      if (typeof el === 'string') {
        MQueryMutation.prependText(element, el);
      } else {
        MQueryMutation.prependElement(element, el);
      }
    });
    return element;
  },

  /**
   * Insert content/elements at the end of the element
   */
  append(element: Element, ...elements: (string | Element)[]): Element {
    elements.forEach((el) => {
      if (typeof el === 'string') {
        MQueryMutation.appendText(element, el);
      } else {
        MQueryMutation.appendElement(element, el);
      }
    });
    return element;
  },

  /**
   * Insert content/elements after the element
   */
  after(element: Element, ...elements: (string | Element)[]): Element {
    elements.forEach((el) => {
      if (typeof el === 'string') {
        MQueryMutation.afterText(element, el);
      } else {
        MQueryMutation.afterElement(element, el);
      }
    });
    return element;
  },

  /**
   * Insert raw HTML before the element
   */
  beforeHTML(element: Element, ...raws: string[]): Element {
    raws.forEach((raw) => element.insertAdjacentHTML('beforebegin', raw));
    return element;
  },

  /**
   * Insert raw HTML at the beginning of the element
   */
  prependHTML(element: Element, ...raws: string[]): Element {
    raws.forEach((raw) => element.insertAdjacentHTML('afterbegin', raw));
    return element;
  },

  /**
   * Insert raw HTML at the end of the element
   */
  appendHTML(element: Element, ...raws: string[]): Element {
    raws.forEach((raw) => element.insertAdjacentHTML('beforeend', raw));
    return element;
  },

  /**
   * Insert raw HTML after the element
   */
  afterHTML(element: Element, ...raws: string[]): Element {
    raws.forEach((raw) => element.insertAdjacentHTML('afterend', raw));
    return element;
  },

  /**
   * Insert text before the element
   */
  beforeText(element: Element, ...texts: string[]): Element {
    texts.forEach((text) => element.insertAdjacentText('beforebegin', text));
    return element;
  },

  /**
   * Insert text at the beginning of the element
   */
  prependText(element: Element, ...texts: string[]): Element {
    texts.forEach((text) => element.insertAdjacentText('afterbegin', text));
    return element;
  },

  /**
   * Insert text at the end of the element
   */
  appendText(element: Element, ...texts: string[]): Element {
    texts.forEach((text) => element.insertAdjacentText('beforeend', text));
    return element;
  },

  /**
   * Insert text after the element
   */
  afterText(element: Element, ...texts: string[]): Element {
    texts.forEach((text) => element.insertAdjacentText('afterend', text));
    return element;
  },

  /**
   * Insert an element before this element
   */
  beforeElement(element: Element, ...elements: Element[]): Element {
    elements.forEach((el) => element.insertAdjacentElement('beforebegin', el));
    return element;
  },

  /**
   * Insert an element at the beginning of this element
   */
  prependElement(element: Element, ...elements: Element[]): Element {
    elements.forEach((el) => element.insertAdjacentElement('afterbegin', el));
    return element;
  },

  /**
   * Insert an element at the end of this element
   */
  appendElement(element: Element, ...elements: Element[]): Element {
    elements.forEach((el) => element.insertAdjacentElement('beforeend', el));
    return element;
  },

  /**
   * Insert an element after this element
   */
  afterElement(element: Element, ...elements: Element[]): Element {
    for (const el of elements) element.insertAdjacentElement('afterend', el);
    return element;
  },

  /**
   * Remove all child nodes from the element
   */
  clear(element: Element): Element {
    const $children = element.childNodes;

    let $child = $children.item(0);

    while ($child) {
      element.removeChild($child);
      $child = $children.item(0);
    }

    return element;
  },

  /**
   * Remove the element from the DOM
   */
  remove(element: Element): Element {
    try {
      element.remove();
    } catch {
      element.parentElement?.removeChild(element);
    }
    return element;
  },
};

/**
 * @deprecated Use MQMutation instead
 * Backward compatibility alias
 */
export const QueryMutation = MQueryMutation;

export default MQueryMutation;

