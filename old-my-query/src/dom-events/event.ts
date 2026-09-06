import { RawJSON } from '@/mini-stack/primitives';
import { Modifier, DOMEventModifiers } from './modifiers';
import { DOMCustomEventHandler } from './custom-events';
import { DOMHandlerStore } from './store';
import { DOMEventOptions, DOMCustomEventKeyMap, TargetedEvent } from './types';
import { EventHandlerModifierMeta } from './defaults/modifiers';

type AddCustomEventParams = {
  event: string;
  delegatedTarget?: string;
  handler: EventListener;
  options?: DOMEventOptions;
  modifiers?: Modifier<any>[];
};

export type ModifierDeclaration =
  | string
  | { $$: string; $?: any; [key: string]: any };

export class DOMEvent<T extends Window | Document | Element> {
  private readonly _eventOptionsToModifiersMap = new Map([
    ['once', '.once'],
    ['capture', '.capture'],
    ['self', '.self'],
    ['preventDefault', '.prevent'],
  ]);

  constructor(public target: T) {}

  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends Event = Event>(
    event: string,
    delegateTarget: string,
    handler: (e: TEvent) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<WindowEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<DocumentEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends Event = Event>(
    event: string,
    handler: (event: TEvent) => void,
    options?: DOMEventOptions,
  ): this;
  public on<TEvent extends keyof HTMLElementEventMap>(...args: unknown[]): this {
    if (this._isDelegation<TEvent>(args)) {
      const [event, target, handler, options] = args;
      return this._bindEvent(event, handler, options, target);
    }

    const [event, handler, options] = args as [TEvent, EventListener, DOMEventOptions];

    if (options && options.delegatedTarget)
      return this._bindEvent(event, handler, options, options.delegatedTarget);

    return this._bindEvent(event, handler, options);
  }

  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: WindowEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: DocumentEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    delegateTarget: string,
    handler: (e: HTMLElementEventMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends Event = Event>(
    event: string,
    delegateTarget: string,
    handler: (e: TEvent) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof WindowEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<WindowEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof DocumentEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<DocumentEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(
    event: TEvent,
    handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends Event = Event>(
    event: string,
    handler: (e: TEvent) => void,
    options?: DOMEventOptions,
  ): this;
  public off<TEvent extends keyof HTMLElementEventMap>(...args: unknown[]): this {
    if (this._isDelegation<TEvent>(args)) {
      const [event, target, handler, options] = args;
      return this._unbindEvent(event, handler, options, target);
    }

    const [event, handler, options] = args as [TEvent, EventListener, DOMEventOptions];

    if (options && options.delegatedTarget)
      return this._unbindEvent(event, handler, options, options.delegatedTarget);

    return this._unbindEvent(event, handler, options);
  }

  public $on<TEvent extends keyof WindowEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<WindowEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $on<TEvent extends keyof DocumentEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<DocumentEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $on<TEvent extends keyof HTMLElementEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $on<TEvent extends keyof DOMCustomEventKeyMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: DOMCustomEventKeyMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public $on<TEvent extends string>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: Event) => void,
    options?: DOMEventOptions,
  ): this;
  public $on<TEvent extends string>(
    declarations: [{ $$: TEvent; [key: string]: any }, ...ModifierDeclaration[]],
    handler: (e: Event) => void,
    options?: DOMEventOptions,
  ): this;
  public $on(
    declarations: [string | { $$: string; [key: string]: any }, ...ModifierDeclaration[]],
    handler: EventListener,
    options?: DOMEventOptions,
  ): this {
    const parsed = this._parseDeclarations(declarations);
    const allModifiers = [
      ...parsed.modifiers,
      ...this._eventOptionsToModifiers(options, { options }),
    ];

    console.log({ parsed, allModifiers});
    if (parsed.isCustom) {
      return this._addCustomEvent({
        event: parsed.eventName,
        delegatedTarget: parsed.delegatedTarget,
        handler,
        options,
        modifiers: allModifiers.length > 0 ? allModifiers : undefined,
      });
    }

    if (parsed.delegatedTarget) {
      return this._bindEvent(
        parsed.eventName as any,
        handler,
        options,
        parsed.delegatedTarget,
        allModifiers.length > 0 ? allModifiers : undefined,
      );
    }

    return this._bindEvent(
      parsed.eventName as any,
      handler,
      options,
      undefined,
      allModifiers.length > 0 ? allModifiers : undefined,
    );
  }

  public $off<TEvent extends keyof WindowEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<WindowEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $off<TEvent extends keyof DocumentEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<DocumentEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $off<TEvent extends keyof HTMLElementEventMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: TargetedEvent<HTMLElementEventMap[TEvent], T>) => void,
    options?: DOMEventOptions,
  ): this;
  public $off<TEvent extends keyof DOMCustomEventKeyMap>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: DOMCustomEventKeyMap[TEvent]) => void,
    options?: DOMEventOptions,
  ): this;
  public $off<TEvent extends string>(
    declarations: [TEvent, ...ModifierDeclaration[]],
    handler: (e: Event) => void,
    options?: DOMEventOptions,
  ): this;
  public $off<TEvent extends string>(
    declarations: [{ $$: TEvent; [key: string]: any }, ...ModifierDeclaration[]],
    handler: (e: Event) => void,
    options?: DOMEventOptions,
  ): this;
  public $off(
    declarations: [string | { $$: string; [key: string]: any }, ...ModifierDeclaration[]],
    handler: EventListener,
    options?: DOMEventOptions,
  ): this {
    const parsed = this._parseDeclarations(declarations);
    const allModifiers = [
      ...parsed.modifiers,
      ...this._eventOptionsToModifiers(options, { options }),
    ];

    if (parsed.isCustom) {
      return this._removeCustomEvent(
        parsed.eventName,
        handler,
        options,
        allModifiers.length > 0 ? allModifiers : undefined,
      );
    }

    if (parsed.delegatedTarget) {
      return this._unbindEvent(
        parsed.eventName as any,
        handler,
        options,
        parsed.delegatedTarget,
        allModifiers.length > 0 ? allModifiers : undefined,
      );
    }

    return this._unbindEvent(
      parsed.eventName as any,
      handler,
      options,
      undefined,
      allModifiers.length > 0 ? allModifiers : undefined,
    );
  }

  private _bindEvent(
    event: string,
    handler: EventListener,
    options?: DOMEventOptions,
    delegatedTarget?: string,
    prebuiltModifiers?: Modifier<EventHandlerModifierMeta>[],
  ): this {
    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta: Record<string, any> = { options };
    if (delegatedTarget) {
      defaultMeta.target = this.target;
      defaultMeta.delegatedTarget = delegatedTarget;
    }

    const modifiers: Modifier<EventHandlerModifierMeta>[] = prebuiltModifiers ?? [
      ...(delegatedTarget
        ? [{ name: '.delegate', meta: defaultMeta } as Modifier<EventHandlerModifierMeta>]
        : []),
      ...this._eventOptionsToModifiers(options, defaultMeta),
      ...this._getModifiersFromDeclaration(modifiersDeclarations, defaultMeta),
    ];

    if (modifiers.length === 0) {
      if (this._isCustomEvent(event))
        return this._addCustomEvent({ event: eventName, handler, options });
      this.target.addEventListener(event, handler, options);
      return this;
    }

    if (this._isCustomEvent(event))
      return this._addCustomEvent({
        event: eventName,
        delegatedTarget,
        handler,
        options,
        modifiers,
      });

    const onceModifier = modifiers.find((m) => m.name === '.once');
    if (onceModifier) {
      onceModifier.meta = {
        ...onceModifier.meta,
        target: this.target,
        end: prebuiltModifiers
          ? () => this._unbindEvent(event, handler, options, delegatedTarget, prebuiltModifiers)
          : delegatedTarget
            ? () => this.off(event, delegatedTarget, handler, options)
            : () => this.off(event, handler, options),
      };
    }

    const modified = DOMEventModifiers.modify<EventHandlerModifierMeta>(handler, modifiers),
      handlerId = eventName.concat('::', modified.identifier);

    if (onceModifier) {
      delete modified.meta?.options?.once;
    }

    if (DOMHandlerStore.has({ identifier: handlerId, originalHandler: handler })) return this;

    DOMHandlerStore.add({ identifier: handlerId, handler: modified.handler, originalHandler: handler });

    this.target.addEventListener(eventName, modified.handler, modified.meta?.options);
    return this;
  }

  private _unbindEvent(
    event: string,
    handler: EventListener,
    options?: DOMEventOptions,
    delegatedTarget?: string,
    prebuiltModifiers?: Modifier<EventHandlerModifierMeta>[],
  ): this {
    const [eventName, ...modifiersDeclarations] = event.split('.');

    const defaultMeta: Record<string, any> = { options };
    if (delegatedTarget) {
      defaultMeta.target = this.target;
      defaultMeta.delegatedTarget = delegatedTarget;
    }

    const modifiers: Modifier<EventHandlerModifierMeta>[] = prebuiltModifiers ?? [
      ...(delegatedTarget
        ? [{ name: '.delegate', meta: defaultMeta } as Modifier<EventHandlerModifierMeta>]
        : []),
      ...this._eventOptionsToModifiers(options, defaultMeta),
      ...this._getModifiersFromDeclaration(modifiersDeclarations, defaultMeta),
    ];

    if (modifiers.length === 0) {
      if (this._isCustomEvent(event))
        return this._removeCustomEvent(eventName, handler, options);
      this.target.removeEventListener(event, handler, options);
      return this;
    }

    if (this._isCustomEvent(event))
      return this._removeCustomEvent(eventName, handler, options, modifiers);

    const modified = DOMEventModifiers.modify<EventHandlerModifierMeta>(handler, modifiers),
      handlerId = eventName.concat('::', modified.identifier);

    if (!DOMHandlerStore.has({ identifier: handlerId, originalHandler: handler })) return this;

    const modifiedHandler = DOMHandlerStore.remove({ identifier: handlerId, originalHandler: handler });
    if (!modifiedHandler) return this;

    this.target.removeEventListener(eventName, modifiedHandler, modified.meta?.options);
    return this;
  }

  private _addCustomEvent({
    event,
    delegatedTarget,
    handler,
    options,
    modifiers,
  }: AddCustomEventParams): this {
    const { event: eventName, args: eventArgs } = this._getCustomEventMeta(event);

    if (modifiers) {
      const customEventHandler = DOMCustomEventHandler.createCustomListener(this.target, {
        handler,
        identifier: eventName,
        args: [delegatedTarget, ...eventArgs],
      });

      const modified = DOMEventModifiers.modify(customEventHandler, modifiers);

      customEventHandler.extensor(modified.handler);

      DOMCustomEventHandler.addCustomListener(
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

    DOMCustomEventHandler.addCustomEventListener(this.target, {
      identifier: eventName,
      handler,
      options,
      args: eventArgs,
    });

    return this;
  }

  private _removeCustomEvent(
    event: string,
    handler: EventListener,
    options?: DOMEventOptions,
    modifiers?: Modifier<any>[],
  ): this {
    const { event: eventName } = this._getCustomEventMeta(event);

    let _options = options;

    if (modifiers) {
      const modified = DOMEventModifiers.modify(handler, modifiers);
      _options = {
        ...modified.meta?.options,
        ...this._modifiersToEventOptions(modifiers),
      };
    }

    DOMCustomEventHandler.removeCustomEventListener(this.target, {
      identifier: eventName,
      handler,
      options: _options,
    });

    return this;
  }

  private _parseDeclarations(
    declarations: [string | { $$: string; [key: string]: any }, ...ModifierDeclaration[]],
  ): {
    eventName: string;
    isCustom: boolean;
    delegatedTarget?: string;
    modifiers: Modifier<EventHandlerModifierMeta>[];
  } {
    const [first, ...rest] = declarations;

    let eventName: string;
    let isCustom = false;

    if (typeof first === 'object') {
      const { $$: name } = first;
      eventName = name;
      isCustom = name.startsWith(':');
    } else {
      eventName = first;
      isCustom = first.startsWith(':');
    }

    let delegatedTarget: string | undefined;
    const modifiers: Modifier<EventHandlerModifierMeta>[] = [];

    for (const decl of rest) {
      if (typeof decl === 'string') {
        const modifierName = decl.startsWith('.') ? decl : '.'.concat(decl);
        modifiers.push({ name: modifierName, meta: { target: this.target } as any });
      } else {
        const { $$: name, $: mainArg, ...extraOptions } = decl;
        const modifierName = name.startsWith('.') ? name : '.'.concat(name);

        if (modifierName === '.delegate' && mainArg) {
          delegatedTarget = mainArg;
        }

        modifiers.push({
          name: modifierName,
          meta: {
            target: this.target,
            ...(delegatedTarget ? { delegatedTarget } : {}),
            args: mainArg ? [mainArg] : [],
            ...extraOptions,
          } as any,
        });
      }
    }

    return { eventName, isCustom, delegatedTarget, modifiers };
  }

  private _getCustomEventMeta(event: string) {
    const metadata = event.split(':'),
      eventArgs = metadata
        .slice(2)
        .filter(Boolean)
        .map((argument) => RawJSON.parse(argument)),
      eventName = ':' + metadata[1];

    return { event: eventName, args: eventArgs };
  }

  private _modifiersToEventOptions(modifiers: Modifier<EventHandlerModifierMeta>[]) {
    return modifiers.reduce((options, modifier) => {
      switch (modifier.name) {
        case '.delegate': {
          Reflect.set(options, 'delegatedTarget', modifier.meta?.delegatedTarget);
          break;
        }
        default: {
          Reflect.set(options, modifier.name.substring(1), true);
        }
      }
      return options;
    }, {} as Record<string, any>);
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
          { name, meta: { target: this.target, ...defaultMeta } },
        ];
      },
      [],
    );
  }

  private _isDelegation<TEvent>(
    args: unknown[],
  ): args is [TEvent, string, EventListener, DOMEventOptions | undefined] {
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
          args: defaultMeta && defaultMeta.args ? [...defaultMeta.args, ...args] : args,
        },
      };
    });
  }

  private _getModifierMeta(name: string) {
    const [modifierName, ...stringifiedArgs] = name.split(':');
    return {
      name: '.'.concat(modifierName),
      args: stringifiedArgs.filter(Boolean).map((argument) => RawJSON.parse(argument)),
    };
  }

  private _isCustomEvent(event: string): boolean {
    return event.startsWith(':');
  }
}

// Backwards-compatible alias
export { DOMEvent as MQEvent };
