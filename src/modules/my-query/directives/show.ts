/**
 * Show Directive - Toggle element visibility
 * 
 * Equivalent to Vue's v-show directive.
 * Controls element visibility using CSS display property.
 */

import { Directive } from '../directive';
import { DirectiveRegistry } from '../directive-registry';

/**
 * Directive that toggles element visibility
 */
export class ShowDirective extends Directive<HTMLElement, boolean> {
  private _previousDisplay: string | null = null;

  mount(value: boolean): void {
    this.update(value);
  }

  update(value: boolean): void {
    if (value) {
      // Show element - restore previous display or default to empty (browser default)
      if (this._previousDisplay !== null) {
        this.element.style.display = this._previousDisplay;
      } else {
        this.element.style.display = '';
      }
    } else {
      // Hide element - save current display and set to none
      // Only save if not already hidden
      if (this.element.style.display !== 'none') {
        this._previousDisplay = this.element.style.display || null;
      }
      this.element.style.display = 'none';
    }
  }

  unmount(): void {
    // Restore original display value
    if (this._previousDisplay !== null) {
      this.element.style.display = this._previousDisplay;
    } else {
      this.element.style.display = '';
    }
    this._previousDisplay = null;
  }
}

// Register the directive
DirectiveRegistry.register('show', ShowDirective);
