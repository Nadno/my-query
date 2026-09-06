import { MiniQuery as $ } from './base';
import { MQCore } from '../../../types';
import { HTMLElementInstanceMap } from '@/html-types';

type SiblingType = 'nextElementSibling' | 'previousElementSibling';

const NEXT_ELEMENT_PROP = 'nextElementSibling';
const PREV_ELEMENT_PROP = 'previousElementSibling';

/**
 * MQSelection - DOM selection methods with static methods
 *
 * Converted from class to object with static methods for better reusability
 * without instantiation. Can be used directly or via MQuery facade.
 */
export const MQuerySelection = {
  /**
   * Query for a single element matching selector
   */
  query<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E],
    query: string,
  ): MQCore<E> | null {
    const result = element.querySelector<HTMLElementInstanceMap[E]>(query);
    return result ? $(result) : null;
  },

  /**
   * Find a single element matching selector (alias for query)
   */
  find<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E],
    query: string,
  ): MQCore<E> | null {
    return MQuerySelection.query<E>(element, query);
  },

  /**
   * Find all elements matching selector
   */
  findAll<T extends Element>(element: Element, query: string): T[] {
    return Array.from(element.querySelectorAll(query));
  },

  /**
   * Get direct child matching selector
   */
  child<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E],
    query: string,
  ): MQCore<E> | null {
    return MQuerySelection.query<E>(element, `:scope > ${query}`);
  },

  /**
   * Get all direct children matching selector
   */
  children<T extends Element>(element: Element, query: string): T[] {
    return Array.from(element.querySelectorAll(`:scope > ${query}`));
  },

  /**
   * Find closest ancestor matching selector
   */
  closest<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E],
    query: string,
  ): MQCore<E> | null {
    const result = element.closest<HTMLElementInstanceMap[E]>(query);
    return result ? $(result) : null;
  },

  /**
   * Get next sibling element
   */
  next<E extends keyof HTMLElementInstanceMap = 'Element'>(
    element: HTMLElementInstanceMap[E],
    query?: string,
  ): MQCore<E> | null {
    return MQuerySelection._getSibling<E>(element, NEXT_ELEMENT_PROP, query);
  },

  /**
   * Get previous sibling element
   */
  prev<E extends keyof HTMLElementInstanceMap = 'Element'>(
    element: HTMLElementInstanceMap[E],
    query?: string,
  ): MQCore<E> | null {
    return MQuerySelection._getSibling<E>(element, PREV_ELEMENT_PROP, query);
  },

  /**
   * Get all next sibling elements
   */
  nextAll<S extends Element = Element>(element: Element, query?: string): S[] {
    return MQuerySelection._getSiblings<S>(element, NEXT_ELEMENT_PROP, query);
  },

  /**
   * Get all previous sibling elements
   */
  prevAll<S extends Element = Element>(element: Element, query?: string): S[] {
    return MQuerySelection._getSiblings<S>(element, PREV_ELEMENT_PROP, query);
  },

  /**
   * Internal: Get single sibling matching query
   */
  _getSibling<E extends keyof HTMLElementInstanceMap>(
    element: HTMLElementInstanceMap[E],
    siblingType: SiblingType,
    query?: string,
  ): MQCore<E> | null {
    let $next = element[siblingType] as HTMLElementInstanceMap[E] | null;
    if (!query) return $next ? ($($next) as MQCore<E>) : null;

    while ($next && !$next.matches(query)) {
      $next = $next[siblingType] as HTMLElementInstanceMap[E] | null;
    }

    return $next ? ($($next) as MQCore<E>) : null;
  },

  /**
   * Internal: Get all siblings matching query
   */
  _getSiblings<S extends Element>(
    element: Element,
    siblingType: SiblingType,
    query?: string,
  ): S[] {
    const result: S[] = [];
    let $next = element[siblingType];

    while ($next) {
      if (!query || $next.matches(query)) {
        result.push($next as S);
      }
      $next = $next[siblingType];
    }

    return result;
  },
};

/**
 * @deprecated Use MQSelection instead
 * Backward compatibility alias
 */
export const QuerySelection = MQuerySelection;

export default MQuerySelection;
