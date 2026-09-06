import type { MiniQuery } from './base';

export interface MQPlugin<TOptions extends object = any> {
  name: string;
  install: (mq: typeof MiniQuery, options?: TOptions) => void;
  dependencies?: string[];
}

// types/dom.ts

/**
 * Atributos HTML padrão (usados com setAttribute / .attr())
 * Geralmente são minúsculos ou kebab-case.
 */
export type MQAttributeKeys =
  // Globais
  | 'id'
  | 'class'
  | 'style'
  | 'title'
  | 'tabindex'
  | 'dir'
  | 'lang'
  // Inputs & Forms
  | 'type'
  | 'name'
  | 'placeholder'
  | 'disabled'
  | 'readonly'
  | 'required'
  | 'checked'
  | 'value'
  // Links & Midia
  | 'href'
  | 'src'
  | 'alt'
  | 'target'
  | 'rel'
  | 'download'
  // Acessibilidade (base)
  | 'role'
  | 'aria-hidden'
  | 'aria-expanded'
  | 'aria-controls'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  // Escape hatch para data-*, aria-* ou atributos customizados
  | (string & {});

/**
 * Mapa estrito de Propriedades JS do DOM e seus valores esperados.
 */
export interface MQPropertyMap {
  // Booleanos puros
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  defaultChecked: boolean;
  indeterminate: boolean; // O famoso estado "tracinho" do checkbox

  // Strings
  value: string | number;
  className: string;
  id: string;
  title: string;
  dir: 'ltr' | 'rtl' | 'auto';
  lang: string;

  // Números
  tabIndex: number;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * Propriedades do Objeto JS (usadas com atribuição direta / .prop())
 * Geralmente são camelCase e refletem o estado real do motor do navegador.
 */
export type MQPropertyKeys = keyof MQPropertyMap | (string & {});

