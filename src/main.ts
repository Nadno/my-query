import MyQueryClass from './mini-stack/query';

import getElement from './utils/getElement';
import * as myQueryUtils from './utils/my-query';
import type { MyQueryUtils } from './utils/my-query';

import { IMyQuery, IQueryEventHandler } from './types';
import { QueryEventHandler } from './mini-stack/query/event-handler';
import { createTagFactories, cx } from './mini-stack/query/builder';
import type {
  HtmlTagName,
  TagElement,
  HtmlTagTypeMap,
} from './mini-stack/query/tags';
import { style } from './mini-stack/query/style';

type MyQueryBuilder = {
  [Key in keyof HtmlTagTypeMap]: (...args: any[]) => TagElement<Key>;
};

declare interface MyQuery extends MyQueryUtils, MyQueryBuilder {
  <T extends Window | Document>(target: T): IQueryEventHandler<T>;
  <T extends Element>(query: string): IMyQuery<T>;
  <T extends Element>(element: T): IMyQuery<T>;
}

const myQuery = function myQuery(queryOrElement: unknown): unknown {
  if (
    queryOrElement &&
    (queryOrElement === window || queryOrElement === document)
  )
    return new QueryEventHandler(queryOrElement as Window | Document);

  const element =
    typeof queryOrElement === 'string'
      ? getElement(queryOrElement)
      : (queryOrElement as Element);

  if (element == null) return null;
  return new MyQueryClass(element);
} as MyQuery;
createTagFactories(myQuery);
Object.assign(myQuery, myQueryUtils, {
  style,
  cx,
});

// Re-export type definitions
export type { HtmlTagName, TagElement, HtmlTagTypeMap };

export { MyQueryClass as MyQuery };
export default myQuery;
