import { Type } from '@/mini-stack/primitives';
import { MQPlugin } from '../types';

/**
 * Factory function to create a plugin from source objects
 *
 * @param sources - Objects containing methods to add to MQuery prototype
 * @returns MQPlugin instance
 */
export const createPlugin = (
  name: string,
  ...sources: Record<string, any>[]
): MQPlugin => ({
  name,
  install(mq) {
    for (const source of sources) {
      for (const key in source) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

        const isFunction = Type.isFunction(source[key]);
        const value = isFunction
          ? function (this: any, ...args: any[]) {
              return source[key as keyof typeof source](this.element, ...args);
            }
          : source[key];

        Object.defineProperty(mq.prototype, key, {
          value,
          writable: false,
          enumerable: !isFunction,
          configurable: true,
        });
      }
    }
  },
});