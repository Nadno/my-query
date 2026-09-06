/**
 * Model Directive - Two-way binding for form inputs
 *
 * Binds a reactive source (signal) to an input/select/textarea element.
 * Handles both downward (signal → DOM) and upward (DOM → signal) updates.
 *
 * Declares `rawReactive = true` so it receives the signal object directly
 * instead of the unwrapped value.
 */

import { Directive } from '../directive';
import { isReactiveSource } from '../directive';
import { DirectiveRegistry } from '../directive-registry';

export class ModelDirective extends Directive<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
> {
  static rawReactive = true;

  private _unsubscribe?: () => void;
  private _handler?: EventListener;
  private _event?: string;

  mount(source: any): void {
    if (!isReactiveSource(source)) {
      this.element.value = String(source ?? '');
      return;
    }

    // Downward: signal → DOM
    this._unsubscribe = source.subscribe((value: any) => {
      const el = this.element;
      if ((el as HTMLInputElement).type === 'checkbox') {
        (el as HTMLInputElement).checked = !!value;
      } else {
        el.value = String(value ?? '');
      }
    });

    // Upward: DOM → signal
    this._event =
      this.element.tagName === 'SELECT' ||
      (this.element as HTMLInputElement).type === 'checkbox'
        ? 'change'
        : 'input';

    this._handler = () => {
      const el = this.element;
      if ((el as HTMLInputElement).type === 'checkbox') {
        source.value = (el as HTMLInputElement).checked;
      } else if ((el as HTMLInputElement).type === 'number') {
        source.value = el.value === '' ? '' : Number(el.value);
      } else {
        source.value = el.value;
      }
    };

    this.element.addEventListener(this._event, this._handler);
  }

  unmount(): void {
    this._unsubscribe?.();
    if (this._handler && this._event) {
      this.element.removeEventListener(this._event, this._handler);
    }
  }
}

DirectiveRegistry.register('model', ModelDirective);
