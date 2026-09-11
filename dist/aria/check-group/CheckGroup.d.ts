export type CheckGroupOptions = {
    /** Permite múltiplos checados ao mesmo tempo. Default: false (exclusivo). */
    multiple?: boolean;
    /** Permite que todos fiquem desmarcados. Default: true. */
    allowAllUnchecked?: boolean;
    /** Nome registrado que começa checado (default no registro). */
    defaultChecked?: string;
};
/**
 * CheckGroup — regras de seleção para grupos de radio/switch/toggle
 * (WAI-ARIA): exclusividade (`multiple:false`), e o invariant "não fica
 * tudo desmarcado" quando `allowAllUnchecked:false`. Não tem estado reativo
 * — o consumidor persiste como quiser (signal, use) e consulta regras aqui.
 */
export declare class CheckGroup {
    private readonly options;
    private readonly checkers;
    private constructor();
    static of(options?: CheckGroupOptions): CheckGroup;
    has(name: string): boolean;
    isChecked(name: string): boolean;
    get checked(): string[];
    register(name: string, checked: boolean): void;
    unregister(name: string): void;
    set(name: string, checked: boolean): void;
    /** Mantém apenas `name` checado (desmarca os demais). */
    private keepOnly;
    /** Garante que ao menos `name` fica checado (ou outro ainda checado). */
    private keepLastCheckedOr;
}
