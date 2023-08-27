import { Mixin } from 'ts-mixer';
import { IMyQuery, MyQueryBase } from '../types';

import { QuerySelection } from './query-selection';
import { QueryAttribute } from './query-attribute';
import { QueryEventHandler } from './query-event-handler';
import { QueryClassList } from './query-class-list';
import { QueryDataSet } from './query-data-set';
import { QueryManipulation } from './query-manipulation';

export default class MyQuery<T extends Element>
  extends Mixin(QuerySelection, QueryEventHandler, QueryManipulation)
  implements IMyQuery<T>
{
  public static getElement<TElement extends Element>(
    elementOrSelector: string | TElement | MyQueryBase<TElement>,
  ): TElement | null {
    return typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : MyQuery.elementFrom(elementOrSelector);
  }

  public static elementFrom<TElement extends Element>(
    element: TElement | MyQueryBase<TElement>,
  ): TElement {
    if (MyQuery.isMyQuery<TElement>(element)) return element.element;
    return element as TElement;
  }

  public static isMyQuery<TElement extends Element>(
    element: any,
  ): element is MyQuery<TElement> {
    return !!element && element instanceof MyQuery;
  }

  constructor(public element: T) {
    super(element);
  }

  public get attribute() {
    return new QueryAttribute(this.element);
  }

  public get classlist() {
    return new QueryClassList(this.element);
  }

  public get data(): any {
    if (this.element instanceof HTMLElement)
      return new QueryDataSet(this.element);
  }
}
