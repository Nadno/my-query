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

/** Valor aceito por `class` / `$class`. */
export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/** Behavior de `use` — roda pós-criação, retorna cleanup opcional. */
export type Behavior<E extends Element = Element> = (ctx: MQ<E>) => Cleanup | void;

type AttributesOf<T extends TagName> = HTMLElementAttributeMap[T];

/** Chaves reativas `$attr` derivadas dos atributos da tag. */
type ReactiveAttrs<T extends TagName> = {
  [K in keyof AttributesOf<T> as `$${string & K}`]?: Bindable<AttributesOf<T>[K]>;
};

/** Props de um elemento: atributos (estáticos + `$reativos`) + chaves especiais. */
export type Props<T extends TagName> = Partial<AttributesOf<T>> &
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
  };

/** Componente: recebe props e devolve o(s) nó(s) da sua raiz. */
export type Component<P = Record<string, unknown>> = (props: P) => Node | Node[];

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
