/**
 * Trap Focus Directive - Focus trap within an element
 * 
 * Traps keyboard focus within a container element.
 * Allows navigation with Tab/Shift+Tab but cycles within the container.
 */

import { Directive } from '../directive';
import { DirectiveRegistry } from '../directive-registry';

export interface TrapFocusOptions {
  /**
   * CSS selector for focusable elements (default includes common focusable elements)
   */
  selector?: string;
  /**
   * Whether the trap is active
   */
  active?: boolean;
}

const DEFAULT_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Directive that traps focus within an element
 */
export class TrapFocusDirective extends Directive<HTMLElement, boolean | TrapFocusOptions> {
  private _selector: string = DEFAULT_SELECTOR;
  private _active: boolean = true;
  private _handleKeyDown: ((e: KeyboardEvent) => void) | null = null;

  mount(value: boolean | TrapFocusOptions): void {
    this._parseOptions(value);
    if (this._active) {
      this._attachTrap();
    }
  }

  update(value: boolean | TrapFocusOptions): void {
    const wasActive = this._active;
    this._parseOptions(value);

    if (this._active && !wasActive) {
      this._attachTrap();
    } else if (!this._active && wasActive) {
      this._detachTrap();
    }
  }

  unmount(): void {
    this._detachTrap();
  }

  private _parseOptions(value: boolean | TrapFocusOptions): void {
    if (typeof value === 'boolean') {
      this._active = value;
      this._selector = DEFAULT_SELECTOR;
    } else if (value) {
      this._active = value.active !== false;
      this._selector = value.selector || DEFAULT_SELECTOR;
    } else {
      this._active = false;
    }
  }

  private _attachTrap(): void {
    this._handleKeyDown = this._onKeyDown.bind(this);
    this.element.addEventListener('keydown', this._handleKeyDown);
  }

  private _detachTrap(): void {
    if (this._handleKeyDown) {
      this.element.removeEventListener('keydown', this._handleKeyDown);
      this._handleKeyDown = null;
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusableElements = this.element.querySelectorAll<HTMLElement>(this._selector);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement || document.activeElement === this.element) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
}

// Register the directive
DirectiveRegistry.register('trap-focus', TrapFocusDirective);
