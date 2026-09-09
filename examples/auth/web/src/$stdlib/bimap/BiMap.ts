type RowValue = string | number;

type RowsDefinition = Record<string, Record<string, RowValue>>;

type ColumnNames<T extends RowsDefinition> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

type ColumnValue<
  T extends RowsDefinition,
  C extends ColumnNames<T>,
> = {
  [K in keyof T]: C extends keyof T[K] ? T[K][C] : never;
}[keyof T];

export type BiMapInstance<T extends RowsDefinition> = {
  get<K extends keyof T>(key: K): T[K];
  keyBy<C extends ColumnNames<T>>(
    column: C,
    value: ColumnValue<T, C>,
  ): keyof T | undefined;
  readonly keys: readonly (keyof T)[];
  column<C extends ColumnNames<T>>(name: C): readonly ColumnValue<T, C>[];
  has(key: unknown): key is keyof T;
};

function buildReverseIndexes<T extends RowsDefinition>(
  rows: T,
): Map<string, Map<RowValue, keyof T>> {
  const indexes = new Map<string, Map<RowValue, keyof T>>();

  for (const key of Object.keys(rows) as (keyof T)[]) {
    const row = rows[key];
    if (row == null) continue;

    for (const [column, value] of Object.entries(row)) {
      let columnIndex = indexes.get(column);
      if (columnIndex == null) {
        columnIndex = new Map();
        indexes.set(column, columnIndex);
      }

      if (columnIndex.has(value)) {
        throw new Error(
          `BiMap.rows: duplicate value ${JSON.stringify(value)} in column "${column}"`,
        );
      }

      columnIndex.set(value, key);
    }
  }

  return indexes;
}

class BiMapImpl<T extends RowsDefinition> implements BiMapInstance<T> {
  private readonly reverseIndexes: Map<string, Map<RowValue, keyof T>>;
  private readonly rows: T;

  constructor(rows: T) {
    this.rows = rows;
    this.reverseIndexes = buildReverseIndexes(rows);
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.rows[key];
  }

  keyBy<C extends ColumnNames<T>>(
    column: C,
    value: ColumnValue<T, C>,
  ): keyof T | undefined {
    return this.reverseIndexes.get(column as string)?.get(value as RowValue);
  }

  get keys(): readonly (keyof T)[] {
    return Object.keys(this.rows) as (keyof T)[];
  }

  column<C extends ColumnNames<T>>(name: C): readonly ColumnValue<T, C>[] {
    return this.keys.map((key) =>
      (this.rows[key] as Record<string, RowValue>)[name as string],
    ) as ColumnValue<T, C>[];
  }

  has(key: unknown): key is keyof T {
    return typeof key === 'string' && Object.hasOwn(this.rows, key);
  }
}

export const BiMap = {
  rows<T extends RowsDefinition>(rows: T): BiMapInstance<T> {
    return new BiMapImpl(rows);
  },
};
