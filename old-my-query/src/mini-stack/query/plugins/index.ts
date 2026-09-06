/**
 * MQuery Plugin System
 *
 * This module exports individual plugins that can be used with MQuery.use()
 * to extend the functionality of the MQuery class.
 *
 * @example
 * import MQuery from './mini-stack/query';
 * import { selectionPlugin, mutationPlugin } from './mini-stack/query/plugins';
 *
 * MQuery.use(selectionPlugin);
 * MQuery.use(mutationPlugin);
 */

// Import modular plugins
export { MQAttributePlugin } from './attribute';
export { MQSelectionPlugin } from './selection';
export { MQMutationPlugin } from './mutation';
export { MQEventPlugin } from './event';
export { MQClasslistPlugin } from './classlist';
export { MQDatasetPlugin } from './dataset';
export { MQUtilsPlugin } from './utils';

// Import binder plugin
export { MQSignalBinderPlugin, Binder } from './binder';

// Import core modules for collection plugin
import { MQueryCollection } from '../core/query-collection';
import { MQPlugin } from '../types';
import { MQAttributePlugin } from './attribute';
import { MQClasslistPlugin } from './classlist';
import { MQDatasetPlugin } from './dataset';
import { MQMutationPlugin } from './mutation';
import { MQSelectionPlugin } from './selection';

/**
 * Collection Plugin - MQueryCollection support
 * Provides: MQueryCollection class for handling multiple elements
 */
export const MQCollectionPlugin: MQPlugin = {
  name: 'MQCollection',
  install(mq) {
    const mqProto = mq.prototype as any;

    mqProto._findAll = mqProto.findAll;
    mqProto._children = mqProto.children;
    mqProto._nextAll = mqProto.nextAll;
    mqProto._prevAll = mqProto.prevAll;

    mq.$static({
      Collection: MQueryCollection,
      all(selector: string) {
        return new MQueryCollection(document.querySelectorAll(selector));
      },
    });

    mq.$extend({
      findAll(...args: any[]) {
        return new MQueryCollection(mqProto._findAll.apply(this, args));
      },
      children(...args: any[]) {
        return new MQueryCollection(mqProto._children.apply(this, args));
      },
      nextAll(...args: any[]) {
        return new MQueryCollection(mqProto._nextAll.apply(this, args));
      },
      prevAll(...args: any[]) {
        return new MQueryCollection(mqProto._prevAll.apply(this, args));
      },
    });
  },
};

/**
 * Standard Plugin Bundle - Selection + Mutation + Attribute
 * Use this for the most common use cases
 */
export const MQCorePlugin: MQPlugin = {
  name: 'MQCore',
  dependencies: [],
  async install(mq: any) {
    MQSelectionPlugin.install(mq);
    MQMutationPlugin.install(mq);
    MQAttributePlugin.install(mq);
    MQClasslistPlugin.install(mq);
    MQDatasetPlugin.install(mq);
  },
};

/**
 * Full Plugin Bundle - All core plugins
 * Use this when you need all features
 */
export const MQFullPlugin: MQPlugin = {
  name: 'MQFull',
  dependencies: [],
  async install(mq: any) {
    MQCorePlugin.install(mq);
    const { MQEventPlugin } = await import('./event');
    MQEventPlugin.install(mq);
    MQCollectionPlugin.install(mq);
  },
};

// Re-export MQPlugin type
export type { MQPlugin } from '../types';

