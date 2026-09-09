/**
 * FocusScope — `$stdbrowser` (exemplo / strawman)
 *
 * Gerência agnóstica de foco numa região do DOM: consultar, capturar/restaurar,
 * confinar (trap) e isolar o exterior (inert). Sem jQuery, sem bootbox, sem
 * decisões de acessibilidade (`aria-*`, `role`) — isso é do componente que usa.
 *
 * Destilado de `EnhancedBootboxAccessibility` (produção): o mesmo núcleo, com a
 * coordenação de modais aninhados formalizada numa pilha em vez de dois globais.
 *
 * Simplificações deliberadas deste exemplo (o módulo-fonte cobre):
 *  - `isolate()` usa só `inert`; o fallback `tabindex="-1"` p/ browsers antigos ficou de fora.
 *  - desativar escopos fora de ordem (não-LIFO) é limitação conhecida.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'details',
  'input:not([type="hidden"]):not([disabled])',
  'iframe',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contentEditable=""]',
  '[contentEditable="true"]',
  '[tabindex]:not([tabindex^="-"]):not([disabled])',
].join(',');

export type FocusScopeOptions = {
  /** Confinar o foco dentro da raiz (sentinelas). Default: true. */
  trap?: boolean;
  /** Inertar o resto do documento enquanto ativo. Default: true. */
  isolate?: boolean;
  /** Restaurar o foco anterior ao desativar. Default: true. */
  restoreFocus?: boolean;
  /** Focar o primeiro focável ao ativar. Default: true. */
  autoFocus?: boolean;
};

const DEFAULTS: Required<FocusScopeOptions> = {
  trap: true,
  isolate: true,
  restoreFocus: true,
  autoFocus: true,
};

function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/** Pilha de escopos ativos — só o topo governa o foco. */
const stack: FocusScope[] = [];

export class FocusScope {
  readonly root: HTMLElement;
  private readonly options: Required<FocusScopeOptions>;
  private previous: HTMLElement | null = null;
  private sentinels: HTMLElement[] = [];
  private isolated: HTMLElement[] = [];
  private active = false;

  private constructor(root: HTMLElement, options: FocusScopeOptions = {}) {
    this.root = root;
    this.options = { ...DEFAULTS, ...options };
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
  }

  /** Fábrica: cria um escopo sobre uma raiz do DOM. */
  static of(root: HTMLElement, options?: FocusScopeOptions): FocusScope {
    return new FocusScope(root, options);
  }

  /** O escopo no topo da pilha (o que governa o foco), se houver. */
  static get current(): FocusScope | null {
    return stack[stack.length - 1] ?? null;
  }

  // ---- consultas puras ---------------------------------------------------

  private focusables(): HTMLElement[] {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => isVisible(el) && !el.dataset.focusSentinel);
  }

  first(): HTMLElement | null {
    return this.focusables()[0] ?? null;
  }

  last(): HTMLElement | null {
    const all = this.focusables();
    return all[all.length - 1] ?? null;
  }

  // ---- restauração de foco ----------------------------------------------

  /** Guarda o foco atual (não sobrescreve se já guardou — aninhamento). */
  capture(): this {
    if (!this.previous) {
      const el = document.activeElement;
      this.previous = el instanceof HTMLElement ? el : null;
    }
    return this;
  }

  restore(): this {
    const target = this.previous ?? document.body;
    this.previous = null;
    requestAnimationFrame(() => target.focus?.());
    return this;
  }

  // ---- trap (sentinelas) -------------------------------------------------

  private focusEdge(edge: 'first' | 'last'): void {
    const target = edge === 'first' ? this.first() : this.last();
    requestAnimationFrame(() => (target ?? this.root).focus());
  }

  private onFocusOut(event: FocusEvent): void {
    const to = event.relatedTarget as HTMLElement | null;
    if (!to?.dataset.focusSentinel) return;
    // saiu para uma sentinela: embrulha para a outra ponta
    this.focusEdge(to.dataset.focusSentinel === 'start' ? 'last' : 'first');
  }

  private onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.dataset.focusSentinel) return;
    const from = event.relatedTarget as HTMLElement | null;
    if (from && this.root.contains(from)) return;
    // entrou pela sentinela vindo de fora
    this.focusEdge(target.dataset.focusSentinel === 'start' ? 'first' : 'last');
  }

  private makeSentinel(edge: 'start' | 'end'): HTMLElement {
    const el = document.createElement('span');
    el.tabIndex = 0;
    el.dataset.focusSentinel = edge;
    Object.assign(el.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
    });
    return el;
  }

  trap(): this {
    if (this.sentinels.length) return this;
    const start = this.makeSentinel('start');
    const end = this.makeSentinel('end');
    this.root.prepend(start);
    this.root.append(end);
    this.sentinels = [start, end];
    this.root.addEventListener('focusin', this.onFocusIn);
    this.root.addEventListener('focusout', this.onFocusOut);
    return this;
  }

  release(): this {
    this.sentinels.forEach((s) => s.remove());
    this.sentinels = [];
    this.root.removeEventListener('focusin', this.onFocusIn);
    this.root.removeEventListener('focusout', this.onFocusOut);
    return this;
  }

  // ---- isolate (inert do exterior) --------------------------------------

  isolate(): this {
    if (this.isolated.length) return this;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.contains(this.root),
    );
    for (const el of siblings) {
      // já inerte (por outro escopo ou pelo host): não tocar — assim o
      // deactivate não devolve o que não foi este escopo que tirou.
      if (el.inert) continue;
      el.inert = true;
      this.isolated.push(el);
    }
    return this;
  }

  restoreOutside(): this {
    for (const el of this.isolated) el.inert = false;
    this.isolated = [];
    return this;
  }

  // ---- ciclo de vida -----------------------------------------------------

  activate(): this {
    if (this.active) return this;
    this.active = true;
    this.capture();
    stack.push(this);
    if (this.options.isolate) this.isolate();
    if (this.options.trap) this.trap();
    if (this.options.autoFocus) {
      if (!this.root.hasAttribute('tabindex')) this.root.tabIndex = -1;
      const target = this.first() ?? this.root;
      requestAnimationFrame(() => target.focus());
    }
    return this;
  }

  deactivate(): this {
    if (!this.active) return this;
    this.active = false;
    this.release();
    this.restoreOutside();
    const i = stack.lastIndexOf(this);
    if (i >= 0) stack.splice(i, 1);
    if (this.options.restoreFocus) this.restore();
    return this;
  }
}
