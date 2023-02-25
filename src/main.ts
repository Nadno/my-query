import MyQueryClass from './modules/my-query';

import getElement from './utils/getElement';
import * as myQueryUtils from './utils/my-query';
import type { MyQueryUtils } from './utils/my-query';

declare interface MyQuery extends MyQueryUtils {
  <T extends Element>(query: string): MyQueryClass<T>;
  <T extends Element>(element: T): MyQueryClass<T>;
}

const myQuery = function myQuery(queryOrElement: unknown): unknown {
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
