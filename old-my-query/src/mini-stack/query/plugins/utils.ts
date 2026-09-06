import { HTMLElementInstanceMap } from '@/html-types';
import { MQUtils } from '../core/query-utils';
import { MQPlugin } from '../types';
import { createPlugin } from './_create';

/**
 * Utils Plugin - DOM utility methods
 * Provides: is, matches, hasFocus, contains
 */
export const MQUtilsPlugin: MQPlugin = createPlugin('utils', MQUtils);

declare module '../types' {
  interface MQUtils<T extends keyof HTMLElementInstanceMap> {
    is(selectors: Array<string | Element | null>): boolean;
    is(element: Element | null): boolean;
    is(selector: string): boolean;

    matches(selector: string): boolean;
    matches(selectors: string[]): boolean;

    hasFocus(): boolean;
    contains(node: null | Node): boolean;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    is(selectors: Array<string | Element | null>): boolean;
    is(element: Element | null): boolean;
    is(selector: string): boolean;

    matches(selector: string): boolean;
    matches(selectors: string[]): boolean;

    hasFocus(): boolean;
    contains(node: null | Node): boolean;
  }
}
