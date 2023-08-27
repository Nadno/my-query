import { IQueryAttributeValue, IQueryDataSet } from 'src/types';
import AttributeParser from '../utils/my-query/attribute-parser';

export class QueryDataSet<T extends HTMLElement> implements IQueryDataSet<T> {
  constructor(public element: T) {}

  public has(name: string): boolean;
  public has(name: string, value: IQueryAttributeValue): boolean;
  public has(name: string, value?: IQueryAttributeValue): boolean {
    const result = Object.hasOwn(this.element.dataset, name);
    if (result && arguments.length > 1) return this.get(name) === value;
    return result;
  }

  public get(name: string): IQueryAttributeValue | undefined;
  public get<TValue>(name: string): TValue | undefined;
  public get<TValue extends object = Record<string, any>>(
    keys: Array<keyof TValue>,
  ): TValue;
  public get<TValue extends object = Record<string, any>>(
    prefix: string,
    keys: Array<keyof TValue>,
  ): TValue;
  public get<TValue>(name: string, defaultValue: TValue): TValue;
  public get(...args: unknown[]): IQueryAttributeValue | object | undefined {
    const isFirstString = typeof args[0] === 'string',
      isSingleItem = isFirstString && !Array.isArray(args[1]);

    if (isSingleItem) {
      const [name, defaultValue] = args as [string, any];
      const result = this.element.dataset[name];
      if (result == null) return defaultValue;
      return AttributeParser.parse(result);
    }

    const [prefix, keys] = (isFirstString ? args : ['', args[0]]) as [
      string,
      Array<string>,
    ];

    return keys.reduce((result, key) => {
      const name = this._concatPrefixToKey(prefix, key),
        value = this.element.dataset[name];

      if (this.has(name)) result[key] = AttributeParser.parse(value as string);

      return result;
    }, {} as Record<string, any>);
  }

  public set(name: string, value: IQueryAttributeValue): this {
    this.element.dataset[name] = AttributeParser.stringify(value);
    return this;
  }

  public remove(name: string): IQueryAttributeValue | undefined;
  public remove<TValue>(name: string): TValue | undefined;
  public remove<TValue extends object = Record<string, any>>(
    keys: Array<keyof TValue>,
  ): TValue;
  public remove<TValue extends object = Record<string, any>>(
    prefix: string,
    keys: Array<keyof TValue>,
  ): TValue;
  public remove<TValue>(
    ...args: unknown[]
  ): TValue | IQueryAttributeValue | undefined {
    const isFirstString = typeof args[0] === 'string',
      isSingleItem = args.length === 1 && isFirstString;

    if (isSingleItem) {
      const [name] = args as [string];
      const result = this.get<TValue>(name);
      delete this.element.dataset[name];
      return result;
    }

    const [prefix, keys] = (isFirstString ? args : ['', args[0]]) as [
      string,
      string[],
    ];

    const result = this.get<TValue>(prefix, keys as any);

    keys.forEach(
      (key) =>
        delete this.element.dataset[this._concatPrefixToKey(prefix, key)],
    );

    return result;
  }

  public assign(
    prefix: string,
    data: Record<string, IQueryAttributeValue>,
  ): this;
  public assign(data: Record<string, IQueryAttributeValue>): this;
  public assign(...args: unknown[]): this {
    const hasPrefix = args.length > 1 && typeof args[0] === 'string';
    if (!hasPrefix) {
      const [data] = args as [Record<string, IQueryAttributeValue>];
      Object.entries(data).forEach(([key, value]) => this.set(key, value));
      return this;
    }

    const [prefix, data] = args as [
      string,
      Record<string, IQueryAttributeValue>,
    ];

    Object.entries(data).forEach(([key, value]) =>
      this.set(this._concatPrefixToKey(prefix, key), value),
    );

    return this;
  }

  private _concatPrefixToKey(prefix: string, key: string) {
    if (!prefix) return key;
    return prefix + key.substring(0, 1).toUpperCase() + key.substring(1);
  }
}
