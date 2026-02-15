/**
 * Overlay Directive - Manages overlay/Modal display
 *
 * Moves element to container (default: body), creates an overlay element before it,
 * and applies inert behavior to block all DOM interaction.
 * Supports multilayered overlays with automatic z-index management.
 */

import { Directive } from '../directive';
import { DirectiveRegistry } from '../directive-registry';
import { Type } from '@/modules/primitives';

// Import inert level functions for shared reference counting with inert directive
import { incrementInertLevel, decrementInertLevel, getInertLevel } from './inert';

export interface OverlayOptions {
  /**
   * Whether the overlay is visible/open
   */
  open?: boolean;
  /**
   * CSS class to add to overlay element (default: 'is-overlay-open')
   */
  className?: string;
  /**
   * CSS selector for container element (default: 'body')
   */
  container?: string;
  /**
   * Base z-index for the overlay (default: 1000)
   */
  zIndex?: number;
  /**
   * Additional data attributes to set on overlay element
   */
  dataAttrs?: Record<string, string>;
  /**
   * Callback when overlay opens
   */
  onOpen?: () => void;
  /**
   * Callback when overlay closes
   */
  onClose?: () => void;
}

const DEFAULT_CLASS = 'is-overlay-open';
const DEFAULT_CONTAINER = 'body';
const DEFAULT_Z_INDEX = 1000;

/**
 * Reset overlay level counter (useful for testing)
 */
export function resetOverlayLevel(): void {
  // This is now handled by the inert directive's resetInertLevel
}

/**
 * Directive that manages overlay visibility
 */
export class OverlayDirective extends Directive<HTMLElement, boolean | OverlayOptions> {
  private _open: boolean = false;
  private _className: string = DEFAULT_CLASS;
  private _container: string = DEFAULT_CONTAINER;
  private _zIndex: number = DEFAULT_Z_INDEX;
  private _dataAttrs: Record<string, string> = {};
  private _onOpen: (() => void) | null = null;
  private _onClose: (() => void) | null = null;
  private _previousFocus: HTMLElement | null = null;

  // References for cleanup
  private _overlayElement: HTMLElement | null = null;
  private _originalParent: HTMLElement | null = null;
  private _originalNextSibling: HTMLElement | null = null;
  private _currentLevel: number = 0;
  private _inertElements: HTMLElement[] = [];
  private _previousOverflow: string = '';

  mount(value: boolean | OverlayOptions): void {
    this._parseOptions(value);
    if (this._open) {
      this._show();
    }
  }

  update(value: boolean | OverlayOptions): void {
    const wasOpen = this._open;
    this._parseOptions(value);

    if (this._open && !wasOpen) {
      this._show();
    } else if (!this._open && wasOpen) {
      this._hide();
    }
  }

  unmount(): void {
    this._hide();
  }

  private _parseOptions(value: boolean | OverlayOptions): void {
    if (Type.isBoolean(value)) {
      this._open = value;
      this._className = DEFAULT_CLASS;
      this._container = DEFAULT_CONTAINER;
      this._zIndex = DEFAULT_Z_INDEX;
      this._dataAttrs = {};
      this._onOpen = null;
      this._onClose = null;
    } else if (value && typeof value === 'object') {
      const opts = value as OverlayOptions;
      this._open = opts.open || false;
      this._className = opts.className || DEFAULT_CLASS;
      this._container = opts.container || DEFAULT_CONTAINER;
      this._zIndex = opts.zIndex || DEFAULT_Z_INDEX;
      this._dataAttrs = opts.dataAttrs || {};
      this._onOpen = opts.onOpen || null;
      this._onClose = opts.onClose || null;
    } else {
      this._open = false;
    }
  }

