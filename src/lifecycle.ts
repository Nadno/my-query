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

let current: Scope | null = null;

/** O escopo ativo, ou `null` fora de um `runInScope`. */
export function currentScope(): Scope | null {
  return current;
}

export function createScope(parent: Scope | null = current): Scope {
  return { cleanups: [], parent };
}

/** Executa `fn` com `scope` ativo, restaurando o anterior ao fim. */
export function runInScope<T>(scope: Scope, fn: () => T): T {
  const prev = current;
  current = scope;
  try {
    return fn();
  } finally {
    current = prev;
  }
}

/** Registra um cleanup no escopo ativo (no-op se não houver escopo). */
export function registerCleanup(fn: Cleanup): void {
  if (current) current.cleanups.push(fn);
}

/** Roda todos os cleanups do escopo (ordem inversa) e o esvazia. */
export function disposeScope(scope: Scope): void {
  const { cleanups } = scope;
  for (let i = cleanups.length - 1; i >= 0; i--) {
    try {
      cleanups[i]!();
    } catch (error) {
      console.error('[mini-q] cleanup error', error);
    }
  }
  cleanups.length = 0;
}
