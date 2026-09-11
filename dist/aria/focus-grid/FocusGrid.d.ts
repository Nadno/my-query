import { type RovingOverflow } from '../roving-index';
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
export declare function stepForKey(key: string, columns: number): number | null;
export declare class FocusGrid {
    readonly root: HTMLElement;
    private readonly columns;
    private readonly cellSelector;
    private readonly initial;
    private readonly loop;
    private readonly onOverflow?;
    private readonly onMove?;
    private roving;
    private active;
    private observer;
    private refreshQueued;
    private constructor();
    static of(root: HTMLElement, options: FocusGridOptions): FocusGrid;
    activate(): this;
    deactivate(): this;
    private queueRefresh;
    /** Relê as células (DOM mudou) e volta a pintar o tabindex. */
    refresh(fromInitial?: boolean): this;
    private cells;
    private paint;
    private onFocusIn;
    private onKeyDown;
}
