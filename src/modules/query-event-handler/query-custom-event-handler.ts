import { Type, Obj } from '@/modules/primitives';
import { QueryHandlerStore } from './query-handler-store';

export type EventTypes =
  | keyof WindowEventMap
  | keyof DocumentEventMap
  | keyof HTMLElementEventMap
  | (string & {});

export type CustomEventListener<TEvent extends EventTypes = any> = (
  event: TEvent extends keyof WindowEventMap
    ? WindowEventMap[TEvent]
    : TEvent extends keyof DocumentEventMap
    ? DocumentEventMap[TEvent]
    : TEvent extends keyof HTMLElementEventMap
    ? HTMLElementEventMap[TEvent]
    : TEvent,
) => void;

export type CustomEventListenerOptions = AddEventListenerOptions &
  Record<string, any>;

export type CustomEventHandlerData = {
  identifier: string;
  args?: any;
};

export type CustomEventAddHandler<TEvent, THandler = CustomEventListener> = (
  event: TEvent,
  handler: THandler,
  options?: CustomEventListenerOptions,
) => void;

export type CustomEventRemoveHandler<TEvent, THandler = CustomEventListener> = (
  event: TEvent,
  handler: THandler,
  options?: CustomEventListenerOptions,
) => void;

export type CustomEventHandlerResult<TEvent extends EventTypes> = {
  identifier: string;
  event: TEvent;
  handler: CustomEventListener<TEvent>;
  adder?: CustomEventAddHandler<TEvent>;
  remover?: CustomEventRemoveHandler<TEvent>;
};

export type ComplexCustomEventHandlerResult<
  TEvent,
  THandler extends CustomEventListener | CustomEventListener[],
> = {
  identifier: string;
  event: TEvent;
  handler: THandler;
  adder: CustomEventAddHandler<TEvent, THandler>;
  remover: CustomEventRemoveHandler<TEvent, THandler>;
};

type CustomListenerDispose = {
  (): void;
  disposeFunction?: AnyFunction;
};

type GetListenerContext = {
  (): {
    resolvedOptions?: Omit<CustomEventListenerOptions, 'once' | 'signal'>;
    originalOptions?: CustomEventListenerOptions;
  } & Record<string, any>;
  context?: object;
};

export type CustomEventHandlerCommon = {
  getContext: GetListenerContext;
  dispose: CustomListenerDispose;
};

export type CustomEventHandler<TEvent extends EventTypes> =
  CustomEventListener<TEvent> &
    CustomEventHandlerCommon & {
      identifier: string;
      customEvent: string;
      event: TEvent;
      adder?: CustomEventAddHandler<TEvent>;
      remover?: CustomEventRemoveHandler<TEvent>;
      extensor(extendedFunction: AnyFunction): CustomEventHandler<TEvent>;
    };

export type ComplexCustomEventHandler<
  TEvent,
  THandler extends CustomEventListener | CustomEventListener[],
> = THandler &
  CustomEventHandlerCommon & {
    identifier: string;
    customEvent: string;
    event: TEvent;
    adder: CustomEventAddHandler<TEvent, THandler>;
    remover: CustomEventRemoveHandler<TEvent, THandler>;
    extensor(
      extendedFunction: AnyFunction,
    ): ComplexCustomEventHandler<TEvent, THandler>;
  };

export type CustomEventFactory<
  TEvent extends EventTypes | any,
  THandler extends
    | CustomEventListener
    | CustomEventListener[] = CustomEventListener,
> = (options: {
  handler: CustomEventListener;
  target: EventTarget;
  args?: any[];
  dispose: CustomListenerDispose;
  getContext: GetListenerContext;
}) => TEvent extends EventTypes
  ? CustomEventHandlerResult<TEvent>
  : ComplexCustomEventHandlerResult<TEvent, THandler>;

export type CreateCustomEventOptions = {
  identifier: string;
  args?: any[];
  handler: CustomEventListener;
  modify?: (customHandler: AnyFunction) => AnyFunction;
};

export type AddCustomEventOptions = CreateCustomEventOptions & {
  options?: AddEventListenerOptions;
};

export type RemoveCustomEventOptions = {
  identifier: string;
  handler: CustomEventListener;
  options?: CustomEventListenerOptions;
};

const CUSTOM_EVENT_HANDLER_SYMBOL = Symbol('CUSTOM_EVENT_HANDLER');
export class QueryCustomEventHandler {
  private static readonly _customEvents: Record<
    string,
    CustomEventFactory<any>
  > = Object.create(null);

  public static isCustomEventHandler(
    fn: AnyFunction,
  ): fn is CustomEventHandler<any> {
    return Reflect.has(fn, CUSTOM_EVENT_HANDLER_SYMBOL);
  }

  public static has(identifier: string): boolean {
    return Object.hasOwn(QueryCustomEventHandler._customEvents, identifier);
  }

