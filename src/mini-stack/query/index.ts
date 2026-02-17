import { Mixin } from 'ts-mixer';
import { IMyQuery, MyQueryBase } from '../../types';

import { QuerySelection } from './core/query-selection';
import { QueryAttribute } from './core/query-attribute';
import { QueryEventHandler } from './event-handler';
import { QueryClassList } from './core/query-class-list';
import { QueryDataSet } from './core/query-data-set';
import { QueryMutation } from './core/query-mutation';
import { QueryUtils } from './core/query-utils';
import { QueryDirective } from './directives/query-directive';

// Import built-in directives to register them
import './directives/builtin/show';
import './directives/builtin/trap-focus';
import './directives/builtin/overlay';
import './directives/builtin/roving-index';
import './directives/builtin/inert';
import './directives/builtin/if';
import './directives/builtin/model';

export default class MQuery<T extends Element>
  extends Mixin(
    QuerySelection,
    QueryEventHandler,
    QueryMutation,
    QueryUtils,
    QueryDirective,
  )
  implements IMyQuery<T>
{
  public static getElement<TElement extends Element>(
    elementOrSelector: string | TElement | MyQueryBase<TElement>,
  ): TElement | null {
    return typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : MQuery.elementFrom(elementOrSelector);
  }

  public static elementFrom<TElement extends Element>(
    element: TElement | MyQueryBase<TElement>,
  ): TElement {
    if (MQuery.isMyQuery<TElement>(element)) return element.element;
    return element as TElement;
  }

  public static isMyQuery<TElement extends Element>(
    element: any,
  ): element is MQuery<TElement> {
    return !!element && element instanceof MQuery;
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
