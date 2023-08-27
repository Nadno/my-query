import { IQueryClassList } from '../types';

export class QueryClassList<T extends Element> implements IQueryClassList<T> {
  constructor(public element: T) {}

  public add(...tokens: string[]): this {
    this.element.classList.add(...tokens);
    return this;
  }

  public has(token: string): boolean {
    return this.element.classList.contains(token);
  }

  public remove(...tokens: string[]): this {
    this.element.classList.remove(...tokens);
    return this;
  }

  public replace(token: string, newToken: string): boolean {
    return this.element.classList.replace(token, newToken);
  }

  public supports(token: string): boolean {
    return this.element.classList.supports(token);
  }

  public toggle(token: string, force?: boolean | undefined): boolean;
  public toggle(tokens: Record<string, boolean | undefined>): this;
  public toggle(...args: unknown[]): boolean | this {
    const isTokens = args.length === 1 && typeof args[0] === 'object';
    if (!isTokens)
      return this.element.classList.toggle(
        ...(args as [string, boolean | undefined]),
      );

    const [tokens] = args as [Record<string, boolean | undefined>];
    Object.entries(tokens).forEach(([token, shouldForce]) =>
      this.element.classList.toggle(token, !!shouldForce),
    );

    return this;
  }
}
