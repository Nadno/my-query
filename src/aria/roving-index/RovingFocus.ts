import { RovingIndex, type RovingOverflow } from './RovingIndex';

export type RovingFocusOrientation = 'horizontal' | 'vertical';

export type RovingFocusOptions = {
  /** Seletor CSS dos itens do roving (default: filhos diretos focáveis). */
  target?: string;
  orientation?: RovingFocusOrientation;
  loop?: boolean;
  /** Índice (ou seletor) do item que começa com tabindex=0. Default 0. */
  initial?: number | string;
  /** Chamado quando uma seta moveria o foco para fora (sem loop). */
  onOverflow?: (edge: RovingOverflow) => void;
  /** Chamado quando o foco muda para um item. */
  onMove?: (item: HTMLElement) => void;
};

function keyStep(key: string, orientation: RovingFocusOrientation): number | null {
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') return 1;
    if (key === 'ArrowUp') return -1;
    return null;
  }
  if (key === 'ArrowRight') return 1;
  if (key === 'ArrowLeft') return -1;
  return null;
}

/**
 * RovingFocus — roving tabindex 1D (WAI-ARIA APG) sobre uma lista de itens no DOM.
 * Consome `RovingIndex` como núcleo de matemática e gerencia tabindex/foco/keydown.
 */
export class RovingFocus {
  readonly root: HTMLElement;
  private readonly target: string;
  private readonly orientation: RovingFocusOrientation;
  private readonly loop: boolean;
  private readonly initial: number | string | undefined;
  private readonly onOverflow?: (edge: RovingOverflow) => void;
  private readonly onMove?: (item: HTMLElement) => void;
  private roving = RovingIndex.of(0);
  private active = false;

  private constructor(root: HTMLElement, options: RovingFocusOptions) {
    this.root = root;
    this.target = options.target ?? ':scope > *';
    this.orientation = options.orientation ?? 'horizontal';
    this.loop = options.loop ?? false;
    this.initial = options.initial;
    this.onOverflow = options.onOverflow;
    this.onMove = options.onMove;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
  }

  static of(root: HTMLElement, options: RovingFocusOptions = {}): RovingFocus {
    return new RovingFocus(root, options);
  }

  activate(): this {
    if (this.active) return this;
    this.active = true;
    this.refresh(true);
    this.root.addEventListener('keydown', this.onKeyDown);
    this.root.addEventListener('focusout', this.onFocusOut);
    this.root.addEventListener('focusin', this.onFocusIn);
    return this;
  }

  deactivate(): this {
    if (!this.active) return this;
    this.active = false;
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.root.removeEventListener('focusout', this.onFocusOut);
    this.root.removeEventListener('focusin', this.onFocusIn);
    return this;
  }

  /** Relê os itens (DOM pode ter mudado) e repinta o tabindex. */
  refresh(fromInitial = false): this {
    const items = this.items();
    this.roving.resize(items.length);
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      const focused = items.indexOf(active);
      if (focused >= 0) {
        this.roving.set(focused);
        this.paint();
        return this;
      }
    }
    if (fromInitial && this.initial !== undefined) {
      this.roving.set(this.resolveInitial(items));
    }
    this.paint();
    return this;
  }

  private items(): HTMLElement[] {
    if (this.target === ':scope > *') {
      return Array.from(this.root.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );
    }
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(this.target),
    );
  }

  private resolveInitial(items: HTMLElement[]): number {
    const initial = this.initial;
    if (typeof initial === 'number') return initial;
    if (typeof initial === 'string' && !initial.startsWith(':')) {
      const found = items.findIndex((item) => item.matches(initial));
      if (found >= 0) return found;
    }
    return 0;
  }

  private paint(): void {
    const items = this.items();
    if (items.length === 0) return;
    items.forEach((item, index) => {
      item.tabIndex = index === this.roving.current ? 0 : -1;
    });
  }

  private moveTo(index: number): void {
    const items = this.items();
    const item = items[index];
    if (!item) return;
    this.roving.set(index);
    this.paint();
    item.focus();
    this.onMove?.(item);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const step = keyStep(event.key, this.orientation);
    if (step !== null) {
      event.preventDefault();
      const result = this.roving.next(step, this.loop);
      if ('overflow' in result) {
        this.onOverflow?.(result.overflow);
        return;
      }
      this.moveTo(result.index);
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const items = this.items();
      const target = event.key === 'Home' ? 0 : items.length - 1;
      if (target === this.roving.current) return;
      this.moveTo(target);
    }
  }

  private onFocusIn(event: FocusEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!this.root.contains(target)) return;
    const index = this.items().indexOf(target);
    if (index < 0) return;
    this.roving.set(index);
    this.paint();
  }

  private onFocusOut(event: FocusEvent): void {
    if (this.root.contains(event.relatedTarget as Node | null)) return;
    this.roving.set(this.resolveInitial(this.items()));
    this.paint();
  }
}
