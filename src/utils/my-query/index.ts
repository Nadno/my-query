import { IQueryAttributeValue } from '../../types';

export * from './get';

export interface MyQueryUtils {
  get<T extends Element>(query: string): T | null;
  parseAttribute<TExpected extends IQueryAttributeValue>(
    value: string,
  ): TExpected;
  stringifyAttribute(value: IQueryAttributeValue): string;
}
