import { IQueryUtils } from 'src/types';

export class QueryUtils<T extends Element> implements IQueryUtils<T> {
  constructor(public element: T) {}

  public is(selectors: Array<string | Element | null>): boolean;
  public is(element?: Element | null): boolean;
  public is(selector: string): boolean;
  public is(
    selectors?: string | Element | null | Array<string | Element | null>,
  ): boolean {
    if (Array.isArray(selectors))
      return selectors.some((selector) => {
        if (typeof selector !== 'string') return this.element === selector;
        return this.element.matches(selector);
      });

    if (typeof selectors !== 'string') return this.element === selectors;
    return this.matches(selectors as string);
  }

  public matches(selector: string): boolean;
  public matches(selectors: string[]): boolean;
  public matches(selectors: string | string[]): boolean {
    if (Array.isArray(selectors)) selectors = selectors.join(', ');
    return this.element.matches(selectors);
  }

  public hasFocus(): boolean {
    return this.element === document.activeElement;
  }

  public contains(node: Node | null): boolean {
    return this.element.contains(node);
  }
}
