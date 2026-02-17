import { Type, Obj } from '@/mini-stack/primitives';

export type ModifierOrder = 'normal' | 'pre' | 'post';

export type ExternalModifierMeta = {
  args?: any[];
  [key: string]: any;
};

export type InternalModifierMeta = {
  modifierName: string;
} & ExternalModifierMeta;

export type Modifier<TMeta extends object = {}> = {
  name: string;
  meta?: ExternalModifierMeta & TMeta;
};

export type ModifierResult<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = {
  identifier: string;
  handler: THandler;
  meta?: object & TMeta;
};

export type ModifierFactory<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = (
  handler: THandler,
  meta: InternalModifierMeta & TMeta,
) => ModifierResult<TMeta, THandler>;

export type ModifierTransform<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = (
  current: Partial<ModifierResult<TMeta, THandler>>,
  modified: ModifierResult<TMeta, THandler>,
) => ModifierResult<TMeta, THandler>;

export type ModifyOptions<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = {
  orders?: ModifierOrder | ModifierOrder[];
  transform?: ModifierTransform<TMeta, THandler>;
};

const DEFAULT_MODIFY_TRANSFORM: ModifierTransform<any, any> = (
  current,
  modified,
) => ({
  ...modified,
  meta: modified.meta
    ? {
        ...current.meta,
        ...modified.meta,
      }
    : current.meta,
  identifier: current.identifier
    ? current.identifier.concat(':', modified.identifier)
    : modified.identifier,
});

const createFactoryStorage = () =>
  Object.create(null) as Record<string, ModifierFactory>;

const factories = {
  normal: createFactoryStorage(),
  preceded: createFactoryStorage(),
  proceeded: createFactoryStorage(),
};

const withOrder = <TResult = void>(
  order: ModifierOrder,
  callback: (factories: Record<string, ModifierFactory>) => TResult,
): TResult => {
  switch (order) {
    case 'normal':
      return callback(factories.normal);
    case 'pre':
      return callback(factories.preceded);
    case 'post':
      return callback(factories.proceeded);
  }
};

const getOrders = () => Object.values(factories);

