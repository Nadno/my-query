import $ from 'mini-q';
import { $when } from 'mini-q';
import { signal, computed } from '@preact/signals-core';
import type { Child } from 'mini-q';
import { sAccordion } from './Accordion.style';

export interface AccordionItem {
  id: string;
  title: string;
  content: Child;
}

export function Accordion(p: {
  items: AccordionItem[];
  single?: boolean;
  initial?: string[];
}) {
  const open = signal<Set<string>>(new Set(p.initial ?? []));
  const isOpen = (id: string) => computed(() => open.value.has(id));

  const toggle = (id: string) => {
    const next = new Set(open.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (p.single) next.clear();
      next.add(id);
    }
    open.value = next;
  };

  return $.div(
    { class: sAccordion },
    ...p.items.map((item) => {
      const sectionId = `acc-section-${item.id}`;
      const panelId = `acc-panel-${item.id}`;
      const expanded = isOpen(item.id);

      return $.div(
        { class: sAccordion.section },
        $.button(
          {
            class: sAccordion.trigger,
            type: 'button',
            aria: {
              expanded: () => expanded.value,
              controls: panelId,
            },
            id: sectionId,
            on: { click: () => toggle(item.id) },
          },
          item.title,
          $.span(
            { $class: () => sAccordion.marker({ open: expanded.value }) },
            '▾',
          ),
        ),
        $when(
          () => expanded.value,
          () =>
            $.div(
              {
                id: panelId,
                role: 'region',
                aria: { labelledBy: sectionId },
                class: sAccordion.panel,
              },
              item.content,
            ),
        ),
      );
    }),
  );
}
