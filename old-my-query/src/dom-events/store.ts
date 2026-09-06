export type HandlerMapping = Map<string, AnyFunction>;

export type MappedHandlerData = {
  identifier: string;
  originalHandler: AnyFunction;
};

export type AddMappedHandlerData = {
  identifier: string;
  originalHandler: AnyFunction;
  handler: AnyFunction;
};

export class DOMHandlerStore {
  private static _handlers: WeakMap<AnyFunction, HandlerMapping> = new Map() as any;

  public static exists(handler: AnyFunction): boolean {
    return DOMHandlerStore._handlers.has(handler);
  }

  public static has({ identifier, originalHandler }: MappedHandlerData): boolean {
    const handlers = DOMHandlerStore._handlers.get(originalHandler);
    return !!handlers && handlers.has(identifier);
  }

  public static get<THandler extends AnyFunction = AnyFunction>({
    identifier,
    originalHandler,
  }: MappedHandlerData): THandler | undefined {
    const handlers = DOMHandlerStore._handlers.get(originalHandler);
    if (!handlers) return;
    return handlers.get(identifier) as THandler;
  }

  public static add({ identifier, originalHandler, handler }: AddMappedHandlerData): void {
    if (DOMHandlerStore.exists(originalHandler)) {
      const handlers = DOMHandlerStore._handlers.get(originalHandler) as HandlerMapping;
      if (handlers.has(identifier)) return;
      handlers.set(identifier, handler);
      return;
    }
    DOMHandlerStore._handlers.set(originalHandler, new Map([[identifier, handler]]));
  }

  public static remove({ identifier, originalHandler }: MappedHandlerData): AnyFunction | undefined {
    const handlers = DOMHandlerStore._handlers.get(originalHandler);
    if (!handlers || !handlers.has(identifier)) return;

    const result = handlers.get(identifier);
    handlers.delete(identifier);

    if (handlers.size === 0) DOMHandlerStore._handlers.delete(originalHandler);

    return result;
  }

  public static clear(handler: AnyFunction): void {
    DOMHandlerStore._handlers.delete(handler);
  }

  public static clearAll(): void {
    DOMHandlerStore._handlers = new WeakMap();
  }
}