  public static register<TEvent extends keyof WindowEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): typeof QueryCustomEventHandler;
  public static register<TEvent extends keyof DocumentEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): typeof QueryCustomEventHandler;
  public static register<TEvent extends keyof HTMLElementEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): typeof QueryCustomEventHandler;
  public static register<
    TEvent,
    THandler extends CustomEventListener<any> | CustomEventListener<any>[],
  >(
    identifier: string,
    factory: CustomEventFactory<TEvent, THandler>,
  ): typeof QueryCustomEventHandler;
  public static register<TEvent>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): typeof QueryCustomEventHandler {
    QueryCustomEventHandler._customEvents[identifier] = factory;
    return QueryCustomEventHandler;
  }

  public static unregister(identifier: string): void {
    delete QueryCustomEventHandler._customEvents[identifier];
  }

  public static clear(): void {
    Object.keys(QueryCustomEventHandler._customEvents).forEach(
      (key) => delete QueryCustomEventHandler._customEvents[key],
    );
  }

  public has(identifier: string): boolean {
    return QueryCustomEventHandler.has(identifier);
  }

  public register<TEvent extends keyof WindowEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): this;
  public register<TEvent extends keyof DocumentEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): this;
  public register<TEvent extends keyof HTMLElementEventMap>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): this;
  public register<TEvent extends EventTypes>(
    identifier: string,
    factory: CustomEventFactory<TEvent>,
  ): this {
    QueryCustomEventHandler.register(identifier, factory as any);
    return this;
  }

  public unregister(identifier: string): this {
    QueryCustomEventHandler.unregister(identifier);
    return this;
  }

  public addCustomEventListener(
    target: EventTarget,
    addCustomEventOptions: AddCustomEventOptions,
  ): this {
    this.addCustomListener(
      target,
      addCustomEventOptions.handler,
      this.createCustomListener(target, addCustomEventOptions),
      addCustomEventOptions.options,
    );

    return this;
  }

  public createCustomListener(
    target: EventTarget,
    customEventOptions: CreateCustomEventOptions,
  ): CustomEventHandler<any> {
    const { identifier, handler, args } = customEventOptions;

    const getContext: GetListenerContext = () => {
      if (Type.isNullOrUndefined(getContext.context))
        throw new Error(
          'You cannot call the custom listener getContext till it is added!',
        );

      return getContext.context;
    };

    const dispose: CustomListenerDispose = () => {
      if (!Type.isFunction(dispose.disposeFunction))
        throw new Error(
          'You cannot call the custom listener dispose till it is added!',
        );

      dispose.disposeFunction();
      delete dispose.disposeFunction;
      delete getContext.context;
    };

    const {
      identifier: customIdentifier,
      event,
      handler: customHandler,
      adder,
      remover,
    } = QueryCustomEventHandler._customEvents[identifier]({
      target,
      handler,
      args,
      getContext,
      dispose,
    });

    const customListenerMetadata = {
      [CUSTOM_EVENT_HANDLER_SYMBOL]: CUSTOM_EVENT_HANDLER_SYMBOL,
      identifier: customIdentifier,
      customEvent: identifier,
      event,
      adder,
      remover,
      dispose,
      getContext,
      extensor(extendedFunction: AnyFunction) {
        return Object.assign(extendedFunction, customListenerMetadata);
      },
    };

    return Object.assign(customHandler, customListenerMetadata);
  }

  public addCustomListener(
    target: EventTarget,
    listener: AnyFunction,
    customEventListener: CustomEventHandler<any>,
    options?: AddEventListenerOptions,
  ) {
    const { customEvent } = customEventListener;

    if (!this.has(customEvent))
      throw new Error(`There is no custom event called "${customEvent}"!`);

    const originalOptions = options && { ...options },
      resolvedOptions = options && Obj.omit(options, ['once', 'signal']);

    customEventListener.dispose.disposeFunction = () => {
      this.removeCustomEventListener(target, {
        identifier: customEventListener.customEvent,
        handler: listener,
        options: originalOptions,
      });
    };

    customEventListener.getContext.context = {
      resolvedOptions,
      originalOptions,
    };

    if (options && options.signal) {
      options.signal.addEventListener('abort', customEventListener.dispose);
    }

    if (
      QueryHandlerStore.has({
        identifier: customEvent,
        originalHandler: listener,
      })
    )
      return this;

    const customHandlerKey = this._createKey(customEvent, originalOptions);

    QueryHandlerStore.add({
      identifier: customHandlerKey,
      originalHandler: listener,
      handler: customEventListener,
    });

    customEventListener.adder
      ? customEventListener.adder(
          customEventListener.event,
          customEventListener,
          resolvedOptions,
        )
      : target.addEventListener(
          customEventListener.event,
          customEventListener,
          resolvedOptions,
        );

    return this;
  }

  public removeCustomEventListener(
    target: EventTarget,
    { identifier, handler, options }: RemoveCustomEventOptions,
  ): this {
    if (!this.has(identifier))
      throw new Error(`There is no custom event called "${identifier}"!`);

    const originalOptions = options && { ...options },
      resolvedOptions = options && Obj.omit(options, ['once', 'signal']);

    const customHandlerKey = this._createKey(identifier, originalOptions);

    if (
      !QueryHandlerStore.has({
        identifier: customHandlerKey,
        originalHandler: handler,
      })
    )
      return this;

    const customEventHandler: CustomEventHandler<any> | undefined =
      QueryHandlerStore.remove({
        identifier: customHandlerKey,
        originalHandler: handler,
      }) as CustomEventHandler<any>;

    if (!customEventHandler) return this;

    customEventHandler.remover
      ? customEventHandler.remover(
          customEventHandler.event,
          customEventHandler,
          resolvedOptions,
        )
      : target.removeEventListener(
          customEventHandler.event,
          customEventHandler,
          resolvedOptions,
        );

    return this;
  }

  private _createKey(identifier: string, options?: object): string {
    if (Type.isNullOrUndefined(options)) return identifier;
    return ''.concat(identifier, '::', Obj.identity(options));
  }
}
