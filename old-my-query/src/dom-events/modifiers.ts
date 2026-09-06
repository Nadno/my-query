import { Obj } from '@/mini-stack/primitives';

export type ExternalModifierMeta = {
  args?: any[];
  [key: string]: any;
};

export type InternalModifierMeta = {
  modifierName: string;
} & ExternalModifierMeta;

export type Modifier<TMeta extends object = {}> = {
  name: string;
  meta?: ExternalModifierMeta & TMeta;
};

export type ModifierResult<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = {
  identifier: string;
  handler: THandler;
  meta?: object & TMeta;
};

export type ModifierFactory<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = (
  handler: THandler,
  meta: InternalModifierMeta & TMeta,
) => ModifierResult<TMeta, THandler>;

export type ModifierTransform<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = (
  current: Partial<ModifierResult<TMeta, THandler>>,
  modified: ModifierResult<TMeta, THandler>,
) => ModifierResult<TMeta, THandler>;

export type ModifyOptions<
  TMeta extends object = {},
  THandler extends AnyFunction = AnyFunction,
> = {
  transform?: ModifierTransform<TMeta, THandler>;
};

type ModifierEntry = {
  factory: ModifierFactory;
  priority: number;
};

const DEFAULT_PRIORITY = 10;

const DEFAULT_MODIFY_TRANSFORM: ModifierTransform<any, any> = (current, modified) => ({
  ...modified,
  meta: modified.meta
    ? { ...current.meta, ...modified.meta }
    : current.meta,
  identifier: current.identifier
    ? current.identifier.concat(':', modified.identifier)
    : modified.identifier,
});

const modifierRegistry: Record<string, ModifierEntry> = Object.create(null);

export class DOMEventModifiers {
  public static register<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    modifier: string,
    factory: ModifierFactory<TMeta, THandler>,
    priority: number = DEFAULT_PRIORITY,
  ): typeof DOMEventModifiers {
    if (typeof factory !== 'function')
      throw new TypeError('Expected factory parameter to be a function!');

    modifierRegistry[modifier] = { factory: factory as unknown as ModifierFactory, priority };

    return DOMEventModifiers;
  }

  public static unregister(modifier: string): void {
    delete modifierRegistry[modifier];
  }

  public static clear(): void {
    for (const key of Object.keys(modifierRegistry)) {
      delete modifierRegistry[key];
    }
  }

  public static has(modifier: string): boolean {
    return modifier in modifierRegistry;
  }

  public static get(modifier: string): ModifierFactory | undefined {
    return modifierRegistry[modifier]?.factory;
  }

  public static getPriority(modifier: string): number | undefined {
    return modifierRegistry[modifier]?.priority;
  }

  public static modify<
    TMeta extends object = {},
    THandler extends AnyFunction = AnyFunction,
  >(
    handler: THandler | ModifierResult<TMeta, THandler>,
    modifiers: Modifier<TMeta>[],
    options: ModifyOptions<TMeta, THandler> = {},
  ): ModifierResult<TMeta, THandler> {
    const { transform = DEFAULT_MODIFY_TRANSFORM } = options;

    const sorted = [...modifiers].sort((a, b) => {
      const pa = modifierRegistry[a.name]?.priority ?? DEFAULT_PRIORITY;
      const pb = modifierRegistry[b.name]?.priority ?? DEFAULT_PRIORITY;
      return pa - pb;
    });

    return sorted.reduce(
      (result, modifier) => {
        const entry = modifierRegistry[modifier.name];
        if (!entry) return result;

        const modified = entry.factory(result.handler, {
          ...Obj.merge(result.meta, modifier.meta),
          modifierName: modifier.name,
        }) as ModifierResult<TMeta, THandler>;

        return transform(result, modified);
      },
      { handler } as ModifierResult<TMeta, THandler>,
    );
  }
}
