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

export type IMyQuery<T extends Element> = IQuerySelection<T>;
