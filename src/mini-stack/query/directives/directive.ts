/**
 * Directive - Base class for all directives
 * 
 * All directives must extend this class to participate in the lifecycle
 * management system.
 */

export abstract class Directive<T extends Element = Element, TValue = any> {
  public readonly element: T;

  constructor(element: T) {
    this.element = element;
  }

  /**
   * Called when the directive is first mounted to an element
   */
  mount?(value: TValue): void;

  /**
   * Called when the directive's value changes
   */
  update?(value: TValue): void;

  /**
   * Called when the directive is unmounted or value is changed
   */
  unmount?(): void;
}

/**
 * Type for a Directive class constructor
 */
export type DirectiveClass<T extends Element = Element, TValue = any> = new (
  element: T,
) => Directive<T, TValue>;

/**
 * Check if a value is a Directive class constructor
 */
export function isDirectiveClass(
  value: unknown,
): value is DirectiveClass<any, any> {
  return (
    typeof value === 'function' &&
    value.prototype instanceof Directive
  );
}

/**
 * Check if a value is a reactive source (signal, observable, etc.)
 * Uses duck typing to detect .subscribe() method
 */
export function isReactiveSource<T = any>(value: unknown): value is { subscribe: (cb: (v: T) => void) => () => void; getValue?: () => T } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any)?.subscribe === 'function'
  );
}

/**
 * Extract current value from a reactive source.
 * Supports: .getValue() (RxJS BehaviorSubject), .value (Preact Signals), .peek() (Preact Signals untracked)
 */
export function getReactiveValue<T = any>(source: any): T | undefined {
  if (typeof source.getValue === 'function') return source.getValue();
  if ('value' in source) return source.value;
  return undefined;
}
