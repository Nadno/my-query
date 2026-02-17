/**
 * Directive Types - my-query
 * 
 * Type definitions for the class-based directive system.
 */

import { Directive, DirectiveClass, isDirectiveClass, isReactiveSource } from '@/mini-stack/query/directives/directive';

// Re-export from module
export type { Directive, DirectiveClass };
export { isDirectiveClass, isReactiveSource };

// ========== REACTIVE SOURCE ==========

/**
 * Interface for reactive source (signals, observables, etc.)
 * Uses duck typing to detect reactive systems
 */
export interface ReactiveSource<T = any> {
  subscribe: (callback: (value: T) => void) => () => void;
  getValue?: () => T;
  value?: T;
}

// ========== DIRECTIVE INSTANCE ==========

/**
 * Managed directive instance stored in the WeakMap
 */
export interface DirectiveInstance<T = any> {
  id: string;
  name: string;
  directive: DirectiveClass;
  instance: Directive;
  value: T;
  unsubscribe?: () => void;
}

// ========== QUERY DIRECTIVE INTERFACE ==========

/**
 * Extension to IMyQuery for directive support
 */
export interface IQueryDirective<_T extends Element> {
  /**
   * Apply a registered directive by name
   * @param name - Directive registered name
   * @param value - Value to pass to the directive
   */
  directive(name: string, value?: any): this;

  /**
   * Apply a directive class directly
   * @param directiveClass - Directive class constructor
   * @param value - Value to pass to the directive
   */
  directive(directiveClass: DirectiveClass, value?: any): this;
}

// ========== REGISTRY TYPES ==========

/**
 * Directive registration options
 */
export interface DirectiveRegistrationOptions {
  name: string;
  directive: DirectiveClass;
}

/**
 * Directive resolved from registry
 */
export type ResolvedDirective = {
  name: string;
  class: DirectiveClass;
};
