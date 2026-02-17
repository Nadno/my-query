import { IQueryEventHandler, IQueryEventOptions } from '@/types';
import { Type, RawJSON } from '@/mini-stack/primitives';
import { Modifier, QueryHandlerModifiers } from './query-handler-modifiers';
import { QueryCustomEventHandler } from './query-custom-event-handler';
import { QueryHandlerStore } from './query-handler-store';
import { EventHandlerModifierMeta } from './query-default-modifiers';

export class QueryEventHandler<T extends Window | Document | Element>
  implements IQueryEventHandler<T>
{
  private readonly _modifiers = new QueryHandlerModifiers();
  private readonly _customEvents = new QueryCustomEventHandler();
  private readonly _eventOptionsToModifiersMap = new Map([
    ['once', '.once'],
    ['capture', '.capture'],
    ['self', '.self'],
    ['preventDefault', '.prevent'],
  ]);

  constructor(public target: T) {}

  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends Event = Event>(
    event: string,
    target: string,
    handler: (e: TEvent) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends Event = Event>(
    event: string,
    handler: (event: TEvent) => void,
    options?: IQueryEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    ...args: unknown[]
  ): this {
    if (this._isDelegation<TEvent>(args)) return this._delegate(...args);

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    {
      if (options && options.delegatedTarget)
        return this._delegate(event, options.delegatedTarget, handler, options);
    }

    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta = { options },
      modifiers: Modifier<EventHandlerModifierMeta>[] = [
        ...this._eventOptionsToModifiers(options, defaultMeta),
        ...this._getModifiersFromDeclaration(
          modifiersDeclarations,
          defaultMeta,
        ),
      ];

    if (modifiers.length === 0) {
      if (this._isCustomEvent(event))
        return this._addCustomEventListener(eventName, handler, options);
      return this._addEventListener(event, handler, options);
    }

    if (this._isCustomEvent(event))
      return this._addCustomEventListener(
        eventName,
        handler,
        options,
        modifiers,
      );

    const onceModifier = modifiers.find(
      (modifier) => modifier.name === '.once',
    );

    if (onceModifier) {
      onceModifier.meta = {
        ...onceModifier.meta,
        target: this.target,
        end: () => this.off(event, handler, options),
      };
    }

    const modified = this._modifiers.modify<EventHandlerModifierMeta>(
        handler,
        modifiers,
      ),
      handlerId = eventName.concat('::', modified.identifier);

    if (onceModifier) {
      delete modified.meta?.options?.once;
    }

    if (
      QueryHandlerStore.has({
        identifier: handlerId,
        originalHandler: handler,
      })
    )
      return this;

    QueryHandlerStore.add({
      identifier: handlerId,
      handler: modified.handler,
      originalHandler: handler,
    });

    this._addEventListener(eventName, modified.handler, modified.meta?.options);

    return this;
  }

  private _delegate(
    event: string,
    target: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ) {
    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta = {
      target: this.target,
      delegatedTarget: target,
      options,
    };
    const modifiers: Modifier<EventHandlerModifierMeta>[] = [
      {
        name: '.delegate',
        meta: defaultMeta,
      },
      ...this._eventOptionsToModifiers(options, defaultMeta),
      ...this._getModifiersFromDeclaration(modifiersDeclarations, defaultMeta),
    ];

    if (this._isCustomEvent(event))
      return this._addCustomEventListener(
        eventName,
        target,
        handler,
        options,
        modifiers,
      );

    const onceModifier = modifiers.find(
      (modifier) => modifier.name === '.once',
    );

    if (onceModifier) {
      onceModifier.meta = {
        ...onceModifier.meta,
        target: this.target,
        end: () => this.off(event, target, handler, options),
      };
    }

    const modified = this._modifiers.modify<EventHandlerModifierMeta>(
        handler,
        modifiers,
      ),
      handlerId = eventName.concat('::', modified.identifier);

    if (onceModifier) {
      delete modified.meta?.options?.once;
    }

    if (
      QueryHandlerStore.has({
        identifier: handlerId,
        originalHandler: handler,
      })
    )
      return this;

    QueryHandlerStore.add({
      identifier: handlerId,
      handler: modified.handler,
      originalHandler: handler,
    });

    this._addEventListener(eventName, modified.handler, modified.meta?.options);

    return this;
  }

  private _addCustomEventListener(
    event: string,
    target: string,
    handler: EventListener,
    options?: IQueryEventOptions,
    modifiers?: Modifier<any>[],
  ): this;
  private _addCustomEventListener(
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
    modifiers?: Modifier<any>[],
  ): this;
  private _addCustomEventListener(...args: any[]) {
    const hasDelegatedTarget = args.length > 2 && Type.isString(args[1]);

    const [event, target, handler, options, modifiers] = (
      hasDelegatedTarget
        ? args
        : [args[0], undefined, args[1], args[2], args[3]]
    ) as [
      string,
      string | undefined,
      EventListener,
      IQueryEventOptions | undefined,
      Modifier<any>[] | undefined,
    ];

    const { event: eventName, args: eventArgs } =
      this._getCustomEventMeta(event);

    if (modifiers) {
      const preModified = this._modifiers.modify(handler, modifiers, {
        orders: 'pre',
      });

      const customEventHandler = this._customEvents.createCustomListener(
        this.target,
        {
          handler: preModified.handler,
          identifier: eventName,
          args: [target, ...eventArgs],
        },
      );

      const modified = this._modifiers.modify(customEventHandler, modifiers, {
        orders: ['normal', 'post'],
      });

      customEventHandler.extensor(modified.handler);

      this._customEvents.addCustomListener(
        this.target,
        handler,
        modified.handler,
        {
          ...modified.meta?.options,
          ...this._modifiersToEventOptions(modifiers),
        },
      );

      return this;
    }

    this._customEvents.addCustomEventListener(this.target, {
      identifier: eventName,
      handler,
      options,
      args: eventArgs,
    });

    return this;
  }

  private _addEventListener(
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    this.target.addEventListener(event, handler, options);
    return this;
  }

  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    target: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    target: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    target: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends Event = Event>(
    event: string,
    target: string,
    handler: (e: TEvent) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends Event = Event>(
    event: string,
    handler: (e: TEvent) => void,
    options?: IQueryEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    ...args: unknown[]
  ): this {
    if (this._isDelegation<TEvent>(args)) return this._undelegate(...args);

    const [event, handler, options] = args as [
      TEvent,
      EventListener,
      IQueryEventOptions,
    ];

    {
      if (options && options.delegatedTarget)
        return this._undelegate(
          event,
          options.delegatedTarget,
          handler,
          options,
        );
    }

    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta = { options },
      modifiers: Modifier<EventHandlerModifierMeta>[] = [
        ...this._eventOptionsToModifiers(options, defaultMeta),
        ...this._getModifiersFromDeclaration(
          modifiersDeclarations,
          defaultMeta,
        ),
      ];

    if (modifiers.length === 0) {
      if (this._isCustomEvent(event))
        return this._removeCustomEventListener(eventName, handler, options);
      return this._removeEventListener(event, handler, options);
    }

    if (this._isCustomEvent(event))
      return this._removeCustomEventListener(
        eventName,
        handler,
        options,
        modifiers,
      );

    const modified = this._modifiers.modify<EventHandlerModifierMeta>(
        handler,
        modifiers,
      ),
      handlerId = eventName.concat('::', modified.identifier);

    if (
      !QueryHandlerStore.has({
        identifier: handlerId,
        originalHandler: handler,
      })
    )
      return this;

    const modifiedHandler = QueryHandlerStore.remove({
      identifier: handlerId,
      originalHandler: handler,
    });

    if (!modifiedHandler) return this;

    return this._removeEventListener(
      eventName,
      modifiedHandler,
      modified.meta?.options,
    );
  }

  private _undelegate(
    event: string,
    target: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta = {
      target: this.target,
      delegatedTarget: target,
      options,
    };

    const modifiers: Modifier<EventHandlerModifierMeta>[] = [
      {
        name: '.delegate',
        meta: defaultMeta,
      },
      ...this._eventOptionsToModifiers(options, defaultMeta),
      ...this._getModifiersFromDeclaration(modifiersDeclarations, defaultMeta),
    ];

    if (this._isCustomEvent(event))
      return this._removeCustomEventListener(
        eventName,
        handler,
        options,
        modifiers,
      );

    const modified = this._modifiers.modify<EventHandlerModifierMeta>(
        handler,
        modifiers,
      ),
      handlerId = eventName.concat('::', modified.identifier);

    if (
      !QueryHandlerStore.has({
        identifier: handlerId,
        originalHandler: handler,
      })
    )
      return this;

    const modifiedHandler = QueryHandlerStore.remove({
      identifier: handlerId,
      originalHandler: handler,
    });

    if (!modifiedHandler) return this;

    this._removeEventListener(
      eventName,
      modifiedHandler,
      modified.meta?.options,
    );

    return this;
  }

  private _removeCustomEventListener(
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
    modifiers?: Modifier<any>[],
  ): this {
    const { event: eventName } = this._getCustomEventMeta(event);

    let _options = options;

    if (modifiers) {
      const modified = this._modifiers.modify(handler, modifiers);

      _options = {
        ...modified.meta?.options,
        ...this._modifiersToEventOptions(modifiers),
      };
    }

    this._customEvents.removeCustomEventListener(this.target, {
      identifier: eventName,
      handler,
      options: _options,
    });

    return this;
  }

  private _getCustomEventMeta(event: string) {
    const metadata = event.split(':'),
      eventArgs = metadata
        .slice(2)
        .filter((value) => !value)
        .map((argument) => RawJSON.parse(argument)),
      eventName = ':' + metadata[1];

    return {
      event: eventName,
      args: eventArgs,
    };
  }

  private _modifiersToEventOptions(
    modifiers: Modifier<EventHandlerModifierMeta>[],
  ) {
    return modifiers.reduce((options, modifier) => {
      switch (modifier.name) {
        case '.delegate': {
          Reflect.set(
            options,
            'delegatedTarget',
            modifier.meta?.delegatedTarget,
          );
          break;
        }
        default: {
          Reflect.set(options, modifier.name.substring(1), true);
        }
      }

      return options;
    }, {});
  }

  private _eventOptionsToModifiers(
    options?: object,
    defaultMeta?: object,
  ): Modifier<EventHandlerModifierMeta>[] {
    if (!options) return [];
    return (Reflect.ownKeys(options) as string[]).reduce<Modifier<any>[]>(
      (result, key) => {
        const name = this._eventOptionsToModifiersMap.get(key);
        if (!name) return result;

        return [
          ...result,
          {
            name,
            meta: {
              target: this.target,
              ...defaultMeta,
            },
          },
        ];
      },
      [],
    );
  }

  private _removeEventListener(
    event: string,
    handler: EventListener,
    options?: IQueryEventOptions,
  ): this {
    this.target.removeEventListener(event, handler, options);
    return this;
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

  private _getModifiersFromDeclaration(
    names: string[],
    defaultMeta?: Record<string, any>,
  ) {
    return names.map<Modifier<EventHandlerModifierMeta>>((name) => {
      const { name: modifierName, args } = this._getModifierMeta(name);

      return {
        name: modifierName,
        meta: {
          target: this.target,
          ...defaultMeta,
          args:
            defaultMeta && defaultMeta.args
              ? [...defaultMeta.args, ...args]
              : args,
        },
      };
    });
  }

  private _getModifierMeta(name: string) {
    const [modifierName, ...stringifiedArgs] = name.split(':');
    return {
      name: '.'.concat(modifierName),
      args: stringifiedArgs
        .filter((value) => !value)
        .map((argument) => RawJSON.parse(argument)),
    };
  }

  private _isCustomEvent(event: string): boolean {
    return event.startsWith(':');
  }
}
