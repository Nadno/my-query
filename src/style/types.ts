/** Tipos públicos do subsistema de estilo (`$.style`). */

export type CSSValue = string | number | boolean | null | undefined;

export type CSSObject = {
  [key: string]: CSSValue | CSSObject;
};

/** @deprecated Renomeado para {@link CSSObject}. */
export type StyleObject = CSSObject;

/**
 * Corpo de uma flag/variante: declarações no topo + override opcional de `parts`
 * (partes descendentes) e `slots` (blocos hospedados). Mesmo shape nos dois.
 */
export type FlagBody = CSSObject & {
  parts?: Record<string, CSSObject>;
  slots?: Record<string, CSSObject>;
};

/** Referência de um slot na declaração: qualquer handle (lê `.self`) ou uma classe crua. */
export type SlotRef = { readonly self: string } | string;

/** Motor de escopo do bloco. `native` emite via `@scope` CSS; `prefixed` usa classes prefixadas. */
export type ScopeStrategy = 'native' | 'prefixed';

/** Configuração de escopo de um bloco ou do app (mesclada: global + local). */
export interface ScopeConfig {
  /** Como emitir o escopo. `native` = `@scope`; `prefixed` = classes com prefixo. */
  strategy?: ScopeStrategy;
  /** Identificação/leitura. `hashed` gera um hash estável do bloco. */
  name?: string | 'hashed';
  /** Limite superior do `@scope` (`to (sel)`). Recurso só do motor `native`. */
  to?: string;
}

export interface StyleConfig {
  /** Motor/nome/limite de escopo do bloco (mesclado com o global do `config`). */
  scope?: ScopeConfig;
  /** Partes descendentes (recursivo). Classe = `-{bloco}-{chave}`, combinador descendente. */
  parts?: Record<string, StyleConfig>;
  /** Atalho para partes descendentes: `'>title': { ... }` equivale a `parts: { title: { ... } }`. */
  [shortcutPart: `>${string}`]: StyleConfig;
  /** Flags booleanas independentes. Classe composta `.sel.--is-{nome}`. */
  flags?: Record<string, FlagBody>;
  /** Grupos de variantes exclusivas. Classe composta `.sel.--{grupo}-{valor}`. */
  variants?: Record<string, Record<string, FlagBody>>;
  /** Valor default por grupo de variante. */
  defaults?: Record<string, string>;
  /** Blocos estrangeiros hospedados; flags/variants os miram por `slots`. */
  slots?: Record<string, SlotRef>;
  /** Keyframes escopados por bloco (`{bloco}-{nome}`). */
  keyframes?: Record<string, CSSObject>;
  /** Escalares/`&…`/`@…` no topo são as declarações da própria parte. */
  [key: string]: unknown;
}

type VariantProps<T extends StyleConfig> =
  & { [G in keyof T['variants']]?: keyof NonNullable<T['variants']>[G] }
  & { [F in keyof T['flags']]?: boolean };

type ReservedName = 'self' | 'flags' | 'variants' | 'keyframes' | 'slots';

/** Tipo que normaliza partes explícitas + atalhos `\u003enome` num único record recursivo. */
type ResolvedParts<T extends StyleConfig> =
  & (T extends { parts?: infer P } ? (P extends Record<string, StyleConfig> ? P : {}) : {})
  & (T extends Record<string, unknown>
    ? {
        [K in keyof T as K extends `>${infer R}` ? R : never]: T[K] extends StyleConfig
          ? T[K]
          : StyleConfig;
      }
    : {});

type PartKeys<T extends StyleConfig> = Exclude<keyof ResolvedParts<T>, ReservedName>;

interface StyleHandleBase<T extends StyleConfig> {
  /** Monta a string de classes: `self` + tokens de variante/flag ativos. */
  (props?: VariantProps<T>): string;
  /** Classe própria (`'field'` no bloco, `'-field-input'` numa parte). */
  readonly self: string;
  /** Token de cada flag (`'--is-invalid'`). */
  readonly flags: { [K in keyof T['flags']]: string };
  /** Token de cada variante (`variants.size.sm === '--size-sm'`). */
  readonly variants: { [G in keyof T['variants']]: { [V in keyof NonNullable<T['variants']>[G]]: string } };
  /** Nome escopado de cada keyframe (`'field-pulse'`). */
  readonly keyframes: { [K in keyof T['keyframes']]: string };
  /** Classe resolvida de cada slot hospedado. */
  readonly slots: { [K in keyof T['slots']]: string };
}

/**
 * Retorno de `$.style(name, config)`: callable (`field({ size })`) com `self` e as partes
 * **promovidas** ao próprio objeto (`field.input`), além de `flags`/`variants`/`keyframes`/`slots`.
 * `class`/`$class`/`cx` aceitam o handle diretamente (ele é chamado).
 */
export type StyleHandle<T extends StyleConfig = StyleConfig> =
  & StyleHandleBase<T>
  & { readonly [K in PartKeys<T>]: StyleHandle<NonNullable<ResolvedParts<T>[K]>> };

export interface StyleApi {
  <T extends StyleConfig>(name: string, config: T): StyleHandle<T>;
  /** Estilo global / escape hatch (seletor cru). */
  css(selector: string, obj: CSSObject): void;
}
