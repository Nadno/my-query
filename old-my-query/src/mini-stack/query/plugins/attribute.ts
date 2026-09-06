import {
  HTMLAttributesOf,
  HTMLElementInstanceMap,
  HTMLElementToAttributesMap,
} from '@/html-types';
import MQueryAttribute from '../core/query-attribute';
import { MQPlugin } from '../types';

/**
 * Attribute Plugin - DOM attribute methods
 * Provides: has, get, set, remove, assign
 */

export const MQAttributePlugin: MQPlugin = {
  name: 'MQAttribute',
  install(mq) {
    mq.$extend({
      attr: {
        get() {
          return {
            has: MQueryAttribute.has.bind(null, this.element as HTMLElement),
            get: MQueryAttribute.get.bind(null, this.element as HTMLElement),
            set: MQueryAttribute.set.bind(null, this.element as HTMLElement),
            remove: MQueryAttribute.remove.bind(
              null,
              this.element as HTMLElement,
            ),
            assign: MQueryAttribute.assign.bind(
              null,
              this.element as HTMLElement,
            ),
          };
        },
      },
    });

    console.log('***MQAttributePlugin installed***')
  },
};

declare module '../types' {
  interface MQAttribute<TAttribute> {
    has(name: keyof TAttribute | (string & {})): boolean;
    has<K extends keyof TAttribute>(
      name: K | (string & {}),
      value: TAttribute[K],
    ): boolean;
    get<K extends keyof TAttribute>(
      name: K | (string & {}),
    ): TAttribute[K] | null;
    get<TValue>(name: keyof TAttribute | (string & {})): TValue | null;
    get<TValue>(
      name: keyof TAttribute | (string & {}),
      defaultValue: TValue,
    ): TValue;
    set<K extends keyof TAttribute>(name: K | (string & {}), value: TAttribute[K]): this;
    remove(name: string): MQAttributeValue | null;
    remove<TValue>(name: string): TValue | null;
    assign(attributes: TAttribute & Record<string, any>): this;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    attr: MQAttribute<HTMLAttributesOf<E>>;
  }
}

