import $ from '../main';
import { IMyQuery, IQuerySelection } from '../types';

export type SiblingType = 'nextElementSibling' | 'previousElementSibling';

const NEXT_ELEMENT_PROP = 'nextElementSibling',
  PREV_ELEMENT_PROP = 'previousElementSibling';

export class QuerySelection<T extends Element> implements IQuerySelection<T> {
  constructor(public element: T) {}

  // Base query selection methods

  public query<T extends Element>(query: string): IMyQuery<T> {
    const result = this.element.querySelector<T>(query);
    return (result && $<T>(result)) as IMyQuery<T>;
  }

  public find<T extends Element>(query: string): IMyQuery<T> | null {
    return this.query<T>(query);
  }

  public findAll<T extends Element>(query: string): T[] {
    return Array.from(this.element.querySelectorAll(query));
  }

  public child<T extends Element>(query: string): IMyQuery<T> | null {
    return this.query<T>(`:scope > ${query}`);
  }

  public children<T extends Element>(query: string): T[] {
    return Array.from(this.element.querySelectorAll(`:scope > ${query}`));
  }

  public closest<T extends Element>(query: string): IMyQuery<T> | null {
    const result = this.element.closest<T>(query);
    return result && $<T>(result);
  }

  // Sibling query selection methods

  public next<S extends Element = T>(query?: string): IMyQuery<S> | null {
    return this._getSibling<S>(NEXT_ELEMENT_PROP, query);
  }

  public prev<S extends Element = T>(query?: string): IMyQuery<S> | null {
    return this._getSibling<S>(PREV_ELEMENT_PROP, query);
  }

  private _getSibling<S extends Element>(
    siblingType: SiblingType,
    query?: string,
  ): IMyQuery<S> | null {
    let $next = this.element[siblingType] as S;
    if (!query) return $<S>($next);

    while ($next && !$next.matches(query)) {
      $next = $next[siblingType] as S;
    }

    return $<S>($next);
  }

  public nextAll<S extends Element = T>(query?: string): S[] {
    return this._getSiblings<S>(NEXT_ELEMENT_PROP, query);
  }

  public prevAll<S extends Element = T>(query?: string): S[] {
    return this._getSiblings<S>(PREV_ELEMENT_PROP, query);
  }

  private _getSiblings<S extends Element>(
    siblingType: SiblingType,
    query?: string,
  ): S[] {
    const result: S[] = [];

    let $next = this.element[siblingType];

    while ($next) {
      if (!query || $next.matches(query)) {
        result.push($next as S);
      }

      $next = $next[siblingType];
    }

    return result;
  }
}
