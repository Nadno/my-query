/**
 * Obj — Utilitários para manipulação de objetos
 */

const _tag = (v: unknown): string =>
  Object.prototype.toString.call(v).slice(8, -1).toLowerCase();

export class Obj {
  private constructor() {}

  /**
   * Serializa um objeto para uma string determinística usada como identificador.
   * As chaves são ordenadas para garantir consistência.
   */
  static identity(obj: object | null | undefined): string {
    if (obj === null || obj === undefined) return '';
    return JSON.stringify(obj, Object.keys(obj).sort());
  }

  static isEmpty(value: object | null | undefined): boolean {
    return value == null || Object.keys(value).length == 0;
  }

  /**
   * Retorna um novo objeto sem as chaves especificadas.
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  /**
   * Retorna um novo objeto sem as chaves especificadas.
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (keys.includes(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * Deep merge de dois objetos. O segundo sobrescreve o primeiro.
   * Arrays são substituídos, não concatenados.
   */
  static merge<T extends Record<string, any>>(
    target: T | undefined,
    source: Partial<T> | undefined,
  ): T {
    if (!target) return (source ?? {}) as T;
    if (!source) return target;

    const result = { ...target } as Record<string, any>;

    for (const key of Object.keys(source)) {
      const srcVal = (source as Record<string, any>)[key];
      const tgtVal = result[key];

      if (_tag(srcVal) === 'object' && _tag(tgtVal) === 'object') {
        result[key] = Obj.merge(tgtVal, srcVal);
      } else {
        result[key] = srcVal;
      }
    }

    return result as T;
  }
}
