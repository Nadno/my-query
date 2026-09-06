/**
 * Pattern — API de pattern matching para valores literais, condições complexas,
 * state machines e enums utilitários.
 */

// ========== INTERFACES AUXILIARES ==========

interface PatternDefineBuilder<T extends Record<string, string | number>> {
  handler(key: keyof T, handler: Function): this;
  default(key: keyof T): this;
  build(): PatternStrategy;
}

interface PatternStrategy {
  handle(type: string, ...args: any[]): any;
  default(...args: any[]): any;
  has(type: string): boolean;
}

interface PatternEnum<T extends Record<string, string | number>> {
  keys(): string[];
  values(): string[];
  from(value: string): string | undefined;
  has(key: string): boolean;
}

// ========== CLASSE PATTERN ==========

class Pattern {
  /**
   * Pattern.match() - Valores literais
   * Equivalente a switch/case
   */
  static match<T, R>(
    value: T,
    cases: Record<string | number, R> & { _?: R }
  ): R | undefined {
    const key = String(value);
    if (key in cases) return cases[key as keyof typeof cases];
    if ('_' in cases) return cases._;
    return undefined;
  }

  /**
   * Pattern.when() - Condições complexas
   * Equivalente a if/else chain
   */
  static when<T>(value: T): PatternWhen<T> {
    return new PatternWhen(value);
  }

  /**
   * Pattern.define() - State machines
   * Strategy pattern com handlers
   */
  static define<T extends Record<string, string | number>>(
    name: string,
    schema: T
  ): PatternDefineBuilder<T> {
    return new PatternDefineBuilder(name, schema);
  }

  /**
   * Pattern.enum() - Enums utilitários
   * Bidirectional key/value mapping
   */
  static enum<T extends Record<string, string | number>>(
    schema: T
  ): PatternEnum<T> {
    return new PatternEnumImpl(schema);
  }
}

// ========== CLASSE PATTERNWHEN ==========

class PatternWhen<T> {
  private matched: any[] = [];

  constructor(private value: T) {}

  is(predicate: (value: T) => boolean, result: any): this {
    if (predicate(this.value) && this.matched.length === 0) {
      this.matched.push(result);
    }
    return this;
  }

  else(result: any): any {
    return this.matched.length > 0 ? this.matched[0] : result;
  }

  // Alias
  or = this.else;
  default = this.else;
}

// ========== CLASSE PATTERNDEFINEBUILDER ==========

class PatternDefineBuilder<T extends Record<string, string | number>> {
  private handlers: Record<string, Function> = {};
  private defaultKey: string | null = null;

  constructor(
    private name: string,
    private schema: T
  ) {}

  handler(key: keyof T, handler: Function): this {
    this.handlers[String(this.schema[key])] = handler;
    return this;
  }

  default(key: keyof T): this {
    this.defaultKey = String(this.schema[key]);
    return this;
  }

  build(): PatternStrategy {
    const handlers = this.handlers;
    let defaultKey = this.defaultKey;
    const name = this.name;

    return {
      handle(type: string, ...args: any[]) {
        const key = String(type);
        if (handlers[key]) return handlers[key](...args);
        if (defaultKey && handlers[defaultKey]) return handlers[defaultKey](...args);
        throw new Error(`No handler for "${key}" in "${name}"`);
      },
      default(...args: any[]) {
        if (defaultKey && handlers[defaultKey]) return handlers[defaultKey](...args);
        throw new Error('No default handler defined');
      },
      has(type: string) {
        return String(type) in handlers;
      }
    };
  }
}

// ========== CLASSE PATTERNENUMIMPL ==========

class PatternEnumImpl<T extends Record<string, string | number>> {
  private reverse: Record<string, string>;

  constructor(private schema: T) {
    this.reverse = Object.entries(schema).reduce((acc, [k, v]) => {
      acc[String(v)] = k;
      return acc;
    }, {} as Record<string, string>);
  }

  keys(): string[] {
    return Object.keys(this.schema) as string[];
  }

  values(): string[] {
    return Object.values(this.schema) as string[];
  }

  from(value: string): string | undefined {
    if (value in this.schema) return String(this.schema[value as keyof T]);
    if (value in this.reverse) return this.reverse[value];
    return undefined;
  }

  has(key: string): boolean {
    return key in this.schema || key in this.reverse;
  }
}

// ========== EXPORTS ==========

export { Pattern };
export type { PatternDefineBuilder, PatternStrategy, PatternEnum };
