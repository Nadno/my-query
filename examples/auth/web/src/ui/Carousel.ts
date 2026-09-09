import $ from 'mini-q';
import { signal } from '@preact/signals-core';
import type { Child, Behavior } from 'mini-q';
import EmblaCarousel from 'embla-carousel';
import { sCarousel } from './Carousel.style';

type EmblaApi = ReturnType<typeof EmblaCarousel>;

export function Carousel<T>(p: {
  items: readonly T[];
  renderSlide: (item: T, index: number) => Child;
  loop?: boolean;
}) {
  const selected = signal(0);
  const canPrev = signal(false);
  const canNext = signal(false);
  let apiRef: EmblaApi | null = null;

  const useCarousel: Behavior<HTMLDivElement> = (ctx) => {
    apiRef = EmblaCarousel(ctx.element, {
      loop: p.loop ?? true,
      align: 'start',
    });

    const update = () => {
      selected.value = apiRef!.selectedScrollSnap();
      canPrev.value = apiRef!.canScrollPrev();
      canNext.value = apiRef!.canScrollNext();
    };

    apiRef.on('select', update);
    update();

    return () => {
      apiRef?.destroy();
      apiRef = null;
    };
  };

  const withApi = (fn: (api: EmblaApi) => void) => {
    if (apiRef) fn(apiRef);
  };

  return $.div(
    { class: sCarousel },
    $.div(
      { class: sCarousel.viewport, use: useCarousel },
      $.div(
        { class: sCarousel.container },
        ...p.items.map((item, i) =>
          $.div({ class: sCarousel.slide }, p.renderSlide(item, i)),
        ),
      ),
    ),
    $.div(
      { class: sCarousel.controls },
      $.button(
        {
          class: sCarousel.arrow,
          type: 'button',
          $disabled: () => !canPrev.value && !(p.loop ?? true),
          on: { click: () => withApi((api) => api.scrollPrev()) },
        },
        '‹',
      ),
      ...p.items.map((_, i) =>
        $.button(
          {
            $class: () => sCarousel.dot({ active: selected.value === i }),
            type: 'button',
            on: { click: () => withApi((api) => api.scrollTo(i)) },
            aria: { label: `Ir para o slide ${i + 1}` },
          },
          '',
        ),
      ),
      $.button(
        {
          class: sCarousel.arrow,
          type: 'button',
          $disabled: () => !canNext.value && !(p.loop ?? true),
          on: { click: () => withApi((api) => api.scrollNext()) },
        },
        '›',
      ),
    ),
  );
}
