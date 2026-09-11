/**
 * Config compartilhada do mini-q. Hoje: breakpoints + escopo global — usados tanto pelo CSS
 * (`@nome` na árvore de `$.style`) quanto pelo reativo (`$.media`).
 */
import type { ScopeConfig } from './types';
export interface MiniQConfig {
    /** Mapa nome → largura (número = `(min-width: Npx)`) ou query crua (string). */
    breakpoints?: Record<string, number | string>;
    /** Escopo global (motor/nome/limite) — default para todos os blocos. */
    scope?: ScopeConfig;
}
/** Registra/mescla configuração global. */
export declare function config(next: MiniQConfig): void;
/** Escopo global configurado (se houver). */
export declare function getGlobalScope(): ScopeConfig | undefined;
/**
 * Resolve uma chave de media para uma media query completa:
 * - nome registrado (`md`) → a query do registro;
 * - número (`768` / `'768'`) → `(min-width: 768px)`;
 * - já-query (`(min-width: …)` / `screen and …`) → como está.
 */
export declare function resolveMedia(key: string): string;
