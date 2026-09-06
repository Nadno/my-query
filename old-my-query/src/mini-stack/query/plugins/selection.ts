import { HTMLElementInstanceMap } from '@/html-types';
import { MQuerySelection } from '../core/query-selection';
import { MQPlugin } from '../types';
import { createPlugin } from './_create';

/**
 * Selection Plugin - DOM selection methods
 * Provides: query, find, findAll, child, children, closest, next, prev, nextAll, prevAll
 */
export const MQSelectionPlugin: MQPlugin = createPlugin(
  'MQSelection',
  MQuerySelection,
);

declare module '../types' {
  interface MQSelection<E extends keyof HTMLElementInstanceMap> {
    query<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): MQCore<T>;
    find<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): MQCore<T> | null;
    findAll<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): HTMLElementInstanceMap[T][];
    child<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): MQCore<T> | null;
    children<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): HTMLElementInstanceMap[T][];
    closest<T extends keyof HTMLElementInstanceMap>(
      query: string,
    ): MQCore<T> | null;
    next<S extends keyof HTMLElementInstanceMap = E>(
      query?: string,
    ): MQCore<S> | null;
    prev<S extends keyof HTMLElementInstanceMap = E>(
      query?: string,
    ): MQCore<S> | null;
    nextAll<S extends keyof HTMLElementInstanceMap = E>(query?: string): S[];
    prevAll<S extends keyof HTMLElementInstanceMap = E>(query?: string): S[];
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap>
    extends MQSelection<E> {}
}

