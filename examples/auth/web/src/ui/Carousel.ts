import $ from 'mini-q';
import { $each } from 'mini-q';
import { signal } from '@preact/signals-core';
import type { Child, Behavior, Component } from 'mini-q';
import EmblaCarousel from 'embla-carousel';
import { sCarousel } from './Carousel.style';

type EmblaApi = ReturnType<typeof EmblaCarousel>;

type SlideProps<T> = {
  item: T;
  index: number;
  renderSlide: (item: T, index: number) => Child;
};

function CarouselSlide<T>(p: SlideProps<T>) {
  return $.div(
    { class: sCarousel.slide },
    p.renderSlide(p.item, p.index),
  );
}

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

  const slides = () =>
    p.items.map((item, index) => ({
      item,
      index,
      renderSlide: p.renderSlide,
    }));

  return $.div(
    { class: sCarousel },
    $.div(
      { class: sCarousel.viewport, use: useCarousel },
      $.div(
        { class: sCarousel.container },
        $each(slides, CarouselSlide as Component<SlideProps<T>>, (t) => String(t.index)),
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
          aria: { label: 'Slide anterior' },
        },
        '‹',
      ),
      $each(
        () => p.items.map((_, i) => ({ index: i })),
        (dot: { index: number }) =>
          $.button(
            {
              $class: () => sCarousel.dot({ active: selected.value === dot.index }),
              type: 'button',
              on: { click: () => withApi((api) => api.scrollTo(dot.index)) },
              aria: { label: `Ir para o slide ${dot.index + 1}` },
            },
            '',
          ),
        (dot) => String(dot.index),
      ),
      $.button(
        {
          class: sCarousel.arrow,
          type: 'button',
          $disabled: () => !canNext.value && !(p.loop ?? true),
          on: { click: () => withApi((api) => api.scrollNext()) },
          aria: { label: 'Próximo slide' },
        },
        '›',
      ),
    ),
  );
}
