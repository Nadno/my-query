import $ from 'mini-q';
import { $when } from 'mini-q';
import { signal, effect, type Signal } from '@preact/signals-core';
import type { Child, Behavior } from 'mini-q';
import { RovingIndex } from '@/$stdbrowser/roving-index';
import { sTabs } from './Tabs.style';

export interface TabItem {
  id: string;
  label: string;
  content: Child;
}

function useTablist(
  items: TabItem[],
  selected: Signal<string>,
  refs: (HTMLButtonElement | null)[],
): Behavior<HTMLDivElement> {
  return (ctx) => {
    const roving = RovingIndex.of(
      items.length,
      Math.max(0, items.findIndex((i) => i.id === selected.value)),
    );

    const move = (index: number) => {
      const item = items[index];
      if (!item) return;
      selected.value = item.id;
      refs[index]?.focus();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const r = roving.next(-1);
        if ('index' in r) move(r.index);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const r = roving.next(1);
        if ('index' in r) move(r.index);
      } else if (e.key === 'Home') {
        e.preventDefault();
        roving.set(0);
        move(roving.current);
      } else if (e.key === 'End') {
        e.preventDefault();
        roving.set(items.length - 1);
        move(roving.current);
      }
    };

    ctx.element.addEventListener('keydown', onKey);
    const stop = effect(() => {
      const index = items.findIndex((i) => i.id === selected.value);
      roving.set(index);
      refs.forEach((el, i) => {
        if (el) el.tabIndex = i === index ? 0 : -1;
      });
    });

    return () => {
      ctx.element.removeEventListener('keydown', onKey);
      stop();
    };
  };
}

export function Tabs(p: { items: TabItem[]; initial?: string }) {
  const selected = signal(p.initial ?? p.items[0]?.id ?? '');
  const refs = new Array<HTMLButtonElement | null>(p.items.length).fill(null);

  return $.div(
    { class: sTabs },
    $.div(
      { class: sTabs.list, role: 'tablist', use: useTablist(p.items, selected, refs) },
      ...p.items.map((item, index) => {
        const tabId = `tab-${item.id}`;
        const panelId = `tabpanel-${item.id}`;
        const isActive = () => selected.value === item.id;

        return $.button(
          {
            id: tabId,
            $class: () => sTabs.tab({ active: isActive() }),
            type: 'button',
            role: 'tab',
            aria: {
              selected: () => isActive(),
              controls: panelId,
            },
            on: { click: () => (selected.value = item.id) },
            use: (ctx) => {
              refs[index] = ctx.element as HTMLButtonElement;
              return () => {
                refs[index] = null;
              };
            },
          },
          item.label,
        );
      }),
    ),
    ...p.items.map((item) => {
      const panelId = `tabpanel-${item.id}`;
      const tabId = `tab-${item.id}`;

      return $when(
        () => selected.value === item.id,
        () =>
          $.div(
            {
              id: panelId,
              role: 'tabpanel',
              aria: { labelledBy: tabId },
              class: sTabs.panel,
            },
            item.content,
          ),
      );
    }),
  );
}
