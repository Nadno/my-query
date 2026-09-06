class Scope {
  private static counter = 0
  private idCounter = 0
  
  constructor(public readonly prefix: string) {}
  
  static create(...prefixes: string[]): Scope {
    const prefix = prefixes.filter(Boolean).join('-')
    return new Scope(prefix || `scope-${Scope.counter++}`)
  }
  
  id(name: string = 'id'): string {
    return `${this.prefix}-${name}-${++this.idCounter}`
  }
  
  // Para dependency injection simples
  static current = new Scope('global')
  
  static provide<T>(scope: Scope, factory: () => T): T {
    const previous = Scope.current
    Scope.current = scope
    try {
      return factory()
    } finally {
      Scope.current = previous
    }
  }
}
