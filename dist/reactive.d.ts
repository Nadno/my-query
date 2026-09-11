/**
 * Reactive — contrato agnóstico de sistema de signals.
 *
 * A lib não conhece nenhuma lib de signal específica: o usuário instala um adapter
 * mínimo via `useSignal`. Um binding reativo é qualquer valor que seja um signal
 * (segundo o adapter) ou uma função `() => expr` — esta funciona com qualquer
 * adapter, pois só depende de `effect`.
 */
export interface ReactiveAdapter {
    /** `true` se `value` é um signal desta lib de reatividade. */
    isSignal(value: unknown): boolean;
    /** Lê o valor atual de um signal (dentro de um effect, cria dependência). */
    getValue<T>(signal: unknown): T;
    /** Roda `run` e re-roda quando dependências mudam; retorna a função de parada. */
    effect(run: () => void): () => void;
    /**
     * Roda `fn` sem criar dependências (leituras de signal não são rastreadas).
     * Opcional; se ausente, `untrack` apenas executa `fn`. Necessário para que
     * construir a subárvore de uma região/`when` não vire dependência da região.
     */
    untrack?<T>(fn: () => T): T;
    /**
     * Cria um signal gravável. Opcional; necessário para primitivas que precisam
     * criar estado reativo (ex.: `$.media`). Sem ele, essas primitivas lançam erro.
     */
    signal?<T>(initial: T): Signalish<T> & {
        value: T;
    };
    /**
     * Escreve o valor de um signal gravável (two-way, ex.: `$model`). Opcional; sem
     * ele, `setValue` faz fallback para `signal.value = value` (formato preact-like).
     */
    setValue?<T>(signal: unknown, value: T): void;
}
/** Signal genérico (formato mínimo observável pela lib). */
export type Signalish<T> = {
    readonly value: T;
};
/** Valor de prop reativa: signal, função derivada, ou valor cru. */
export type Bindable<T> = T | Signalish<T> | (() => T);
/** Instala o adapter de reatividade (ex.: preact/signals-core). */
export declare function useSignal(next: ReactiveAdapter): void;
/** O adapter instalado (para quem precisa do `effect` cru, ex.: regiões). */
export declare function getAdapter(): ReactiveAdapter;
/** `true` se `value` é um signal do adapter instalado. */
export declare function isSignal(value: unknown): boolean;
/** `true` se `value` deve ser rastreado reativamente (signal ou função). */
export declare function isReactive(value: unknown): boolean;
/** Roda `fn` sem rastrear dependências (usa o adapter se ele suportar). */
export declare function untrack<T>(fn: () => T): T;
/** Cria um signal gravável via adapter (lança se o adapter não suportar). */
export declare function createSignal<T>(initial: T): Signalish<T> & {
    value: T;
};
/**
 * Escreve `value` num signal gravável (two-way). Usa `adapter.setValue` se existir;
 * senão faz fallback para `signal.value = value` (formato preact-like). Necessário
 * para primitivas de two-way binding como `$model`.
 */
export declare function setValue<T>(signal: unknown, value: T): void;
/** Lê o valor atual de um `Bindable` (signal | função | cru). */
export declare function read<T>(value: Bindable<T>): T;
/**
 * Liga uma fonte reativa a um efeito colateral. Se `source` for reativo
 * (signal|função), roda `apply` dentro de um `effect` e registra o stop no escopo
 * atual; caso contrário aplica uma única vez.
 */
export declare function bind<T>(source: Bindable<T>, apply: (value: T) => void): void;
