export * from './get';

export interface MyQueryUtils {
  get<T extends Element>(query: string): T | null;
}
