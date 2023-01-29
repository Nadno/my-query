import MyQueryClass from './modules/my-query';

import getElement from './utils/getElement';

declare interface MyQuery {
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

export { MyQueryClass as MyQuery };
export default myQuery;
