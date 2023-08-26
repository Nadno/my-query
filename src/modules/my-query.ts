import { Mixin } from 'ts-mixer';
import { IMyQuery } from '../types';

import { QuerySelection } from './query-selection';
import { QueryAttribute } from './query-attribute';

export default class MyQuery<T extends Element>
  extends Mixin(QuerySelection)
  implements IMyQuery<T>
{
  constructor(public element: T) {
    super(element);
  }

  public get attribute() {
    return new QueryAttribute(this.element);
  }
}
