import { type RovingOverflow } from './RovingIndex';
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
/**
 * RovingFocus — roving tabindex 1D (WAI-ARIA APG) sobre uma lista de itens no DOM.
 * Consome `RovingIndex` como núcleo de matemática e gerencia tabindex/foco/keydown.
 */
export declare class RovingFocus {
    readonly root: HTMLElement;
    private readonly target;
    private readonly orientation;
    private readonly loop;
    private readonly initial;
    private readonly onOverflow?;
    private readonly onMove?;
    private roving;
    private active;
    private constructor();
    static of(root: HTMLElement, options?: RovingFocusOptions): RovingFocus;
    activate(): this;
    deactivate(): this;
    /** Relê os itens (DOM pode ter mudado) e repinta o tabindex. */
    refresh(fromInitial?: boolean): this;
    private items;
    private resolveInitial;
    private paint;
    private moveTo;
    private onKeyDown;
    private onFocusIn;
    private onFocusOut;
}
