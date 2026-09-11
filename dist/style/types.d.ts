/** Tipos públicos do subsistema de estilo (`style` de `mini-q/style`). */
export type CSSValue = string | number | boolean | null | undefined;
export type CSSObject = {
    [key: string]: CSSValue | CSSObject;
};
/** @deprecated Renomeado para {@link CSSObject}. */
export type StyleObject = CSSObject;
/**
 * Corpo de uma flag/variante: declarações no topo + override opcional de partes
 * (chave `$nome`) e/ou de hosts (`hosts:` = blocos estrangeiros hospedados).
 * Legacy: `parts`/`slots` ainda aceitos durante a transição (deprecados).
 */
export type FlagBody = CSSObject & {
    $?: never;
    parts?: Record<string, CSSObject>;
    slots?: Record<string, CSSObject>;
    hosts?: Record<string, CSSObject>;
};
/** Referência de um host na declaração: qualquer handle (lê `.self`) ou uma classe crua. */
export type SlotRef = {
    readonly self: string;
} | string;
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
/**
 * Ficha técnica do bloco (chave exata `$:` no config). NÃO gera regra CSS —
 * tudo aqui é configuração (escopo, hosts, defaults) ou CSS condicional
 * (flags/variants) / recursos (keyframes).
 */
export interface StyleMeta {
    /** Motor/nome/limite de escopo (mesclado com o global do `config`). */
    scope?: ScopeConfig;
    /** Blocos estrangeiros hospedados; flags/variants os miram por `$: { hosts }`. */
    hosts?: Record<string, SlotRef>;
    /** Alias legacy de `hosts` (topo `slots:{}` durante a transição). */
    slots?: Record<string, SlotRef>;
    /** Valor default por grupo de variante. */
    defaults?: Record<string, string>;
    /** Flags booleanas independentes. Classe composta `.sel.--is-{nome}`. */
    flags?: Record<string, FlagBody>;
    /** Grupos de variantes exclusivas. Classe composta `.sel.--{grupo}-{valor}`. */
    variants?: Record<string, Record<string, FlagBody>>;
    /** Keyframes escopados por bloco (`{bloco}-{nome}`). */
    keyframes?: Record<string, CSSObject>;
}
export declare function isDollarPartKey(key: string): boolean;
export interface StyleConfig {
    /** Ficha técnica (chave exata `$:`): scope/hosts/defaults/flags/variants/keyframes. */
    $?: StyleMeta;
    /** Partes descendentes (recursivo). Chave `$nome`; CSS `& > .-bloco-nome`. */
    parts?: Record<string, StyleConfig>;
    /** Atalho legacy `>nome` (equivale a `$nome`; deprecado, avisa). */
    [shortcutPart: `>${string}`]: StyleConfig;
    /** Escalares/`&…`/`@…` no topo são as declarações da própria parte. */
    [key: string]: unknown;
}
type VariantProps<T extends StyleConfig> = {
    [G in keyof NonNullable<T['$']>['variants']]?: keyof NonNullable<NonNullable<T['$']>['variants']>[G];
} & {
    [F in keyof NonNullable<T['$']>['flags']]?: boolean;
};
type ReservedName = 'self' | 'flags' | 'variants' | 'keyframes' | 'hosts' | 'slots';
/** Tipo que normaliza `$nome` (e o legacy `parts`/`>nome`) num único record recursivo. */
type ResolvedParts<T extends StyleConfig> = (T extends {
    parts?: infer P;
} ? (P extends Record<string, StyleConfig> ? P : {}) : {}) & (T extends Record<string, unknown> ? {
    [K in keyof T as K extends `$${infer R}` ? K extends '$' ? never : R : never]: T[K] extends StyleConfig ? T[K] : StyleConfig;
} : {});
type PartKeys<T extends StyleConfig> = Exclude<keyof ResolvedParts<T>, ReservedName>;
type MetaOf<T extends StyleConfig> = NonNullable<T['$']>;
interface StyleHandleBase<T extends StyleConfig> {
    /** Monta a string de classes: `self` + tokens de variante/flag ativos. */
    (props?: VariantProps<T>): string;
    /** Classe própria (`'field'` no bloco, `'-field-input'` numa parte). */
    readonly self: string;
    /** Token de cada flag (`'--is-invalid'`). */
    readonly flags: {
        [K in keyof MetaOf<T>['flags']]: string;
    };
    /** Token de cada variante (`variants.size.sm === '--size-sm'`). */
    readonly variants: {
        [G in keyof MetaOf<T>['variants']]: {
            [V in keyof MetaOf<T>['variants'][G]]: string;
        };
    };
    /** Nome escopado de cada keyframe (`'field-pulse'`). */
    readonly keyframes: {
        [K in keyof MetaOf<T>['keyframes']]: string;
    };
    /** Classe resolvida de cada host hospedado (rename de `slots`). */
    readonly hosts: {
        [K in keyof MetaOf<T>['hosts']]: string;
    };
    /** Alias legacy de {@link hosts}. */
    readonly slots: {
        [K in keyof MetaOf<T>['hosts']]: string;
    };
}
/**
 * Retorno de `style(name, config)`: callable (`field({ size })`) com `self` e as partes
 * **promovidas** ao próprio objeto (`field.input`), além de `flags`/`variants`/`keyframes`/`hosts`.
 * `class`/`$class`/`cx` aceitam o handle diretamente (ele é chamado).
 */
export type StyleHandle<T extends StyleConfig = StyleConfig> = StyleHandleBase<T> & {
    readonly [K in PartKeys<T>]: StyleHandle<NonNullable<ResolvedParts<T>[K]>>;
};
export interface StyleApi {
    <T extends StyleConfig>(name: string, config: T): StyleHandle<T>;
    /** Estilo global / escape hatch (seletor cru). */
    css(selector: string, obj: CSSObject): void;
}
export {};
