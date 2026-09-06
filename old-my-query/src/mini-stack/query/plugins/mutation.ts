import { HTMLElementInstanceMap } from '@/html-types';
import { MQueryMutation } from '../core/query-mutation';
import { MQPlugin } from '../types';
import { createPlugin } from './_create';

/**
 * Mutation Plugin - DOM manipulation methods
 * Provides: html, text, replace, swap, before, prepend, append, after, remove, clear, etc.
 */
export const MQMutationPlugin: MQPlugin = createPlugin(
  'MQMutation',
  MQueryMutation,
);

declare module '../types' {
  interface MQManipulation<T extends keyof HTMLElementInstanceMap> {
    html(raw: string): any;
    html(): string;

    text(text: string): any;
    text(): string;

    replace(newElement: Element | any): any;
    replace(selector: string): any;
    swap(element: Element | any): any;
    swap(selector: string): any;

    before(...elements: Array<string | Element | any>): any;
    prepend(...elements: Array<string | Element | any>): any;
    append(...elements: Array<string | Element | any>): any;
    after(...elements: Array<string | Element | any>): any;

    beforeHTML(...raws: string[]): any;
    prependHTML(...raws: string[]): any;
    appendHTML(...raws: string[]): any;
    afterHTML(...raws: string[]): any;

    beforeText(...texts: string[]): any;
    prependText(...texts: string[]): any;
    appendText(...texts: string[]): any;
    afterText(...texts: string[]): any;

    beforeElement(...elements: Array<Element | any>): any;
    appendElement(...elements: Array<Element | any>): any;
    prependElement(...elements: Array<Element | any>): any;
    afterElement(...elements: Array<Element | any>): any;

    clear(): any;
    remove(): any;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    html(raw: string): any;
    html(): string;

    text(text: string): any;
    text(): string;

    replace(newElement: Element | any): any;
    replace(selector: string): any;
    swap(element: Element | any): any;
    swap(selector: string): any;

    before(...elements: Array<string | Element | any>): any;
    prepend(...elements: Array<string | Element | any>): any;
    append(...elements: Array<string | Element | any>): any;
    after(...elements: Array<string | Element | any>): any;

    beforeHTML(...raws: string[]): any;
    prependHTML(...raws: string[]): any;
    appendHTML(...raws: string[]): any;
    afterHTML(...raws: string[]): any;

    beforeText(...texts: string[]): any;
    prependText(...texts: string[]): any;
    appendText(...texts: string[]): any;
    afterText(...texts: string[]): any;

    beforeElement(...elements: Array<Element | any>): any;
    appendElement(...elements: Array<Element | any>): any;
    prependElement(...elements: Array<Element | any>): any;
    afterElement(...elements: Array<Element | any>): any;

    clear(): any;
    remove(): any;
  }
}
