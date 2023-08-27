import MyQueryClass from './modules/my-query';

import getElement from './utils/getElement';
import * as myQueryUtils from './utils/my-query';
import type { MyQueryUtils } from './utils/my-query';

import { IMyQuery, IQueryEventHandler } from './types';
import { QueryEventHandler } from './modules/query-event-handler';

declare interface MyQuery extends MyQueryUtils {
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

Object.assign(myQuery, myQueryUtils);

export { MyQueryClass as MyQuery };
export default myQuery;
