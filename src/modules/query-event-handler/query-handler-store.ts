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

export class QueryHandlerStore {
  private static _handlers: WeakMap<AnyFunction, HandlerMapping> = new Map();

  /**
   * Checks if a given handler function or mapped handler data already exists in the store.
   *
   * @param {AnyFunction} handler - The handler function to check for existence, or data containing the original handler.
   * @returns {boolean} True if the handler function or mapped data exists, false otherwise.
   */
  public static exists(handler: AnyFunction): boolean {
    return QueryHandlerStore._handlers.has(handler);
  }

  /**
   * Checks if a specific handler is mapped to an identifier for a given original handler function.
   *
   * @param {MappedHandlerData} data - Data containing the identifier and original handler to check.
   * @returns {boolean} True if the handler is mapped to the identifier, false otherwise.
   */
  public static has({
    identifier,
    originalHandler,
  }: MappedHandlerData): boolean {
    const handlers = QueryHandlerStore._handlers.get(originalHandler);
    return !!handlers && handlers.has(identifier);
  }

  /**
   * Retrieves a mapped handler function associated with an identifier and original handler.
   *
   * @param {MappedHandlerData} data - Data containing the identifier and original handler to retrieve the handler for.
   * @returns {THandler | undefined} The mapped handler function of type THandler, or undefined if not found.
   */
  public static get<THandler extends AnyFunction = AnyFunction>({
    identifier,
    originalHandler,
  }: MappedHandlerData): THandler | undefined {
    const handlers = QueryHandlerStore._handlers.get(originalHandler);

    if (!handlers) return;

    return handlers.get(identifier) as THandler;
  }

  /**
   * Adds a new mapping between an identifier and a handler function for a specified original handler.
   * The new handler function wraps the original one, allowing for additional logic or modifications before or after the original handler's execution.
   * 
   * @param {AddMappedHandlerData} data - Data containing the identifier, original handler, and the new handler function to add.
   * @returns {QueryHandlerStore} The QueryHandlerStore instance for chaining purposes.
   * 
   * @example
   * ```typescript
   * // Adding a handler for the "fetch-data" identifier that logs before calling the original handler
   * QueryHandlerStore.add({
   *   identifier: "fetch-data",
   *   originalHandler: originalFetchHandler,
   *   handler: (query) => {
   *     console.log("Fetching data for query:", query);
   *     return originalFetchHandler(query);
     }
   * });
   * ```
   * 
   * @example
   * ```typescript
   * // Creating a new mapping for a "search-products" handler that post-processes results
   * QueryHandlerStore.add({
   *   identifier: "search-products",
   *   originalHandler: searchProducts,
   *   handler: (searchTerm) => {
   *     const results = searchProducts(searchTerm);
   *     return results.map((product) => ({ ...product, discount: 0.1 })); // Apply a 10% discount
     }
   * });
   * ```
   */

  public static add({
    identifier,
    originalHandler,
    handler,
  }: AddMappedHandlerData): void {
    if (QueryHandlerStore.exists(originalHandler)) {
      const handlers = QueryHandlerStore._handlers.get(
        originalHandler,
      ) as HandlerMapping;

      if (handlers.has(identifier)) return;

      handlers.set(identifier, handler);

      return;
    }

    QueryHandlerStore._handlers.set(
      originalHandler,
      new Map([[identifier, handler]]),
    );
  }

  /**
   * Removes a mapped handler function associated with an identifier and original handler.
   *
   * @param {MappedHandlerData} data - Data containing the identifier and original handler to remove the mapping for.
   * @returns {AnyFunction | undefined} The removed handler function if successful, undefined otherwise.
   */
  public static remove({
    identifier,
    originalHandler,
  }: MappedHandlerData): AnyFunction | undefined {
    const handlers = QueryHandlerStore._handlers.get(originalHandler);
    if (!handlers || !handlers.has(identifier)) return;

    const result = handlers.get(identifier);
    handlers.delete(identifier);

    if (handlers.size === 0)
      QueryHandlerStore._handlers.delete(originalHandler);

    return result;
  }

  /**
   * Removes all mappings associated with a given handler function.
   *
   * @param {AnyFunction} handler - The handler function to remove mappings for.
   */
  public static clear(handler: AnyFunction) {
    QueryHandlerStore._handlers.delete(handler);
  }

  /**
   * Clears all mappings from the internal WeakMap.
   *
   * This method effectively discards the current WeakMap instance and creates a new empty one. This approach ensures all existing mappings are removed.
   *
   * Note that creating a new WeakMap might not immediately trigger garbage collection for objects involved in circular references.
   */
  public static clearAll() {
    QueryHandlerStore._handlers = new WeakMap();
  }
}
