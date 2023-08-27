import { IQueryAttributeValue } from '../../types';

export * from './get';
export * from '../defer';

export interface MyQueryUtils {
  get<T extends Element>(query: string): T | null;
  defer(callback: AnyFunction): void;
  parseAttribute<TExpected extends IQueryAttributeValue>(
    value: string,
  ): TExpected;
  stringifyAttribute(value: IQueryAttributeValue): string;
}
