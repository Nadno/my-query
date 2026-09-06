import { effect, signal, type Signal } from '@preact/signals-core';
import type { Behavior } from 'mini-q';

export function useAsyncValidator(
  value: Signal<string>,
  check: (v: string) => Promise<string | null>,
  debounceMs = 400,
) {
  const loading = signal(false);
  const error = signal<string | null>(null);

  const use: Behavior = () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let gen = 0;
    const stop = effect(() => {
      const v = value.value;
      window.clearTimeout(timer);
      if (!v.trim() || !v.includes('@')) {
        error.value = null;
        loading.value = false;
        return;
      }
      loading.value = true;
      const my = ++gen;
      timer = setTimeout(() => {
        void check(v).then(
          (err) => {
            if (my !== gen) return;
            error.value = err;
            loading.value = false;
          },
          () => {
            if (my !== gen) return;
            error.value = 'Falha ao validar e-mail';
            loading.value = false;
          },
        );
      }, debounceMs);
    });
    return () => {
      window.clearTimeout(timer);
      gen += 1;
      stop();
    };
  };

  return { loading, error, use };
}
