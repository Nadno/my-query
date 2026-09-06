/**
 * If Directive - Conditional DOM mount/unmount
 *
 * Unlike `show` (which toggles display), `if` removes/inserts the element
 * from the DOM entirely. A comment node placeholder keeps the position.
 */

import { ReactiveSource } from '@/types/directive';
import { Directive, isReactiveSource } from '../directive';
import { DirectiveRegistry } from '../directive-registry';

export class IfDirective extends Directive<HTMLElement, boolean> {
  private _placeholder: Comment;
  private _value: ReactiveSource<boolean> | boolean = false;

  constructor(element: HTMLElement) {
    super(element);
    console.log('***IF_CONSTRUCTOR', element);
    this._placeholder = document.createComment('if');
  }

  mount(value: ReactiveSource<boolean> | boolean): void {
    this._value = value;

    if (isReactiveSource(value)) {
      console.log('***IF_SUBSCRIBE:', value.value);
      value.subscribe((newValue) => {
        this.update(newValue);
      });
      this.update(value.value);
      return;
    }

    this.update(value);
  }

  update(value: boolean): void {
    requestAnimationFrame(() => {
      if (value) {
        if (this._placeholder.parentNode) {
          this._placeholder.parentNode.replaceChild(
            this.element,
            this._placeholder,
          );
        }
      } else {
        if (this.element.parentNode) {
          this.element.parentNode.replaceChild(this._placeholder, this.element);
        }
      }
    });
  }

  unmount(): void {
    if (this._placeholder.parentNode) {
      this._placeholder.parentNode.replaceChild(
        this.element,
        this._placeholder,
      );
    }
  }
}

DirectiveRegistry.register('if', IfDirective);