export class QueryHandlerModifiers {
  /**
   * This static method registers a new modifier function.
   *
   * A modifier function takes the original handler function and internal modifier meta information as arguments, and returns a {@link ModifierResult} object containing the modified function, its identifier, and optional meta information.
   *
   * @param {string} modifier - The unique name for the modifier.
   * @param {ModifierFactory<THandler>} factory - The function that creates the modified result based on the original handler and meta information.
   * @throws {TypeError} If the provided factory parameter is not a function.
   *
   * @example
   * ```typescript
   * // Example modifier factory that logs a message before calling the original handler
   * const logBeforeFactory: ModifierFactory = (handler, meta) => {
   *   return {
   *     handler: (arg) => { // Wrap the original handler with logging
   *       console.log("Log before:", arg);
   *       return handler(arg);
   *     },
   *     identifier: "with-log-before",
   *   };
   * };
   *
   * // Register the modifier using the factory function
   * QueryHandlerModifiers.register("logBefore", logBeforeFactory);
   * ```
   */
  public static register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    order: ModifierOrder,
    modifier: string,
    factory: ModifierFactory<TMeta, THandler>,
  ): typeof QueryHandlerModifiers;
  public static register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    modifier: string,
    factory: ModifierFactory<TMeta, THandler>,
  ): typeof QueryHandlerModifiers;
  public static register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(...args: any[]) {
    const [order, modifier, factory] =
      args.length >= 3
        ? args
        : (['normal', ...args] as [
            ModifierOrder,
            string,
            ModifierFactory<TMeta, THandler>,
          ]);

    if (typeof factory !== 'function')
      throw new TypeError('Expected factory parameter to be a function!');

    withOrder(
      order,
      (factories) => (factories[modifier] = factory as AnyFunction),
    );

    return QueryHandlerModifiers;
  }

  public static unregister(order: ModifierOrder, modifier: string): void {
    withOrder(order, (factories) => delete factories[modifier]);
  }

  public static clear(): void {
    factories.normal = createFactoryStorage();
    factories.preceded = createFactoryStorage();
    factories.proceeded = createFactoryStorage();
  }

  /**
   * Applies modifiers to a function and returns the modified result.
   *
   * This method iterates through the provided `modifiers` array and applies each modifier based on its registered factory function. It allows customization of the final result through the optional `transform` function.
   *
   * @param {THandler} handler - The original function to be modified.
   * @param {Modifier<TMeta>[]} modifiers - An array of modifiers to apply to the function. Each modifier object should have a `name` property referencing a registered modifier, and an optional `meta` property for additional data used by the modifier factory.
   * @param {ModifierTransform<TMeta, THandler> | undefined} transform - An optional function that allows customization of the final `ModifierResult`. This function receives the current accumulated result and the modified result from each modifier application, and can modify the final meta information and identifier. Defaults to a function that merges meta and concatenates identifiers.
   * @throws {Error} If a required modifier is not registered.
   * @returns {ModifierResult<TMeta, THandler>} The modified function along with its identifier and meta information (if provided by the modifiers and transformed by the `transform` function).
   *
   * @example
   * ```typescript
   * // Assuming the "logBefore" modifier is already registered
   * const myHandler = (data: string) => `Original data: ${data}`;
   * const modifiedResult = QueryHandlerModifiers.modify(
   *   myHandler,
   *   [
   *     {
   *       name: "logBefore", // Reference the registered modifier name
   *       meta: {},
   *     },
   *   ],
   * );
   *
   * console.log(modifiedResult.identifier); // Output: "fetch-data" (assuming default transform)
   * console.log(modifiedResult.handler("Hello")); // Output: Logs before calling the original handler
   * ```
   */
  public modify<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    handler: THandler | ModifierResult<TMeta, THandler>,
    modifiers: Modifier<TMeta>[],
    options: ModifyOptions<TMeta, THandler> = {},
  ): ModifierResult<TMeta, THandler> {
    const { orders = ['pre', 'normal', 'post'] } = options;

    const maybe = (
      order: ModifierOrder,
      result?: ModifierResult<TMeta, THandler>,
    ) =>
      orders.includes(order)
        ? this._modify(
            handler,
            modifiers,
            {
              ...options,
              orders: order,
            },
            result,
          )
        : result;

    const result = maybe('post', maybe('normal', maybe('pre')));
    if (!result)
      throw new Error(
        'No result was returned from modify. Did you set the orders correctly?',
      );

    return result;
  }

  private _modify<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    handler: THandler | ModifierResult<TMeta, THandler>,
    modifiers: Modifier<TMeta>[],
    options: ModifyOptions<TMeta, THandler> = {},
    pastResult?: ModifierResult<TMeta, THandler>,
  ): ModifierResult<TMeta, THandler> {
    const { orders, transform = DEFAULT_MODIFY_TRANSFORM } = options;
    // let { transform } = options;

    if (Type.isNullOrUndefined(orders))
      throw new Error('Missing orders for `_modify` method!');

    if (Type.isArray(orders))
      throw new TypeError(
        'Expected orders to be a string in `_modify` method!',
      );

    // if (!transform)
    //   transform = (current, modified) => ({
    //     ...modified,
    //     meta: modified.meta
    //       ? {
    //           ...current.meta,
    //           ...modified.meta,
    //         }
    //       : current.meta,
    //     identifier: current.identifier
    //       ? current.identifier.concat(':', modified.identifier)
    //       : modified.identifier,
    //   });

    const result = modifiers.reduce(
      (result, modifier) => {
        const modifierFactory = this.get(
          orders as ModifierOrder,
          modifier.name,
        );

        if (!Type.isNullOrUndefined(orders) && !modifierFactory) return result;
        if (!modifierFactory)
          throw new Error(`The modifier "${modifier.name}" does not exists.`);

        const modified = modifierFactory(result.handler, {
          ...Obj.merge(result.meta, modifier.meta),
          modifierName: modifier.name,
        }) as ModifierResult<TMeta, THandler>;

        return transform(result, modified);
      },
      pastResult
        ? pastResult
        : ({
            handler,
          } as ModifierResult<TMeta, THandler>),
    );

    return result;
  }

  public has(order: ModifierOrder, modifier: string): boolean;
  public has(modifier: string): boolean;
  public has(...args: any[]): boolean {
    const [order, modifier] =
      args.length >= 2
        ? args
        : (['normal', ...args] as [ModifierOrder, string]);

    return withOrder(order, (factories) => Reflect.has(factories, modifier));
  }

  public find(modifier: string): ModifierFactory | undefined {
    return getOrders().reduce((result, factories) => {
      if (Reflect.has(factories, modifier)) return factories[modifier];
      return result;
    }, undefined as ModifierFactory | undefined);
  }

  public get(
    order: ModifierOrder,
    modifier: string,
  ): ModifierFactory | undefined;
  public get(modifier: string): ModifierFactory | undefined;
  public get(...args: any[]): ModifierFactory | undefined {
    const [order, modifier] =
      args.length >= 2
        ? args
        : (['normal', ...args] as [ModifierOrder | ModifierOrder[], string]);

    return withOrder(order, (factories) => factories[modifier]);
  }

  /**
   * This static method registers a new modifier function.
   *
   * A modifier function takes the original handler function and internal modifier meta information as arguments, and returns a {@link ModifierResult} object containing the modified function, its identifier, and optional meta information.
   *
   * @param {string} modifier - The unique name for the modifier.
   * @param {ModifierFactory<THandler>} factory - The function that creates the modified result based on the original handler and meta information.
   * @throws {TypeError} If the provided factory parameter is not a function.
   *
   * @example
   * ```typescript
   * // Example modifier factory that logs a message before calling the original handler
   * const logBeforeFactory: ModifierFactory = (handler, meta) => {
   *   return {
   *     handler: (arg) => { // Wrap the original handler with logging
   *       console.log("Log before:", arg);
   *       return handler(arg);
   *     },
   *     identifier: "with-log-before",
   *   };
   * };
   *
   * // Register the modifier using the factory function
   * QueryHandlerModifiers.register("logBefore", logBeforeFactory);
   * ```
   */
  public register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    order: ModifierOrder,
    modifier: string,
    factory: ModifierFactory<TMeta, THandler>,
  ): this;
  public register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(modifier: string, factory: ModifierFactory<TMeta, THandler>): this;
  public register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(...args: any[]): this {
    const [order, modifier, factory] =
      args.length >= 3
        ? args
        : (['normal', ...args] as [
            ModifierOrder,
            string,
            ModifierFactory<TMeta, THandler>,
          ]);

    if (typeof factory !== 'function')
      throw new TypeError('Expected factory parameter to be a function!');

    withOrder(
      order,
      (factories) => (factories[modifier] = factory as AnyFunction),
    );

    return this;
  }

  public unregister(order: ModifierOrder, modifier: string): void {
    return QueryHandlerModifiers.unregister(order, modifier);
  }
}
