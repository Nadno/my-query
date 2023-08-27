import {
  IQueryEventHandler,
  IQueryEventKeyMap,
  IQueryEventOptions,
} from '../types';

export type DelegatedEventHandlerOptions = IQueryEventOptions;

export type DelegatedEventHandler = AnyFunction;

export type DelegatedEventHandlerTargets = Map<
  string,
  DelegatedEventHandlerOptions | undefined
>;

export type StoredDelegatedEventHandler = Map<string, DelegatedEventHandler>;

export class QueryDelegatedEventHandler<T extends Window | Document | Element> {
  private static readonly DelegatedEventHandlers: Map<
    DelegatedEventHandler,
    StoredDelegatedEventHandler
  > = new Map();

  constructor(public target: T) {}

  private _removeDelegated(
    target: string,
    key: AnyFunction,
    options?: DelegatedEventHandlerOptions,
  ): DelegatedEventHandler | undefined {
    const targetKey = this._createTargetKey(target, options);

    const delegated =
      QueryDelegatedEventHandler.DelegatedEventHandlers.get(key);
    if (!delegated || !delegated.has(targetKey)) return;

    const result = delegated.get(targetKey);
    delegated.delete(targetKey);

    if (delegated.size === 0)
      QueryDelegatedEventHandler.DelegatedEventHandlers.delete(key);

    return result;
  }

  private _addDelegated(
    target: string,
    key: AnyFunction,
    handler: DelegatedEventHandler,
    options?: DelegatedEventHandlerOptions,
  ): DelegatedEventHandler {
    const targetKey = this._createTargetKey(target, options);

    if (this._isDelegated(key)) {
      const delegated = QueryDelegatedEventHandler.DelegatedEventHandlers.get(
        key,
      ) as StoredDelegatedEventHandler;

      delegated.set(targetKey, handler);

      return handler;
    }

    QueryDelegatedEventHandler.DelegatedEventHandlers.set(
      key,
      new Map([[targetKey, handler]]),
    );

    return handler;
  }

  private _createTargetKey(target: string, options?: object) {
    return `${target}::${options ? JSON.stringify(options) : '{}'}`;
  }

  private _isDelegated(key: AnyFunction): boolean {
    return QueryDelegatedEventHandler.DelegatedEventHandlers.has(key);
  }

  public add<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends IQueryEventKeyMap>(
    event: TEvent,
    target: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    const delegatedOptions = options && { ...options };
    const isOnce = !!options?.once;
    if (isOnce) delete options.once;

    if (options && options.signal)
      options.signal.addEventListener('abort', () =>
        this._removeDelegated(target, handler, delegatedOptions),
      );

    const delegateHandler = (e: Event) => {
      const $target = e.target as Element | null;
      if (!$target || !$target.matches(target)) return;
      if (isOnce) {
        const delegatedHandler = this._removeDelegated(
          target,
          handler,
          delegatedOptions,
        );

        if (delegatedHandler)
          this.target.removeEventListener(event, delegatedHandler, options);
      }

      return handler(e);
    };

    const delegatedHandler = this._addDelegated(
      target,
      handler,
      delegateHandler,
      delegatedOptions,
    );

    this.target.addEventListener(event, delegatedHandler, options);

    return this;
  }

  public remove<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends IQueryEventKeyMap>(
    event: TEvent,
    target: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    if (!this._isDelegated(handler)) return this;

    const delegatedOptions = options && { ...options };
    if (options && options.once) delete options.once;

    const delegatedHandler = this._removeDelegated(
      target,
      handler,
      delegatedOptions,
    );

    if (!delegatedHandler) return this;

    this.target.removeEventListener(event, delegatedHandler, options);

    return this;
  }
}

export class QueryEventHandler<T extends Window | Document | Element>
  implements IQueryEventHandler<T>
{
  private _delegator: QueryDelegatedEventHandler<T>;

  constructor(public target: T) {
    this._delegator = new QueryDelegatedEventHandler<T>(target);
  }

  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    ...args: unknown[]
  ): this {
    if (this._isDelegation<TEvent>(args)) {
      const [event, target, handler, options] = args;
      this._delegator.add(event, target, handler, options);
      return this;
    }

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    return this._addEventListener(event, handler, options);
  }

  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    ...args: unknown[]
  ): this {
    if (this._isDelegation<TEvent>(args)) {
      const [event, target, handler, options] = args;
      this._delegator.remove(event, target, handler, options);
      return this;
    }

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    return this._removeEventListener(event, handler, options);
  }

  private _isDelegation<TEvent>(
    args: unknown[],
  ): args is [TEvent, string, EventListener, IQueryEventOptions | undefined] {
    return (
      args.length >= 3 &&
      typeof args[0] === 'string' &&
      typeof args[1] === 'string' &&
      typeof args[2] === 'function'
    );
  }

  private _removeEventListener<TEvent extends IQueryEventKeyMap>(
    event: TEvent,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    this.target.removeEventListener(event, handler, options);
    return this;
  }

  private _addEventListener<TEvent extends IQueryEventKeyMap>(
    event: TEvent,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    this.target.addEventListener(event, handler, options);
    return this;
  }
}
