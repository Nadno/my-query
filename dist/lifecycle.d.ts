/**
 * Lifecycle — escopos de cleanup encadeados.
 *
 * Tudo que registra cleanup (effects de binding, listeners, custom events,
 * behaviors, itens de lista) anexa ao escopo ativo. `mount` abre o escopo raiz;
 * regiões/componentes aninhados abrem sub-escopos coletados pelo pai, de modo que
 * `unmount` roda cleanups de forma determinística (substitui o `__cleanups`-por-nó).
 */
export type Cleanup = () => void;
export interface Scope {
    readonly cleanups: Cleanup[];
    readonly parent: Scope | null;
}
/** O escopo ativo, ou `null` fora de um `runInScope`. */
export declare function currentScope(): Scope | null;
export declare function createScope(parent?: Scope | null): Scope;
/** Executa `fn` com `scope` ativo, restaurando o anterior ao fim. */
export declare function runInScope<T>(scope: Scope, fn: () => T): T;
/** Registra um cleanup no escopo ativo (no-op se não houver escopo). */
export declare function registerCleanup(fn: Cleanup): void;
/** Roda todos os cleanups do escopo (ordem inversa) e o esvazia. */
export declare function disposeScope(scope: Scope): void;
/**
 * Registra um teardown de unmount no escopo ativo. Hook público sobre
 * `registerCleanup`; fora de escopo `warn` (não é no-op silencioso como o interno,
 * pois quase sempre indica um effect órfão — passe um builder a `$.mount`).
 */
export declare function onUnmounted(fn: Cleanup): void;
/**
 * Roda `fn` **depois de montar** (o nó já conectado ao documento, o escopo ativo).
 * Se `fn` retornar uma função, ela é registrada como teardown via `onUnmounted` — o
 * idioma "monta um recurso e devolve sua limpeza". Fora de escopo `warn` (mas ainda
 * roda `fn`). A execução é **deferida** por `flushMounted()` — chamado por `$mount` e
 * pelas regiões após anexar a árvore — para que o callback já encontre o elemento na DOM.
 */
export declare function onMounted(fn: () => void | Cleanup): void;
/**
 * Roda os `onMounted` pendentes (na ordem de registro), cada um no seu escopo,
 * registrando o teardown retornado nesse escopo. Chamado por `$mount` e pelas regiões
 * logo após os nós serem anexados.
 */
export declare function flushMounted(): void;
