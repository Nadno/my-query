// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { FocusGrid, stepForKey } from './FocusGrid';
import type { RovingOverflow } from '../roving-index';

describe('stepForKey', () => {
  it('maps arrows to one axis or a row of columns', () => {
    expect(stepForKey('ArrowRight', 7)).toBe(1);
    expect(stepForKey('ArrowLeft', 7)).toBe(-1);
    expect(stepForKey('ArrowDown', 7)).toBe(7);
    expect(stepForKey('ArrowUp', 7)).toBe(-7);
  });

  it('ignores keys that are not arrows', () => {
    expect(stepForKey('Tab', 7)).toBeNull();
    expect(stepForKey('Enter', 7)).toBeNull();
    expect(stepForKey('Home', 7)).toBeNull();
  });
});

describe('FocusGrid DOM', () => {
  let root: HTMLElement;
  let grid: FocusGrid;

  afterEach(() => {
    grid?.deactivate();
    root?.remove();
  });

  function mount(count: number, columns = 7) {
    root = document.createElement('div');
    root.setAttribute('role', 'grid');
    for (let index = 0; index < count; index++) {
      const cell = document.createElement('button');
      cell.setAttribute('role', 'gridcell');
      cell.textContent = String(index);
      root.append(cell);
    }
    document.body.append(root);
    return { columns };
  }

  function cells(): HTMLElement[] {
    return Array.from(root.querySelectorAll('[role="gridcell"]'));
  }

  function arrow(key: string) {
    root.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  }

  it('moves focus with arrows and keeps tabindex=0 on blur', () => {
    mount(14);
    grid = FocusGrid.of(root, { columns: 7 }).activate();
    const list = cells();
    expect(list[0]!.tabIndex).toBe(0);
    list[0]!.focus();
    arrow('ArrowRight');
    expect(document.activeElement).toBe(list[1]);
    expect(list[0]!.tabIndex).toBe(-1);
    expect(list[1]!.tabIndex).toBe(0);

    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    expect(list[1]!.tabIndex).toBe(0);
    expect(list.filter((cell) => cell.tabIndex === 0)).toHaveLength(1);
    outside.remove();
  });

  it('reports overflow edge and step at the grid border', () => {
    const overflows: { edge: RovingOverflow; step: number }[] = [];
    mount(14);
    grid = FocusGrid.of(root, {
      columns: 7,
      onOverflow: (edge, { step }) => overflows.push({ edge, step }),
    }).activate();

    const list = cells();
    list[13]!.focus();
    arrow('ArrowRight');
    expect(overflows).toEqual([{ edge: 'after', step: 1 }]);
    expect(document.activeElement).toBe(list[13]);

    list[10]!.focus();
    arrow('ArrowDown');
    expect(overflows[1]).toEqual({ edge: 'after', step: 7 });

    list[0]!.focus();
    arrow('ArrowLeft');
    expect(overflows[2]).toEqual({ edge: 'before', step: -1 });
  });

  it('calls onMove after an arrow that stays in the grid, not on overflow', () => {
    const moved: HTMLElement[] = [];
    mount(14);
    grid = FocusGrid.of(root, {
      columns: 7,
      onMove: (cell) => moved.push(cell),
    }).activate();

    const list = cells();
    list[0]!.focus();
    arrow('ArrowRight');
    expect(moved).toEqual([list[1]]);

    list[13]!.focus();
    arrow('ArrowRight');
    expect(moved).toHaveLength(1);
  });
});
