import $, { MyQuery } from '../main';
import { IQueryManipulation, MyQueryBase } from '../types';

export class QueryManipulation<T extends Element>
  implements IQueryManipulation<T>
{
  constructor(public element: T) {}

  public html(raw: string): this;
  public html(): string;
  public html(raw?: string): this | string {
    if (arguments.length > 0) {
      if (raw == null) return this;
      this.element.innerHTML = raw;
      return this;
    }

    return this.element.innerHTML;
  }

  public text(text: string): this;
  public text(): string;
  public text(text?: string): this | string {
    if (arguments.length > 0) {
      if (text == null) return this;
      this.element.textContent = text;
      return this;
    }

    return this.element.textContent ?? '';
  }

  public replace(element: Element): this;
  public replace(selector: string): this;
  public replace(elementOrSelector: Element | string): this {
    const newElement = MyQuery.getElement(elementOrSelector);
    if (!newElement) return this;

    this.beforeElement(newElement).remove();

    return this;
  }

  public swap(element: Element): this;
  public swap(selector: string): this;
  public swap(elementOrSelector: Element | string): this {
    const element = MyQuery.getElement(elementOrSelector);
    if (!element) return this;

    const reference = $(document.createElement('span'));
    element.insertAdjacentElement('beforebegin', reference.element);

    this.replace(element);

    reference.replace(this.element);

    return this;
  }

  public before(...elements: Array<string | Element | MyQueryBase>): this {
    elements.forEach((element) =>
      typeof element === 'string'
        ? this.beforeText(element)
        : this.beforeElement(element),
    );

    return this;
  }

  public prepend(...elements: Array<string | Element | MyQueryBase>): this {
    elements.forEach((element) =>
      typeof element === 'string'
        ? this.prependText(element)
        : this.prependElement(element),
    );

    return this;
  }

  public append(...elements: Array<string | Element | MyQueryBase>): this {
    elements.forEach((element) =>
      typeof element === 'string'
        ? this.appendText(element)
        : this.appendElement(element),
    );

    return this;
  }

  public after(...elements: Array<string | Element | MyQueryBase>): this {
    elements.forEach((element) =>
      typeof element === 'string'
        ? this.afterText(element)
        : this.afterElement(element),
    );

    return this;
  }

  public beforeHTML(...raws: string[]): this {
    raws.forEach((raw) => this.element.insertAdjacentHTML('beforebegin', raw));
    return this;
  }

  public prependHTML(...raws: string[]): this {
    raws.forEach((raw) => this.element.insertAdjacentHTML('afterbegin', raw));
    return this;
  }

  public appendHTML(...raws: string[]): this {
    raws.forEach((raw) => this.element.insertAdjacentHTML('beforeend', raw));
    return this;
  }

  public afterHTML(...raws: string[]): this {
    raws.forEach((raw) => this.element.insertAdjacentHTML('afterend', raw));
    return this;
  }

  public beforeText(...texts: string[]): this {
    texts.forEach((text) =>
      this.element.insertAdjacentText('beforebegin', text),
    );
    return this;
  }

  public prependText(...texts: string[]): this {
    texts.forEach((text) =>
      this.element.insertAdjacentText('afterbegin', text),
    );
    return this;
  }

  public appendText(...texts: string[]): this {
    texts.forEach((text) => this.element.insertAdjacentText('beforeend', text));
    return this;
  }

  public afterText(...texts: string[]): this {
    texts.forEach((text) => this.element.insertAdjacentText('afterend', text));
    return this;
  }

  public beforeElement(...elements: Array<Element | MyQueryBase>): this {
    elements.forEach((element) =>
      this.element.insertAdjacentElement(
        'beforebegin',
        MyQuery.elementFrom(element),
      ),
    );

    return this;
  }

  public prependElement(...elements: Array<Element | MyQueryBase>): this {
    elements.forEach((element) =>
      this.element.insertAdjacentElement(
        'afterbegin',
        MyQuery.elementFrom(element),
      ),
    );
    return this;
  }

  public appendElement(...elements: Array<Element | MyQueryBase>): this {
    elements.forEach(
      (element: any) =>
        element &&
        this.element.insertAdjacentElement(
          'beforeend',
          MyQuery.elementFrom(element),
        ),
    );
    return this;
  }

  public afterElement(...elements: Array<Element | MyQueryBase>): this {
    elements.forEach(
      (element) =>
        element &&
        this.element.insertAdjacentElement(
          'afterend',
          MyQuery.elementFrom(element),
        ),
    );
    return this;
  }

  public clear(): this {
    const $children = this.element.childNodes;

    let $child = $children.item(0);

    while ($child) {
      this.element.removeChild($child);
      $child = $children.item(0);
    }

    return this;
  }

  public remove(): this {
    try {
      this.element.remove();
    } catch {
      this.element.parentElement?.removeChild(this.element);
    }

    return this;
  }
}
