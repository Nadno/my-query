import { RovingIndex, type RovingOverflow } from '../roving-index';

export type FocusGridOverflowDetail = {
  step: number;
};

export type FocusGridOptions = {
  columns: number;
  cells?: string;
  /** Índice ou selector CSS da primeira célula activa. */
  initial?: number | string;
  loop?: boolean;
  onOverflow?: (edge: RovingOverflow, detail: FocusGridOverflowDetail) => void;
  /** Depois de uma seta que mudou de célula (não no overflow). */
  onMove?: (cell: HTMLElement) => void;
};

const DEFAULT_CELLS = '[role="gridcell"]:not([disabled])';

const KEY_STEP: Record<string, (columns: number) => number> = {
  ArrowRight: () => 1,
  ArrowLeft: () => -1,
  ArrowDown: (columns) => columns,
  ArrowUp: (columns) => -columns,
};

export function stepForKey(key: string, columns: number): number | null {
  const toStep = KEY_STEP[key];
  return toStep ? toStep(columns) : null;
}

function resolveInitial(cells: HTMLElement[], initial?: number | string): number {
  if (typeof initial === 'number') return initial;
  if (typeof initial === 'string') {
    for (const selector of initial.split(',').map((part) => part.trim())) {
      if (!selector) continue;
      const found = cells.findIndex((cell) => cell.matches(selector));
      if (found >= 0) return found;
    }
  }
  return 0;
}

export class FocusGrid {
  readonly root: HTMLElement;
  private readonly columns: number;
  private readonly cellSelector: string;
  private readonly initial: number | string | undefined;
  private readonly loop: boolean;
  private readonly onOverflow?: (
    edge: RovingOverflow,
    detail: FocusGridOverflowDetail,
  ) => void;
  private readonly onMove?: (cell: HTMLElement) => void;
  private roving = RovingIndex.of(0);
  private active = false;
  private observer: MutationObserver | null = null;
  private refreshQueued = false;

  private constructor(root: HTMLElement, options: FocusGridOptions) {
    this.root = root;
    this.columns = options.columns;
    this.cellSelector = options.cells ?? DEFAULT_CELLS;
    this.initial = options.initial;
    this.loop = options.loop ?? false;
    this.onOverflow = options.onOverflow;
    this.onMove = options.onMove;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
  }

  static of(root: HTMLElement, options: FocusGridOptions): FocusGrid {
    return new FocusGrid(root, options);
  }

  activate(): this {
    if (this.active) return this;
    this.active = true;
    this.refresh(true);
    this.root.addEventListener('keydown', this.onKeyDown);
    this.root.addEventListener('focusin', this.onFocusIn);
    this.observer = new MutationObserver(() => this.queueRefresh());
    this.observer.observe(this.root, { childList: true, subtree: true });
    return this;
  }

  deactivate(): this {
    if (!this.active) return this;
    this.active = false;
    this.observer?.disconnect();
    this.observer = null;
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.root.removeEventListener('focusin', this.onFocusIn);
    return this;
  }

  private queueRefresh(): void {
    if (this.refreshQueued || !this.active) return;
    this.refreshQueued = true;
    queueMicrotask(() => {
      this.refreshQueued = false;
      if (this.active) this.refresh(false);
    });
  }

  /** Relê as células (DOM mudou) e volta a pintar o tabindex. */
  refresh(fromInitial = false): this {
    const cells = this.cells();
    this.roving.resize(cells.length);
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      const focused = cells.indexOf(active);
      if (focused >= 0) {
        this.roving.set(focused);
        this.paint();
        return this;
      }
    }
    if (fromInitial) {
      this.roving.set(resolveInitial(cells, this.initial));
    }
    this.paint();
    return this;
  }

  private cells(): HTMLElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(this.cellSelector),
    );
  }

  private paint(): void {
    const cells = this.cells();
    if (this.root.getAttribute('tabindex') !== '-1') {
      this.root.tabIndex = -1;
    }
    cells.forEach((cell, index) => {
      cell.tabIndex = index === this.roving.current ? 0 : -1;
    });
  }

  private onFocusIn(event: FocusEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const cells = this.cells();
    const index = cells.indexOf(target);
    if (index < 0) return;
    this.roving.set(index);
    this.paint();
  }

  private onKeyDown(event: KeyboardEvent): void {
    const step = stepForKey(event.key, this.columns);
    if (step === null) return;

    const cells = this.cells();
    this.roving.resize(cells.length);
    if (cells.length === 0) return;

    event.preventDefault();
    const result = this.roving.next(step, this.loop);
    if ('overflow' in result) {
      this.onOverflow?.(result.overflow, { step });
      return;
    }

    const next = cells[result.index];
    this.paint();
    next?.focus();
    if (next) this.onMove?.(next);
  }
}
