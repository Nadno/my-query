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

/**
 * Registra um teardown de unmount no escopo ativo. Hook público sobre
 * `registerCleanup`; fora de escopo `warn` (não é no-op silencioso como o interno,
 * pois quase sempre indica um effect órfão — passe um builder a `$.mount`).
 */
export function onUnmounted(fn: Cleanup): void {
  if (!current) {
    console.warn('[mini-q] onUnmounted fora de escopo — passe um builder a $.mount');
    return;
  }
  registerCleanup(fn);
}

/**
 * Roda `fn` **depois de montar** (o nó já conectado ao documento, o escopo ativo).
 * Se `fn` retornar uma função, ela é registrada como teardown via `onUnmounted` — o
 * idioma "monta um recurso e devolve sua limpeza". Fora de escopo `warn` (mas ainda
 * roda `fn`). A execução é **deferida** por `flushMounted()` — chamado por `$mount` e
 * pelas regiões após anexar a árvore — para que o callback já encontre o elemento na DOM.
 */
export function onMounted(fn: () => void | Cleanup): void {
  if (!current) {
    console.warn('[mini-q] onMounted fora de escopo — passe um builder a $.mount');
    fn(); // roda uma vez; sem escopo, o cleanup retornado não tem onde ser registrado
    return;
  }
  const scope = current;
  pendingMounted.push({ scope, fn });
}

interface PendingMounted {
  scope: Scope;
  fn: () => void | Cleanup;
}

const pendingMounted: PendingMounted[] = [];

/**
 * Roda os `onMounted` pendentes (na ordem de registro), cada um no seu escopo,
 * registrando o teardown retornado nesse escopo. Chamado por `$mount` e pelas regiões
 * logo após os nós serem anexados.
 */
export function flushMounted(): void {
  if (pendingMounted.length === 0) return;
  const jobs = pendingMounted.splice(0, pendingMounted.length);
  for (const { scope, fn } of jobs) {
    runInScope(scope, () => {
      const cleanup = fn();
      if (typeof cleanup === 'function') registerCleanup(cleanup);
    });
  }
}
