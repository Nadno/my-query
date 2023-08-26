import { IQueryAttribute, IQueryAttributeValue } from '../types';
import AttributeParser from '../utils/my-query/attribute-parser';

export class QueryAttribute<T extends Element> implements IQueryAttribute<T> {
  constructor(public element: T) {}

  public has(name: string): boolean;
  public has(name: string, value: IQueryAttributeValue): boolean;
  public has(name: string, value?: IQueryAttributeValue): boolean {
    let has = this.element.hasAttribute(name);
    if (has && arguments.length > 1) has = this.get(name) === value;
    return has;
  }

  public get(name: string): IQueryAttributeValue | null;
  public get<TValue>(name: string): TValue | null;
  public get<TValue>(name: string, defaultValue: TValue): TValue;
  public get(name: string, defaultValue: unknown = null): unknown {
    const value = this.element.getAttribute(name);
    if (!value) return value === null ? defaultValue : value;
    return AttributeParser.parse(value);
  }

  public set(name: string, value: IQueryAttributeValue): this {
    this.element.setAttribute(name, AttributeParser.stringify(value));
    return this;
  }

  public remove(name: string): IQueryAttributeValue | null;
  public remove<TValue>(name: string): TValue | null;
  public remove(name: string): unknown {
    const result = this.get(name);
    this.element.removeAttribute(name);
    return result;
  }

  public assign(attributes: Record<string, IQueryAttributeValue>): this {
    Object.entries(attributes).forEach(([name, value]) =>
      this.set(name, value),
    );

    return this;
  }
}
