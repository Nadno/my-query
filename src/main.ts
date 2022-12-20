import MyQuery from './modules/my-query';
import getElement from './utils/getElement';

function myQuery<T extends Element>(query: string): MyQuery<T> | null;
function myQuery<T extends Element>(element: T): MyQuery<T>;
function myQuery(queryOrElement: any): any {
  const element =
    typeof queryOrElement === 'string'
      ? getElement(queryOrElement)
      : (queryOrElement as Element);

  if (element == null) return null;
  return new MyQuery(element);
}

export default myQuery;
