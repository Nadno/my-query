/**
 * MQueryBase - Abstract base class for both MQuery and MQueryCollection
 *
 * This class provides the common interface and properties for both single element
 * and collection modes. It enables a unified API that works seamlessly with
 * both single elements and multiple elements.
 */

import { Type } from '@/mini-stack/primitives';
import { MQPlugin } from './types';
import getElement from '@/utils/getElement';
import { HTMLElementInstanceMap } from '@/html-types';
import { MQCore, MQFunction } from '../types';
// import { MQCore } from '../types';

const extend = <T extends object>(
  target: T,
  sources: Record<string, any>[],
  handleValue?: (value: any) => any,
) => {
  for (const source of sources) {
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

      const value = handleValue ? handleValue(source[key]) : source[key],
        isGetter = Type.isObject(value);

      const descriptor = {
        ...(isGetter ? { ...value } : { value, writable: false }),

        enumerable: true,
        configurable: true,
      };

      Object.defineProperty(target, key, descriptor);
    }
  }
};

export const MiniQuery: MQFunction = Object.assign(
  function MiniQuery<E extends keyof HTMLElementInstanceMap = 'Element'>(
    queryOrElement: string | HTMLElementInstanceMap[E] | MQCore<E>,
  ): any {
    return (MiniQuery as MQFunction).fn(queryOrElement);
  },
  {
    $extend<TProto extends object = MQCore<'Element'>>(
      ...args: (Record<string, any> & ThisType<TProto>)[]
    ) {
      extend(MQ.prototype, args);
    },

    $static(...args: Record<string, any>[]) {
      extend(MiniQuery, args);
    },

    fn<E extends keyof HTMLElementInstanceMap = 'Element'>(
      queryOrElement: string | HTMLElementInstanceMap[E] | MQCore<E>,
    ): any {
      const element =
        typeof queryOrElement === 'string'
          ? getElement(queryOrElement)
          : (queryOrElement as Element);

      if (element == null) return null;
      // @ts-ignore
      return new MQ<E>(element as HTMLElementInstanceMap[E]);
    },

    getElement<E extends keyof HTMLElementInstanceMap>(
      elementOrSelector: string | HTMLElementInstanceMap[E] | MQCore<E>,
    ): HTMLElementInstanceMap[E] | null {
      return typeof elementOrSelector === 'string'
        ? document.querySelector<HTMLElementInstanceMap[E]>(elementOrSelector)
        : MiniQuery.elementFrom(elementOrSelector);
    },

    elementFrom<E extends keyof HTMLElementInstanceMap>(
      element: HTMLElementInstanceMap[E] | MQCore<E> | Element,
    ): HTMLElementInstanceMap[E] {
      if (MiniQuery.isMQInstance<E>(element)) return element.element;
      return element as HTMLElementInstanceMap[E];
    },

    isMQInstance<E extends keyof HTMLElementInstanceMap>(
      element: any,
    ): element is MQCore<E> {
      return !!element && element instanceof MQ;
    },

    use(plugin: MQPlugin, options?: any) {
      plugin.install(MiniQuery, options);
    },
  },
);

// @ts-ignore
class MQ<E extends keyof HTMLElementInstanceMap = 'Element'>
  implements MQCore<E>
{
  constructor(public element: HTMLElementInstanceMap[E]) {
    this.element = element;
  }
}

export default MQ as unknown as new <
  E extends keyof HTMLElementInstanceMap = 'Element',
>(
  element: HTMLElementInstanceMap[E],
) => MQCore<E>;

