import {
  IQueryEventHandler,
  IQueryEventKeyMap,
  IQueryEventOptions,
} from '../types';

export type CustomEventHandlerOptions = IQueryEventOptions;

export type CustomEventHandler = AnyFunction;

export type CustomEventHandlerTargets = Map<
  string,
  CustomEventHandlerOptions | undefined
>;

export type StoredCustomEventHandler = Map<string, CustomEventHandler>;

export type CustomEventHandlerData = {
  identifier: string;
  arg?: any;
};

export type CustomEventHandlerFactory = (config: {
  handler: EventListener;
  target: EventTarget;
  arg: any;
}) => {
  identifier: string;
  handler: EventListener;
  adder?: (
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ) => void;
  remover?: (
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ) => void;
};

export const KEYBOARD_MODIFIERS_KEYS = new Set([
  'Enter',
  'Tab',
  'Alt',
  'AltGraph',
  'Shift',
  'Backspace',
  'Delete',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export class QueryCustomEventHandler<T extends Window | Document | Element> {
  private static readonly _CustomEventHandlers: Map<
    CustomEventHandler,
    StoredCustomEventHandler
  > = new Map();

  private static _CustomHandlersFactories: Record<
    string,
    CustomEventHandlerFactory
  > = {
    delegated: ({ handler, arg: [target] }) => ({
      identifier: target,
      handler: (e) => {
        const $target = e.target as Element | null;
        if (!$target || !$target.matches(target)) return;
        handler(e);
      },
    }),
    ':click-outside': ({ handler, target }) => ({
      identifier: 'click-outside',
      handler: (e) => {
        const $clickTarget = e.target as Element | null,
          $target = target as HTMLElement;
        if ($target.contains($clickTarget)) return;
        handler(e);
      },
      adder(_, handler, options) {
        window.addEventListener('pointerdown', handler, options);
      },
      remover(_, handler, options) {
        window.removeEventListener('pointerdown', handler, options);
      },
    }),
    ':focus-outside': ({ handler, target }) => ({
      identifier: 'focus-outside',
      handler: (e) => {
        const $target = e.target as HTMLElement | null,
          $relatedTarget = (e as FocusEvent).relatedTarget as Element;
        if (!$target || $target.contains($relatedTarget)) return;
        handler(e);
      },
      adder(_, handler, options) {
        target.addEventListener('focusout', handler, options);
      },
      remover(_, handler, options) {
        target.removeEventListener('focusout', handler, options);
      },
    }),
    ':interact-outside': ({ handler, target }) => ({
      identifier: 'interact-outside',
      handler: (e) => {
        if (e.type === 'focusout') {
          const $target = e.target as HTMLElement,
            $relatedTarget = (e as FocusEvent).relatedTarget as Element | null;
          if ($target.contains($relatedTarget)) return;
          return handler(e);
        } else {
          const $clickTarget = e.target as Element,
            $target = target as HTMLElement;
          if ($target.contains($clickTarget)) return;
          return handler(e);
        }
      },
      adder(_, handler, options) {
        window.addEventListener('pointerdown', handler, options);
        target.addEventListener('focusout', handler, options);
      },
      remover(_, handler, options) {
        window.removeEventListener('pointerdown', handler, options);
        target.removeEventListener('focusout', handler, options);
      },
    }),
  };

  public static register(
    identifier: string,
    factory: CustomEventHandlerFactory,
  ) {
    QueryCustomEventHandler._CustomHandlersFactories[identifier] = factory;
  }

  constructor(public target: T) {}

  private _removeCustomHandler(
    target: string,
    key: AnyFunction,
    options?: CustomEventHandlerOptions,
  ): CustomEventHandler | undefined {
    const targetKey = this._createKey(target, options);

    const delegated = QueryCustomEventHandler._CustomEventHandlers.get(key);
    if (!delegated || !delegated.has(targetKey)) return;

    const result = delegated.get(targetKey);
    delegated.delete(targetKey);

    if (delegated.size === 0)
      QueryCustomEventHandler._CustomEventHandlers.delete(key);

    return result;
  }

  private _addCustomHandler(
    identifier: string,
    key: AnyFunction,
    handler: CustomEventHandler,
    options?: CustomEventHandlerOptions,
  ): CustomEventHandler {
    const targetKey = this._createKey(identifier, options);

    if (this._hasCustomHandler(key)) {
      const delegated = QueryCustomEventHandler._CustomEventHandlers.get(
        key,
      ) as StoredCustomEventHandler;

      delegated.set(targetKey, handler);

      return handler;
    }

    QueryCustomEventHandler._CustomEventHandlers.set(
      key,
      new Map([[targetKey, handler]]),
    );

    return handler;
  }

  private _createKey(identifier: string, options?: object) {
    return `${identifier}::${options ? JSON.stringify(options) : '{}'}`;
  }

  private _hasCustomHandler(key: AnyFunction): boolean {
    return QueryCustomEventHandler._CustomEventHandlers.has(key);
  }

  public add<TEvent extends keyof WindowEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends keyof DocumentEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends keyof HTMLElementEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions | undefined,
  ): this;
  public add<TEvent extends IQueryEventKeyMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    if (
      !Object.hasOwn(
        QueryCustomEventHandler._CustomHandlersFactories,
        custom.identifier,
      )
    )
      return this;

    const {
      handler: customHandler,
      identifier,
      adder,
      remover,
    } = QueryCustomEventHandler._CustomHandlersFactories[custom.identifier]({
      target: this.target,
      handler,
      arg: custom.arg,
    });

    const customHandlerOptions = options && { ...options };
    const isOnce = !!options?.once;
    if (isOnce) delete options.once;

    if (options && options.signal)
      options.signal.addEventListener('abort', () =>
        this._removeCustomHandler(identifier, handler, customHandlerOptions),
      );

    const withOptionalOnceCustomHandler = (e: Event) => {
      if (isOnce) {
        const customEventHandler = this._removeCustomHandler(
          identifier,
          handler,
          customHandlerOptions,
        );

        if (customEventHandler)
          remover
            ? remover(event, customEventHandler, options)
            : this.target.removeEventListener(
                event,
                customEventHandler,
                options,
              );
      }

      return customHandler(e);
    };

    const customEventHandler = this._addCustomHandler(
      identifier,
      handler,
      withOptionalOnceCustomHandler,
      customHandlerOptions,
    );

    adder
      ? adder(event, customEventHandler, options)
      : this.target.addEventListener(event, customEventHandler, options);

    return this;
  }

  public remove<TEvent extends keyof WindowEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends keyof DocumentEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends keyof HTMLElementEventMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: (event: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public remove<TEvent extends IQueryEventKeyMap>(
    custom: CustomEventHandlerData,
    event: TEvent,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    if (!this._hasCustomHandler(handler)) return this;

    if (
      !Object.hasOwn(
        QueryCustomEventHandler._CustomHandlersFactories,
        custom.identifier,
      )
    )
      return this;

    const { identifier, remover } =
      QueryCustomEventHandler._CustomHandlersFactories[custom.identifier]({
        target: this.target,
        handler,
        arg: custom.arg,
      });

    const customHandlerOptions = options && { ...options };
    if (options && options.once) delete options.once;

    const customEventHandler = this._removeCustomHandler(
      identifier,
      handler,
      customHandlerOptions,
    );

    if (!customEventHandler) return this;

    remover
      ? remover(event, customEventHandler, options)
      : this.target.removeEventListener(event, customEventHandler, options);

    return this;
  }
}

export class QueryEventHandler<T extends Window | Document | Element>
  implements IQueryEventHandler<T>
{
  private _customizedEvent: QueryCustomEventHandler<T>;

  constructor(public target: T) {
    this._customizedEvent = new QueryCustomEventHandler<T>(target);
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
      this._customizedEvent.add(
        {
          identifier: 'delegated',
          arg: [target],
        },
        event,
        handler,
        options,
      );
      return this;
    }

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    if (this._isCustomEvent(event)) {
      this._customizedEvent.add(
        {
          identifier: event,
        },
        event,
        handler,
        options,
      );

      return this;
    }

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
      this._customizedEvent.remove(
        {
          identifier: 'delegated',
          arg: [target],
        },
        event,
        handler,
        options,
      );
      return this;
    }

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    if (this._isCustomEvent(event)) {
      this._customizedEvent.remove(
        {
          identifier: event,
        },
        event,
        handler,
        options,
      );

      return this;
    }

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

  private _isCustomEvent(event: string): boolean {
    return event.startsWith(':');
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
