/**
 * Roving Index Directive - Roving tabindex pattern
 * 
 * Implements the roving tabindex pattern for navigable element groups.
 * Only the active element has tabindex="0", others have tabindex="-1".
 * Supports keyboard navigation with arrow keys.
 */

import { Directive } from '../directive';
import { DirectiveRegistry } from '../directive-registry';

export interface RovingIndexOptions {
  /**
   * Current active index
   */
  index: number;
  /**
   * CSS selector for items in the group
   */
  items?: string;
  /**
   * Direction of navigation: 'horizontal' | 'vertical' | 'both' (default: 'horizontal')
   */
  direction?: 'horizontal' | 'vertical' | 'both';
  /**
   * Loop navigation when reaching end (default: true)
   */
  loop?: boolean;
}

const DEFAULT_ITEMS = '[data-roving-index-item], [role="option"], li, button';

/**
 * Directive that implements roving tabindex pattern
 */
export class RovingIndexDirective extends Directive<HTMLElement, number | RovingIndexOptions> {
  private _index: number = 0;
  private _itemsSelector: string = DEFAULT_ITEMS;
  private _direction: 'horizontal' | 'vertical' | 'both' = 'horizontal';
  private _loop: boolean = true;
  private _handleKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private _handleFocusIn: (() => void) | null = null;
  private _items: HTMLElement[] = [];

  mount(value: number | RovingIndexOptions): void {
    this._parseOptions(value);
    this._attachListeners();
    this._updateItems();
    this._setActiveIndex(this._index);
  }

  update(value: number | RovingIndexOptions): void {
    const oldIndex = this._index;
    this._parseOptions(value);
    this._updateItems();

    if (this._index !== oldIndex) {
      this._setActiveIndex(this._index);
    }
  }

  unmount(): void {
    this._detachListeners();
    this._resetTabindex();
  }

  private _parseOptions(value: number | RovingIndexOptions): void {
    if (typeof value === 'number') {
      this._index = Math.max(0, value);
      this._itemsSelector = DEFAULT_ITEMS;
      this._direction = 'horizontal';
      this._loop = true;
    } else if (value) {
      this._index = typeof value.index === 'number' ? Math.max(0, value.index) : 0;
      this._itemsSelector = value.items || DEFAULT_ITEMS;
      this._direction = value.direction || 'horizontal';
      this._loop = value.loop !== false;
    } else {
      this._index = 0;
    }
  }

  private _attachListeners(): void {
    this._handleKeyDown = this._onKeyDown.bind(this);
    this._handleFocusIn = this._onFocusIn.bind(this);

    this.element.addEventListener('keydown', this._handleKeyDown);
    this.element.addEventListener('focusin', this._handleFocusIn);
  }

  private _detachListeners(): void {
    if (this._handleKeyDown) {
      this.element.removeEventListener('keydown', this._handleKeyDown);
      this._handleKeyDown = null;
    }
    if (this._handleFocusIn) {
      this.element.removeEventListener('focusin', this._handleFocusIn);
      this._handleFocusIn = null;
    }
  }

  private _updateItems(): void {
    this._items = Array.from(
      this.element.querySelectorAll<HTMLElement>(this._itemsSelector)
    ).filter((el) => {
      // Skip hidden elements
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (!this._isNavigationKey(e.key)) return;

    this._updateItems();
    if (this._items.length === 0) return;

    const currentIndex = this._getCurrentIndex();
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = currentIndex + 1;
      if (newIndex >= this._items.length) {
        newIndex = this._loop ? 0 : currentIndex;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowTop') {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = this._loop ? this._items.length - 1 : currentIndex;
      }
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      this._index = newIndex;
      this._setActiveIndex(newIndex);
      this._items[newIndex]?.focus();
    }
  }

  private _onFocusIn(): void {
    // Update index when focus enters
    const currentIndex = this._getCurrentIndex();
    if (currentIndex >= 0 && currentIndex !== this._index) {
      this._index = currentIndex;
      this._setActiveIndex(currentIndex);
    }
  }

  private _isNavigationKey(key: string): boolean {
    const isHorizontal =
      this._direction === 'horizontal' || this._direction === 'both';
    const isVertical =
      this._direction === 'vertical' || this._direction === 'both';

    if (isHorizontal && (key === 'ArrowRight' || key === 'ArrowLeft')) {
      return true;
    }
    if (isVertical && (key === 'ArrowDown' || key === 'ArrowTop')) {
      return true;
    }
    return false;
  }

  private _getCurrentIndex(): number {
    const activeElement = document.activeElement as HTMLElement;
    return this._items.indexOf(activeElement);
  }

  private _setActiveIndex(index: number): void {
    this._items.forEach((item, i) => {
      if (i === index) {
        item.setAttribute('tabindex', '0');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  private _resetTabindex(): void {
    this._items.forEach((item) => {
      item.removeAttribute('tabindex');
    });
  }
}

// Register the directive
DirectiveRegistry.register('roving-index', RovingIndexDirective);
