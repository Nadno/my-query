/** Tipos centrais do mini-q (props, componentes, children, contexto). */

import type { Bindable } from './reactive';
import type { Cleanup } from './lifecycle';
import type { HTMLElementAttributeMap } from './html-types';
import type { OnMap } from './events/types';

export type { Cleanup };

/** Nomes de tag suportados pela factory (intersecção attrs × instância DOM). */
export type TagName = keyof HTMLElementTagNameMap & keyof HTMLElementAttributeMap;

/** Tipo da instância DOM para uma tag. */
export type TagElement<T extends TagName> = HTMLElementTagNameMap[T];

/** Contexto passado a handlers, behaviors e setups. */
export interface MQ<E extends Element = Element> {
  readonly element: E;
}

/** Brand de um `StyleHandle` — `class`/`cx` só chamam a função se ela tiver esta marca. */
export const STYLE_HANDLE: unique symbol = Symbol('mq.styleHandle');

/** Callable que devolve uma string de classes (o `StyleHandle` de `$.style` satisfaz isto). */
export interface ClassHandle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): string;
  readonly self: string;
}

/** Valor aceito por `class` / `$class`. */
export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassHandle
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/** Behavior de `use` — roda pós-criação, retorna cleanup opcional. */
export type Behavior<E extends Element = Element> = (ctx: MQ<E>) => Cleanup | void;

type AttributesOf<T extends TagName> = HTMLElementAttributeMap[T];

/**
 * Atributos estáticos: cada valor aceita também `false`/`null` — em runtime isso
 * **remove** o atributo (mesmo contrato do `setAttr`).
 */
type StaticAttrs<T extends TagName> = {
  [K in keyof AttributesOf<T>]?: AttributesOf<T>[K] | false | null;
};

/** Chaves reativas `$attr` derivadas dos atributos da tag (valor pode resolver p/ `false`/`null`). */
type ReactiveAttrs<T extends TagName> = {
  [K in keyof AttributesOf<T> as `$${string & K}`]?: Bindable<AttributesOf<T>[K] | false | null>;
};

/** Props de um elemento: atributos (estáticos + `$reativos`) + chaves especiais + arbitrárias. */
export type Props<T extends TagName> = StaticAttrs<T> &
  ReactiveAttrs<T> & {
    class?: ClassValue;
    $class?: Bindable<ClassValue>;
    style?: string | Partial<CSSStyleDeclaration>;
    $style?: Bindable<string | Partial<CSSStyleDeclaration>>;
    data?: Record<string, string | number | boolean>;
    $data?: Record<string, Bindable<string | number | boolean>>;
    on?: OnMap<TagElement<T>>;
    use?: Behavior<TagElement<T>> | Behavior<TagElement<T>>[];
    /** Chave para reconciliação em listas keyed. */
    key?: string | number;
    /**
     * Atributo arbitrário → cai no fallback `setAttribute` em runtime. `unknown`
     * (não `string`) porque a index signature precisa coexistir com as chaves
     * especiais (`on`/`use`/`data`/…); as chaves conhecidas **mantêm** seu tipo.
     */
    [attr: string]: unknown;
  };

/** Props de um componente: as de uma tag `T` + campos próprios `Extra`. · `PropsOf<'div', { count: number }>` */
export type PropsOf<T extends TagName, Extra = {}> = Props<T> & Extra;

/** Componente: recebe props e devolve o(s) nó(s) da sua raiz. */
export type Component<P = Record<string, unknown>> = (props: P) => Node | Node[];

/** Função de setup de `createTag`/`TagFactory` (a raiz é a tag). */
export type SetupFn<T extends TagName, P = Record<string, unknown>> = (
  props: P,
  ctx: MQ<TagElement<T>>,
) => unknown;

/**
 * Rejeita funções **0-param** (filho reativo) — desambigua o 1º arg função de
 * `createTag` por **aridade**: `() => valor` é filho reativo; `(props, ctx) => filhos`
 * (≥1 param) é setup. `never` para 0-param faz o overload de setup não engolir o filho.
 */
export type NonEmptyFn<F> = F extends (...args: infer A) => unknown
  ? A extends readonly []
    ? never
    : F
  : never;

/** Filho renderizável. */
export type Child =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[]
  | ComponentTuple
  | (() => unknown)
  | { readonly value: unknown };

/** Tupla lazy `[Component, props]` — renderização adiada e cacheável. */
export type ComponentTuple<P = any> = [Component<P>, P];
