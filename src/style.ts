/**
 * CSS / `$.style` — DX (token-explícito). Engine de geração/injeção de CSS é pós-MVP;
 * por ora os tokens são apenas nomes de classe legíveis (você escreve o CSS à parte).
 *
 * Nomear gera classes BEM-legíveis: bloco `card`, elemento `card-title`, modificador
 * `card--active` — fáceis de debugar, "apenas css".
 */

import { cx } from './dom/nodes';

let auto = 0;
const nextName = (): string => `mq-${(auto++).toString(36)}`;

export type StyleObject = Record<string, unknown>;

export interface VariantConfig {
  base?: StyleObject;
  variants?: Record<string, Record<string, StyleObject>>;
  defaultVariants?: Record<string, string>;
}

export type VariantFn = (props?: Record<string, string>) => string;

function isVariantConfig(config: StyleObject | VariantConfig): config is VariantConfig {
  return (
    'variants' in config || 'defaultVariants' in config || 'base' in config
  );
}

export function style(name: string, config?: StyleObject | VariantConfig): string | VariantFn;
export function style(config: StyleObject | VariantConfig): string | VariantFn;
export function style(
  a: string | StyleObject | VariantConfig,
  b?: StyleObject | VariantConfig,
): string | VariantFn {
  const name = typeof a === 'string' ? a : nextName();
  const config = (typeof a === 'string' ? b : a) ?? {};

  // TODO(engine pós-MVP): registrar/injetar as regras de `config`.
  if (isVariantConfig(config) && (config.variants || config.defaultVariants)) {
    const variants = config.variants ?? {};
    const defaults = config.defaultVariants ?? {};
    return (props: Record<string, string> = {}): string => {
      const classes: string[] = [name];
      const merged = { ...defaults, ...props };
      for (const variant in merged) {
        const value = merged[variant];
        if (value != null && variants[variant]?.[value]) {
          classes.push(`${name}--${value}`);
        }
      }
      return classes.join(' ');
    };
  }

  return name;
}

export function parts<T extends Record<string, StyleObject>>(
  name: string,
  config: T,
): Record<keyof T, string>;
export function parts<T extends Record<string, StyleObject>>(
  config: T,
): Record<keyof T, string>;
export function parts<T extends Record<string, StyleObject>>(
  a: string | T,
  b?: T,
): Record<keyof T, string> {
  const name = typeof a === 'string' ? a : nextName();
  const config = (typeof a === 'string' ? b : a) ?? ({} as T);
  const out = {} as Record<keyof T, string>;
  for (const part in config) {
    out[part as keyof T] = part === 'root' ? name : `${name}-${part}`;
  }
  // TODO(engine pós-MVP): registrar/injetar as regras de cada parte.
  return out;
}

export { cx };
