import { effect, signal, type Signal } from '@preact/signals-core';
import type { Behavior } from 'mini-q';
import { Task } from '@/$stdlib/task';

export function useAsyncValidator(
  value: Signal<string>,
  check: (v: string) => Promise<string | null>,
  debounceMs = 400,
) {
  const loading = signal(false);
  const error = signal<string | null>(null);

  // `gen` invalida checks em voo: qualquer mudança de valor (ou unmount) torna
  // obsoleta a resposta de uma checagem que ainda não resolveu.
  let gen = 0;
  const debounced = Task.debounce(async (v: string, my: number) => {
    try {
      const err = await check(v);
      if (my !== gen) return;
      error.value = err;
    } catch {
      if (my !== gen) return;
      error.value = 'Falha ao validar e-mail';
    } finally {
      if (my === gen) loading.value = false;
    }
  }, debounceMs);

  const use: Behavior = () => {
    const stop = effect(() => {
      const v = value.value;
      debounced.cancel();
      if (!v.trim() || !v.includes('@')) {
        error.value = null;
        loading.value = false;
        return;
      }
      loading.value = true;
      const my = ++gen;
      debounced(v, my);
    });
    return () => {
      debounced.cancel();
      gen += 1;
      stop();
    };
  };

  return { loading, error, use };
}
