import { MiniQuery as $ } from './base';
import { MQUtils } from './query-utils';
import { MQCore } from '@/types';
import { HTMLElementInstanceMap } from '@/html-types';

export class MQueryCollection<
  E extends keyof HTMLElementInstanceMap = 'HTMLElement',
> {
  /**
   * Whether this is a collection (always true for MQueryCollection)
   */
  public readonly hasMany = true;

  /**
   * Array of all elements in the collection
   */
  public readonly $elements:
    | HTMLElementInstanceMap[E][]
    | NodeListOf<HTMLElementInstanceMap[E]>;

  constructor(
    elements:
      | HTMLElementInstanceMap[E][]
      | NodeListOf<HTMLElementInstanceMap[E]>,
    clone = false,
  ) {
    this.$elements = clone ? [...elements] : elements;
  }

  get $first(): HTMLElementInstanceMap[E] | null {
    return this.$elements[0] ?? null;
  }

  get $last(): HTMLElementInstanceMap[E] | null {
    return this.$elements[this.$elements.length - 1] ?? null;
  }

  get length(): number {
    return this.$elements.length;
  }

  at(index: number): MQCore<E> | null {
    const el = this.$elements[index];
    return el ?  $<E>(el) : null;
  }

  each(callback: (el: MQCore<E>, index: number) => void): this {
    for (let index = 0; index < this.$elements.length; index++)
      callback( $<E>(this.$elements[index]), index);

    return this;
  }

  map<R>(callback: (el: MQCore<E>, index: number) => R): R[] {
    const result = Array(this.$elements.length);

    for (let index = 0; index < this.$elements.length; index++)
      result[index] = callback(
        new $<E>(this.$elements[index]),
        index,
      );

    return result;
  }

  filter(
    predicate: (el: MQCore<E>, index: number) => boolean,
  ): MQueryCollection<E> {
    const result = [];
    for (let index = 0; index < this.$elements.length; index++)
      if (predicate(new $<E>(this.$elements[index]), index))
        result.push(this.$elements[index]);

    return new MQueryCollection<E>(result);
  }

  /**
   * Remove elementos da coleção atual que correspondam ao seletor ou nó passado.
   */
  not(selectorOrNode: string | Node): MQueryCollection<E> {
    const isSelector = typeof selectorOrNode === 'string';
    return this.filter(($) => {
      const node = $.element;
      if (!node) return true; // Mantém se por acaso for nulo

      if (isSelector) {
        return !(node instanceof Element && node.matches(selectorOrNode));
      } else {
        return node !== selectorOrNode;
      }
    });
  }

  find(callback: (el: E, index: number) => boolean): MQCore<E> | null {
    for (let index = 0; index < this.$elements.length; index)
      if (callback(this.$elements[index], index))
        return new $<E>(this.$elements[index]);
    return null;
  }

  toArray(): E[] {
    return [...this.$elements];
  }

  *[Symbol.iterator](): Generator<MQCore<E>> {
    for (const el of this.$elements) {
      yield new $<E>(el);
    }
  }

  query<S extends Element>(selector: string): MQCore<S>[] | null {
    return this.map(($) => $.query<S>(selector)).flat();
  }

  findAll<S extends Element>(selector: string): MQueryCollection<S> {
    return new MQueryCollection<S>(
      this.map(($) => $.findAll<S>(selector)).flat(),
    );
  }

  child<S extends Element>(selector: string): MQCore<S>[] {
    return this.map(($) => $.child<S>(selector)).filter(
      ($child) => $child != null,
    );
  }

  children<S extends Element>(selector: string): MQueryCollection<S> {
    return new MQueryCollection<S>(
      this.map(($) => $.children<S>(selector)).flat(),
    );
  }

  clearAll(): this {
    return this.each(($) => $.clear());
  }

  removeAll(): this {
    return this.each(($) => $.remove());
  }

  on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: any,
  ): this {
    this.each(($) => $.on(event, handler, options));
    return this;
  }

  off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: any,
  ): this {
    this.each(($) => $.off(event, handler, options));
    return this;
  }

  $on(
    declarations: [string, ...any[]],
    handler: (e: Event) => void,
    options?: any,
  ): this {
    this.each(($) => $.$on(declarations, handler, options));
    return this;
  }

  $off(
    declarations: [string, ...any[]],
    handler: (e: Event) => void,
    options?: any,
  ): this {
    this.each(($) => $.$off(declarations, handler, options));
    return this;
  }

  hasFocus(): boolean {
    for (let index = 0; index < this.$elements.length; index++)
      if (MQUtils.hasFocus(this.$elements[index])) return true;
    return false;
  }

  containsFocus(): boolean {
    for (let index = 0; index < this.$elements.length; index++)
      if (MQUtils.hasFocus(this.$elements[index])) return true;
    return false;
  }

  contains(node: Node | null): boolean {
    for (let index = 0; index < this.$elements.length; index++)
      if (MQUtils.contains(this.$elements[index], node)) return true;
    return false;
  }
}

export default MQueryCollection;

