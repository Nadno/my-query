/**
 * Config compartilhada do mini-q. Hoje: breakpoints — usados tanto pelo CSS
 * (`@nome` na árvore de `$.style`) quanto pelo reativo (`$.media`).
 */

export interface MiniQConfig {
  /** Mapa nome → largura (número = `(min-width: Npx)`) ou query crua (string). */
  breakpoints?: Record<string, number | string>;
}

const breakpoints = new Map<string, string>();

/** Registra/mescla configuração global. */
export function config(next: MiniQConfig): void {
  if (next.breakpoints) {
    for (const name in next.breakpoints) {
      breakpoints.set(name, toQuery(next.breakpoints[name]!));
    }
  }
}

const NUMERIC = /^[0-9]+(\.[0-9]+)?$/;

function toQuery(value: number | string): string {
  if (typeof value === 'number') return `(min-width: ${value}px)`;
  const n = value.trim().replace(/px$/, '');
  if (NUMERIC.test(n)) return `(min-width: ${n}px)`;
  return value;
}

/**
 * Resolve uma chave de media para uma media query completa:
 * - nome registrado (`md`) → a query do registro;
 * - número (`768` / `'768'`) → `(min-width: 768px)`;
 * - já-query (`(min-width: …)` / `screen and …`) → como está.
 */
export function resolveMedia(key: string): string {
  const trimmed = key.trim();
  if (breakpoints.has(trimmed)) return breakpoints.get(trimmed)!;
  return toQuery(trimmed);
}
