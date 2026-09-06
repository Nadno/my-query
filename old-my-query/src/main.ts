import MiniQuery from './mini-stack/query';

import getElement from './utils/getElement';
import * as myQueryUtils from './utils/my-query';
import type { MyQueryUtils } from './utils/my-query';

import { MQCore, MQEventHandler } from './types';
import { MQEvent } from './mini-stack/query/event-handler';
import { createTagFactories, cx } from './mini-stack/query/builder';
import type {
  HtmlTagName,
  TagElement,
  HtmlTagTypeMap,
} from './mini-stack/query/tags';
import { style } from './mini-stack/query/style';

// Plugin system interfaces
export interface MQPlugin {
  name: string;
  install: (mq: any) => void;
  dependencies?: string[];
}

type MyQueryBuilder = {
  [Key in keyof HtmlTagTypeMap]: (...args: any[]) => TagElement<Key>;
};

declare interface MyQuery extends MyQueryUtils, MyQueryBuilder {
  <T extends Window | Document>(target: T): MQEventHandler<T>;
  <T extends Element>(query: string): MQCore<T>;
  <T extends Element>(element: T): MQCore<T>;

  // Plugin system
  use(plugin: MQPlugin): typeof miniQuery;
  unuse(pluginName: string): typeof miniQuery;
}

const miniQuery = Object.assign(
  function miniQuery(queryOrElement: unknown): unknown {
    if (
      queryOrElement &&
      (queryOrElement === window || queryOrElement === document)
    )
      return new MQEvent(queryOrElement as Window | Document);

    const element =
      typeof queryOrElement === 'string'
        ? getElement(queryOrElement)
        : (queryOrElement as Element);

    if (element == null) return null;
    return new MiniQuery(element);
  } as MyQuery,
  MiniQuery,
);

createTagFactories(miniQuery);
Object.assign(miniQuery, myQueryUtils, {
  style,
  cx,
});

// Re-export type definitions
export type { HtmlTagName, TagElement, HtmlTagTypeMap };

export default MiniQuery;
