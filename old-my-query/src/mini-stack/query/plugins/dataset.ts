import { HTMLElementInstanceMap } from '@/html-types';
import { MQDataSet } from '../core/query-data-set';
import { MQPlugin } from '../types';

/**
 * DataSet Plugin - data-* attribute methods
 * Provides: has, get, set, remove, assign
 */
export const MQDatasetPlugin: MQPlugin = {
  name: 'MQDataset',
  install(mq) {
    mq.$extend({
      data: {
        get() {
          return {
            has: MQDataSet.has.bind(null, this.element as HTMLElement),
            get: MQDataSet.get.bind(null, this.element as HTMLElement),
            set: MQDataSet.set.bind(null, this.element as HTMLElement),
            remove: MQDataSet.remove.bind(null, this.element as HTMLElement),
            assign: MQDataSet.assign.bind(null, this.element as HTMLElement),
          };
        },
      },
    });
  },
};

declare module '../types' {
  interface MQDataSet {
    has(name: string): boolean;
    has(name: string, value: MQAttributeValue): boolean;

    get(name: string): MQAttributeValue | undefined;
    get<TValue>(name: string): TValue | undefined;
    get<TValue extends object = Record<string, any>>(
      keys: Array<keyof TValue>,
    ): TValue;
    get<TValue>(name: string, defaultValue: TValue): TValue;
    get<TValue extends object = Record<string, any>>(
      prefix: string,
      keys: Array<keyof TValue>,
    ): TValue;

    set(name: string, value: MQAttributeValue): any;

    remove(name: string): MQAttributeValue | undefined;
    remove<TValue>(name: string): TValue | undefined;
    remove<TValue extends object = Record<string, any>>(
      keys: Array<keyof TValue>,
    ): TValue;
    remove<TValue extends object = Record<string, any>>(
      prefix: string,
      keys: Array<keyof TValue>,
    ): TValue;

    assign(data: Record<string, MQAttributeValue>): any;
    assign(prefix: string, data: Record<string, MQAttributeValue>): any;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    data: MQDataSet;
  }
}

