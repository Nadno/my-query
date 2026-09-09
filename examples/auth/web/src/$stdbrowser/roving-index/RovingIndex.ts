export type RovingOverflow = 'before' | 'after';

export type RovingMove =
  | { index: number }
  | { overflow: RovingOverflow };

export type RovingNextInput = {
  index: number;
  count: number;
  step: number;
  loop?: boolean;
};

function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  if (index < 0) return 0;
  if (index >= count) return count - 1;
  return index;
}

export class RovingIndex {
  #current: number;
  #count: number;

  private constructor(count: number, current: number) {
    this.#count = Math.max(0, count);
    this.#current = clampIndex(current, this.#count);
  }

  static of(count: number, current = 0): RovingIndex {
    return new RovingIndex(count, current);
  }

  /** 1D: um eixo. Sem colunas — isso é FocusGrid. */
  static next(input: RovingNextInput): RovingMove {
    const { index, count, step, loop = false } = input;
    if (count <= 0) {
      return { overflow: step < 0 ? 'before' : 'after' };
    }

    const next = index + step;
    if (next < 0) {
      if (loop) {
        return { index: ((next % count) + count) % count };
      }
      return { overflow: 'before' };
    }
    if (next >= count) {
      if (loop) {
        return { index: next % count };
      }
      return { overflow: 'after' };
    }
    return { index: next };
  }

  get current(): number {
    return this.#current;
  }

  get count(): number {
    return this.#count;
  }

  resize(count: number): this {
    this.#count = Math.max(0, count);
    this.#current = clampIndex(this.#current, this.#count);
    return this;
  }

  set(index: number): this {
    this.#current = clampIndex(index, this.#count);
    return this;
  }

  next(step: number, loop = false): RovingMove {
    const result = RovingIndex.next({
      index: this.#current,
      count: this.#count,
      step,
      loop,
    });
    if ('index' in result) this.#current = result.index;
    return result;
  }
}
