/* eslint-disable no-use-before-define */
export interface MyQueryBase<T extends Element> {
  element: T;
}

export interface IQuerySelection<T extends Element> extends MyQueryBase<T> {
  query<T extends Element>(query: string): IMyQuery<T>;
  find<T extends Element>(query: string): IMyQuery<T> | null;
  findAll<T extends Element>(query: string): T[];
  child<T extends Element>(query: string): IMyQuery<T> | null;
  children<T extends Element>(query: string): T[];
  closest<T extends Element>(query: string): IMyQuery<T> | null;
  next<S extends Element = T>(query?: string): IMyQuery<S> | null;
  prev<S extends Element = T>(query?: string): IMyQuery<S> | null;
  nextAll<S extends Element = T>(query?: string): S[];
  prevAll<S extends Element = T>(query?: string): S[];
}

export type IQueryAttributeValue = string | boolean | number;

export interface IQueryAttribute<T extends Element> extends MyQueryBase<T> {
  has(name: string): boolean;
  has(name: string, value: IQueryAttributeValue): boolean;
  get(name: string): IQueryAttributeValue | null;
  get<TValue>(name: string): TValue | null;
  get<TValue>(name: string, defaultValue: TValue): TValue;
  set(name: string, value: IQueryAttributeValue): this;
  remove(name: string): IQueryAttributeValue | null;
  remove<TValue>(name: string): TValue | null;
  assign(attributes: Record<string, IQueryAttributeValue>): this;
}

export type IMyQuery<T extends Element> = {
  attribute: IQueryAttribute<T>;
} & IQuerySelection<T>;
