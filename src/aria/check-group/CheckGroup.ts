export type CheckGroupOptions = {
  /** Permite múltiplos checados ao mesmo tempo. Default: false (exclusivo). */
  multiple?: boolean;
  /** Permite que todos fiquem desmarcados. Default: true. */
  allowAllUnchecked?: boolean;
  /** Nome registrado que começa checado (default no registro). */
  defaultChecked?: string;
};

type ResolvedOptions = {
  multiple: boolean;
  allowAllUnchecked: boolean;
  defaultChecked: string | undefined;
};

/**
 * CheckGroup — regras de seleção para grupos de radio/switch/toggle
 * (WAI-ARIA): exclusividade (`multiple:false`), e o invariant "não fica
 * tudo desmarcado" quando `allowAllUnchecked:false`. Não tem estado reativo
 * — o consumidor persiste como quiser (signal, use) e consulta regras aqui.
 */
export class CheckGroup {
  private readonly options: ResolvedOptions;
  private readonly checkers = new Map<string, boolean>();

  private constructor(options: CheckGroupOptions) {
    this.options = {
      multiple: options.multiple ?? false,
      allowAllUnchecked: options.allowAllUnchecked ?? true,
      defaultChecked: options.defaultChecked,
    } satisfies ResolvedOptions;
  }

  static of(options: CheckGroupOptions = {}): CheckGroup {
    return new CheckGroup(options);
  }

  has(name: string): boolean {
    return this.checkers.has(name);
  }

  isChecked(name: string): boolean {
    return this.checkers.get(name) ?? false;
  }

  get checked(): string[] {
    const names: string[] = [];
    for (const [name, checked] of this.checkers) {
      if (checked) names.push(name);
    }
    return names;
  }

  register(name: string, checked: boolean): void {
    if (this.checkers.has(name)) {
      throw new Error(`[mini-q/aria] CheckGroup: item duplicado "${name}"`);
    }
    const desired = this.options.defaultChecked === name ? true : checked;
    this.checkers.set(name, desired);

    if (desired && !this.options.multiple) this.keepOnly(name);
    if (!desired && !this.options.allowAllUnchecked) this.keepLastCheckedOr(name);
  }

  unregister(name: string): void {
    this.checkers.delete(name);
  }

  set(name: string, checked: boolean): void {
    if (!this.checkers.has(name)) return;
    this.checkers.set(name, checked);
    if (checked && !this.options.multiple) this.keepOnly(name);
    if (!checked && !this.options.allowAllUnchecked) this.keepLastCheckedOr(name);
  }

  /** Mantém apenas `name` checado (desmarca os demais). */
  private keepOnly(name: string): void {
    for (const other of this.checkers.keys()) {
      if (other !== name) this.checkers.set(other, false);
    }
  }

  /** Garante que ao menos `name` fica checado (ou outro ainda checado). */
  private keepLastCheckedOr(name: string): void {
    for (const [, checked] of this.checkers) {
      if (checked) return;
    }
    this.checkers.set(name, true);
  }
}
