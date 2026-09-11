export type RovingOverflow = 'before' | 'after';
export type RovingMove = {
    index: number;
} | {
    overflow: RovingOverflow;
};
export type RovingNextInput = {
    index: number;
    count: number;
    step: number;
    loop?: boolean;
};
export declare class RovingIndex {
    #private;
    private constructor();
    static of(count: number, current?: number): RovingIndex;
    /** 1D: um eixo. Sem colunas — isso é FocusGrid. */
    static next(input: RovingNextInput): RovingMove;
    get current(): number;
    get count(): number;
    resize(count: number): this;
    set(index: number): this;
    next(step: number, loop?: boolean): RovingMove;
}
