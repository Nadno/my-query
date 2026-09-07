/** Tipos públicos do subsistema de estilo (`$.style`). */

export type CSSObject = {
  [key: string]: string | number | boolean | null | undefined | CSSObject;
};

/** @deprecated Renomeado para {@link CSSObject}. */
export type StyleObject = CSSObject;

export interface StyleConfig {
  /** Declarações da própria parte (também aceita escalares/`&…`/`@…` no topo). */
  base?: CSSObject;
  /** Partes descendentes (recursivo). Classe = `-{bloco}-{chave}`, combinador descendente. */
  parts?: Record<string, StyleConfig>;
  /** Flags booleanas independentes. Classe composta `.sel.--flag`. Aceita `parts` de override. */
  flags?: Record<string, FlagBody>;
  /** Grupos de variantes exclusivas. Classe composta `.sel.--grupo-valor`. */
  variants?: Record<string, Record<string, FlagBody>>;
  /** Valor default por grupo de variante. */
  defaults?: Record<string, string>;
  /** Keyframes escopados por bloco (`{bloco}-{nome}`). */
  keyframes?: Record<string, CSSObject>;
  /** Escalares/`&…`/`@…` no topo também são declarações da própria parte. */
  [key: string]: unknown;
}

/** Corpo de uma flag/variante: declarações + `parts` opcional de override de descendentes. */
export type FlagBody = CSSObject & { parts?: Record<string, CSSObject> };

type VariantProps<T extends StyleConfig> =
  & { [G in keyof T['variants']]?: keyof NonNullable<T['variants']>[G] }
  & { [F in keyof T['flags']]?: boolean };

export interface StyleHandle<T extends StyleConfig = StyleConfig> {
  /** Monta a string de classes: `self` + tokens de variante/flag ativos. */
  (props?: VariantProps<T>): string;
  /** Classe própria (`'field'` no bloco, `'-field-input'` numa parte). */
  readonly self: string;
  /** Handles das partes (espelham a config, recursivo). */
  readonly parts: { [K in keyof NonNullable<T['parts']>]: StyleHandle<NonNullable<T['parts']>[K]> };
  /** Token de cada flag (`'--invalid'`). */
  readonly flags: { [K in keyof T['flags']]: string };
  /** Token de cada variante (`variants.size.sm === '--size-sm'`). */
  readonly variants: { [G in keyof T['variants']]: { [V in keyof NonNullable<T['variants']>[G]]: string } };
  /** Nome escopado de cada keyframe (`'field-pulse'`). */
  readonly keyframes: { [K in keyof T['keyframes']]: string };
}

export interface StyleApi {
  <T extends StyleConfig>(name: string, config: T): StyleHandle<T>;
  /** Só reserva o nome (sem injetar). */
  (name: string): string;
  /** Estilo global / escape hatch (seletor cru). */
  css(selector: string, obj: CSSObject): void;
}
