/* eslint-disable no-use-before-define */
export interface MyQueryBase<T extends Element> {
  element: T;
}

export type IQueryEventOptions = AddEventListenerOptions;

export type IQueryEventMap =
  | WindowEventMap
  | DocumentEventMap
  | HTMLElementEventMap;

export type IQueryEventKeyMap =
  | keyof WindowEventMap
  | keyof DocumentEventMap
  | keyof HTMLElementEventMap;

export interface IQueryEventHandler<T extends Window | Document | Element> {
  target: T;

  on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;

  off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
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

export interface IQueryClassList<T extends Element> extends MyQueryBase<T> {
  add(...tokens: string[]): this;
  has(token: string): boolean;
  remove(...tokens: string[]): this;
  replace(token: string, newToken: string): boolean;
  supports(token: string): boolean;
  toggle(tokens: Record<string, boolean | undefined>): this;
  toggle(token: string, force?: boolean): boolean;
}

export type IMyQuery<T extends Element> = IQuerySelection<T> &
  IQueryEventHandler<T> & {
    attribute: IQueryAttribute<T>;
    classlist: IQueryClassList<T>;
  };
