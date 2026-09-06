import $ from './mini-stack/query';

import {
  signal,
  computed,
  effect,
  Signal,
  Computed,
} from './mini-stack/query/signal';

$.useSignal({
  isSignal: (value) => value instanceof Signal || value instanceof Computed,
  getValue: (value) => value.value,
  effect,
});

const Counter = $.div<{ count: number }>(({ count }) => {
  const counterLabel = computed(() => `Counter: ${count.value}`);

  return [
    $.span(
      {
        $data: {
          count,
        },
        '$aria-label': counterLabel,
        dir: '',
      },
      () => `Counter: ${count.value}`,
    ),
    $.button(
      {
        on: {
          click: () => count.value++,
        },
      },
      'Increment',
    ),
    $.button(
      {
        on: {
          click: () => count.value--,
        },
      },
      'Decrement',
    ),
  ];
});

const App = $.div(() => {
  const count = signal(0);

  return () => ['Hello world!', count.value % 2 === 0  ? 'Even' : 'Odd', Counter({ count })];
});

$.mount(document.body, App);
