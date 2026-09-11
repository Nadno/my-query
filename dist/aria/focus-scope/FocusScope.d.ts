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
export declare class FocusScope {
    readonly root: HTMLElement;
    private readonly options;
    private previous;
    private sentinels;
    private isolated;
    private active;
    private constructor();
    /** Fábrica: cria um escopo sobre uma raiz do DOM. */
    static of(root: HTMLElement, options?: FocusScopeOptions): FocusScope;
    /** O escopo no topo da pilha (o que governa o foco), se houver. */
    static get current(): FocusScope | null;
    private focusables;
    first(): HTMLElement | null;
    last(): HTMLElement | null;
    /** Guarda o foco atual (não sobrescreve se já guardou — aninhamento). */
    capture(): this;
    restore(): this;
    private focusEdge;
    private onFocusOut;
    private onFocusIn;
    private makeSentinel;
    trap(): this;
    release(): this;
    isolate(): this;
    restoreOutside(): this;
    activate(): this;
    deactivate(): this;
}
