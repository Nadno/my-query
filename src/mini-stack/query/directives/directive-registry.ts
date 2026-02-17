/**
 * Directive Registry - Static registry for directive classes
 * 
 * Allows registering directives by name for later use via string reference.
 */

import { DirectiveClass } from './directive';

/**
 * Internal storage for registered directives
 */
const _directives = new Map<string, DirectiveClass>();

/**
 * Static registry for directive classes
 */
export class DirectiveRegistry {
  private constructor() {}

  /**
   * Register a directive with a name
   * @param name - Unique identifier for the directive
   * @param directive - Directive class constructor
   * @returns The DirectiveRegistry class for chaining
   */
  static register(
    name: string,
    directive: any,
  ): typeof DirectiveRegistry {
    _directives.set(name, directive);
    return DirectiveRegistry;
  }

  /**
   * Get a registered directive by name
   * @param name - Directive identifier
   * @returns The directive class or undefined if not found
   */
  static get(name: string): any {
    return _directives.get(name);
  }

  /**
   * Check if a directive is registered
   * @param name - Directive identifier
   * @returns True if registered
   */
  static has(name: string): boolean {
    return _directives.has(name);
  }

  /**
   * Remove a directive from registry
   * @param name - Directive identifier
   * @returns True if removed
   */
  static unregister(name: string): boolean {
    return _directives.delete(name);
  }

  /**
   * Clear all registered directives
   */
  static clear(): void {
    _directives.clear();
  }

  /**
   * Get all registered directive names
   */
  static get names(): string[] {
    return Array.from(_directives.keys());
  }
}
