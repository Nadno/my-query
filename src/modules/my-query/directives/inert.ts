/**
 * Inert Directive - Makes elements non-interactive
 *
 * Applies inert to individual elements (not the container itself):
 * - Finds all elements in container
 * - Excludes the target element and overlay element
 * - Applies inert to all other elements
 * - Supports reference counting for multiple layers
 * - Supports scroll lock
 */

import { Directive } from '../directive';
import { DirectiveRegistry } from '../directive-registry';
import { Type } from '@/modules/primitives';

export interface InertOptions {
  /**
   * Whether to apply inert behavior
   */
  active?: boolean;
  /**
   * CSS selector for container (default: 'body')
   */
  container?: string;
  /**
   * CSS selector for elements to exclude from inert (e.g., '.overlay, .modal')
   */
  exclude?: string;
  /**
   * Whether to lock body scroll (default: true)
   */
  lockScroll?: boolean;
  /**
   * Callback when inert is activated
   */
  onActivate?: () => void;
  /**
   * Callback when inert is deactivated
   */
  onDeactivate?: () => void;
}

const DEFAULT_CONTAINER = 'body';

/**
 * Static counter for managing inert layers
 */
let _inertLevel = 0;

export function incrementInertLevel(): number {
  return ++_inertLevel;
}

export function decrementInertLevel(): number {
  if (_inertLevel > 0) {
    _inertLevel--;
  }
  return _inertLevel;
}

export function getInertLevel(): number {
  return _inertLevel;
}

export function resetInertLevel(): void {
  _inertLevel = 0;
}

/**
 * Directive that makes elements non-interactive
 */
export class InertDirective extends Directive<HTMLElement, boolean | InertOptions> {
  private _active: boolean = false;
  private _container: string = DEFAULT_CONTAINER;
  private _exclude: string = '';
  private _lockScroll: boolean = true;
  private _onActivate: (() => void) | null = null;
  private _onDeactivate: (() => void) | null = null;

  // State
  private _containerElement: HTMLElement | null = null;
  private _inertElements: HTMLElement[] = [];
  private _previousOverflow: string = '';

  mount(value: boolean | InertOptions): void {
    this._parseOptions(value);
    if (this._active) {
      this._activate();
    }
  }

  update(value: boolean | InertOptions): void {
    const wasActive = this._active;
    this._parseOptions(value);

    if (this._active && !wasActive) {
      this._activate();
    } else if (!this._active && wasActive) {
      this._deactivate();
    }
  }

  unmount(): void {
    this._deactivate();
  }

  private _parseOptions(value: boolean | InertOptions): void {
    if (Type.isBoolean(value)) {
      this._active = value;
      this._container = DEFAULT_CONTAINER;
      this._exclude = '';
      this._lockScroll = true;
      this._onActivate = null;
      this._onDeactivate = null;
    } else if (value && Type.isObject(value)) {
      const opts = value as InertOptions;
      this._active = opts.active || false;
      this._container = opts.container || DEFAULT_CONTAINER;
      this._exclude = opts.exclude || '';
      this._lockScroll = opts.lockScroll !== false;
      this._onActivate = opts.onActivate || null;
      this._onDeactivate = opts.onDeactivate || null;
    } else {
      this._active = false;
    }
  }

  private _activate(): void {
    this._containerElement = document.querySelector(this._container) as HTMLElement | null;
    if (!this._containerElement) {
      console.warn(`Inert directive: Container '${this._container}' not found.`);
      return;
    }

    const wasInactive = getInertLevel() === 0;
    incrementInertLevel();

    // Apply inert to all children except excluded elements
    this._inertElements = this._applyInertToChildren();

    // Lock scroll if requested and this is the first layer
    if (this._lockScroll && wasInactive) {
      this._previousOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }

    // Dispatch event
    this._dispatchEvent('inert:activate', {
      element: this.element,
      container: this._containerElement,
      level: getInertLevel(),
    });

    if (this._onActivate) {
      this._onActivate();
    }
  }

  private _applyInertToChildren(): HTMLElement[] {
    if (!this._containerElement) return [];

    const inertElements: HTMLElement[] = [];
    const children = this._containerElement.querySelectorAll<HTMLElement>('*');

    // Build exclusion selector
    const excludeSelector = this._exclude 
      ? `${this._exclude}, [data-inert-exclude="true"]`
      : '[data-inert-exclude="true"]';

    children.forEach((child) => {
      // Skip if element should be excluded
      if (child.matches(excludeSelector) || child.hasAttribute('data-inert-exclude')) {
        return;
      }

      // Skip if element is the directive's target
      if (child === this.element) {
        return;
      }

      // Skip if element contains the target
      if (this.element && child.contains(this.element)) {
        return;
      }

      // Apply inert
      child.inert = true;
      inertElements.push(child);
    });

    return inertElements;
  }

  private _deactivate(): void {
    const levelAfterDecrement = decrementInertLevel();

    // Remove inert only if this was the last layer
    if (levelAfterDecrement === 0) {
      this._removeInertFromChildren();
    }

    // Unlock scroll only if this was the last layer
    if (this._lockScroll && levelAfterDecrement === 0) {
      document.body.style.overflow = this._previousOverflow;
      this._previousOverflow = '';
    }

    // Dispatch event
    this._dispatchEvent('inert:deactivate', {
      element: this.element,
      level: levelAfterDecrement,
    });

    if (this._onDeactivate) {
      this._onDeactivate();
    }

    this._containerElement = null;
    this._inertElements = [];
  }

  private _removeInertFromChildren(): void {
    this._inertElements.forEach((el) => {
      el.inert = false;
    });
    this._inertElements = [];
  }

  private _dispatchEvent(type: string, detail: Record<string, unknown>): void {
    const event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail,
    });
    this.element.dispatchEvent(event);
  }
}

// Register the directive
DirectiveRegistry.register('inert', InertDirective);