  private _show(): void {
    // Save current focus to restore later
    this._previousFocus = document.activeElement as HTMLElement;

    // Save original parent and next sibling for potential future restore
    this._originalParent = this.element.parentElement as HTMLElement;
    this._originalNextSibling = this.element.nextElementSibling as HTMLElement | null;

    // Get container element
    const container = document.querySelector(this._container) as HTMLElement | null;
    if (!container) {
      console.warn(`Overlay directive: Container '${this._container}' not found.`);
      return;
    }

    // Move element to container
    container.appendChild(this.element);

    // Get next overlay level for stacking
    this._currentLevel = incrementInertLevel();

    // Create overlay element
    this._overlayElement = document.createElement('div');
    this._overlayElement.className = this._className;
    this._overlayElement.setAttribute('data-overlay', 'true');
    this._overlayElement.setAttribute('data-level', String(this._currentLevel));
    this._overlayElement.setAttribute('data-inert-exclude', 'true'); // Exclude from inert

    // Set data attributes
    for (const [key, val] of Object.entries(this._dataAttrs)) {
      this._overlayElement.setAttribute(`data-${key}`, val);
    }

    // Set z-index for overlay and element
    const zIndex = this._zIndex + this._currentLevel;
    this._overlayElement.style.position = 'fixed';
    this._overlayElement.style.top = '0';
    this._overlayElement.style.left = '0';
    this._overlayElement.style.width = '100%';
    this._overlayElement.style.height = '100%';
    this._overlayElement.style.zIndex = String(zIndex - 1);

    this.element.style.position = 'relative';
    this.element.style.zIndex = String(zIndex);
    this.element.setAttribute('data-inert-exclude', 'true'); // Exclude from inert

    // Insert overlay before element in container
    container.insertBefore(this._overlayElement, this.element);

    // Apply inert to container's children (except overlay and target)
    this._inertElements = this._applyInertToChildren(container, [this._overlayElement, this.element]);

    // Lock body scroll (first layer only)
    if (getInertLevel() === 1) {
      this._previousOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }

    // Make element visible
    this.element.style.display = '';
    this.element.removeAttribute('hidden');
    this.element.setAttribute('aria-hidden', 'false');

    // Focus the overlay or first focusable element
    const focusable = this.element.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    } else {
      this.element.focus();
    }

    // Emit custom event
    this._dispatchEvent('overlay:open', {
      element: this.element,
      overlay: this._overlayElement,
      level: this._currentLevel,
    });

    // Trigger callback
    if (this._onOpen) {
      this._onOpen();
    }
  }

  private _hide(): void {
    // Get container element
    const container = document.querySelector(this._container) as HTMLElement | null;

    // Remove overlay element
    if (this._overlayElement && this._overlayElement.parentNode) {
      this._overlayElement.parentNode.removeChild(this._overlayElement);
      this._overlayElement = null;
    }

    // Remove inert from container
    if (container) {
      container.inert = false;
    }

    // Remove inert behavior from element
    this.element.inert = false;
    this.element.style.pointerEvents = '';

    // Remove inline styles we added
    this.element.style.position = '';
    this.element.style.zIndex = '';

    // Hide overlay
    this.element.style.display = 'none';
    this.element.setAttribute('hidden', '');
    this.element.setAttribute('aria-hidden', 'true');

    // Release overlay level
    const levelAfterDecrement = decrementInertLevel();
    this._currentLevel = 0;

    // Remove inert from elements
    this._removeInertFromElements();

    // Unlock scroll only if this was the last layer
    if (levelAfterDecrement === 0) {
      document.body.style.overflow = this._previousOverflow;
      this._previousOverflow = '';
    }

    // Restore focus
    if (this._previousFocus && this._previousFocus.focus) {
      this._previousFocus.focus();
      this._previousFocus = null;
    }

    // Emit custom event
    this._dispatchEvent('overlay:close', {
      element: this.element,
    });

    // Trigger callback
    if (this._onClose) {
      this._onClose();
    }
  }

  private _dispatchEvent(type: string, detail: Record<string, unknown>): void {
    const event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail,
    });
    this.element.dispatchEvent(event);
  }

  private _applyInertToChildren(container: HTMLElement, exclude: HTMLElement[]): HTMLElement[] {
    const inertElements: HTMLElement[] = [];
    const children = container.querySelectorAll<HTMLElement>('*');

    children.forEach((child) => {
      // Skip if element should be excluded
      if (child.hasAttribute('data-inert-exclude')) {
        return;
      }

      // Skip if element is in exclude list
      if (exclude.includes(child)) {
        return;
      }

      // Skip if element contains any of the excluded elements
      for (const ex of exclude) {
        if (child.contains(ex)) {
          return;
        }
      }

      // Apply inert
      child.inert = true;
      inertElements.push(child);
    });

    return inertElements;
  }

  private _removeInertFromElements(): void {
    this._inertElements.forEach((el) => {
      el.inert = false;
    });
    this._inertElements = [];
  }
}

// Register the directive
DirectiveRegistry.register('overlay', OverlayDirective);
