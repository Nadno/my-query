/**
 * Custom events — fontes que montam listeners e emitem para o handler.
 *
 * Uma `EventSource` recebe o elemento-alvo e uma função `emit`; monta o que precisar
 * (listener global, delegação…) e retorna o cleanup. Custom events "disparam", então
 * moram em `on: {}` (a fronteira: se comporta sem disparar → `use`).
 *
 * `emit` devolve o retorno do handler (`void | Cleanup`): num custom event **pareado**
 * (enter↔leave, ex. `hover`), a fonte guarda esse retorno e o roda quando o leave
 * acontece. O canal de opções da fonte (ex. `touchable`/delays do hover) fica para a
 * etapa própria do hover-touch.
 */

import type { Cleanup } from '../lifecycle';

export type EventSource<Ev = Event> = (
  target: Element,
  emit: (event: Ev) => void | Cleanup,
) => Cleanup;

const registry = new Map<string, EventSource>();

export function registerCustomEvent<Ev = Event>(
  name: string,
  source: EventSource<Ev>,
): void {
  registry.set(name, source as EventSource);
}

export function getCustomEvent(name: string): EventSource | undefined {
  return registry.get(name);
}

registerCustomEvent<PointerEvent>('clickOutside', (target, emit) => {
  const onDown = (e: PointerEvent) => {
    if (!target.contains(e.target as Node)) emit(e);
  };
  document.addEventListener('pointerdown', onDown, true);
  return () => document.removeEventListener('pointerdown', onDown, true);
});

/**
 * `focusOutside` — enter quando o foco **sai** do alvo (via `relatedTarget`), leave
 * quando volta. Mais preciso que o `focusin` global antigo: só dispara na saída do
 * alvo, não em qualquer mudança de foco fora dele.
 */
registerCustomEvent<FocusEvent>('focusOutside', (target, emit) => {
  let leave: Cleanup | undefined;
  const onFocusOut = (e: FocusEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && target.contains(related)) return; // foi para dentro → não emite
    if (leave) leave(); // defensivo: re-enter sem leave pendente
    leave = emit(e) ?? undefined;
  };
  const onFocusIn = () => {
    if (leave) {
      leave();
      leave = undefined;
    }
  };
  target.addEventListener('focusout', onFocusOut as EventListener);
  target.addEventListener('focusin', onFocusIn as EventListener);
  return () => {
    target.removeEventListener('focusout', onFocusOut as EventListener);
    target.removeEventListener('focusin', onFocusIn as EventListener);
    if (leave) {
      leave();
      leave = undefined;
    }
  };
});

/**
 * `interactOutside` — enter no 1º `pointerdown` **fora** do alvo, leave num
 * `pointerdown` **dentro**. O padrão "interagiu fora" (backdrop de popover/modal).
 */
registerCustomEvent<PointerEvent>('interactOutside', (target, emit) => {
  let leave: Cleanup | undefined;
  const onDown = (e: PointerEvent) => {
    if (target.contains(e.target as Node)) {
      if (leave) {
        leave();
        leave = undefined;
      }
    } else {
      if (leave) leave(); // defensivo: re-enter sem leave pendente
      leave = emit(e) ?? undefined;
    }
  };
  document.addEventListener('pointerdown', onDown, true);
  return () => {
    document.removeEventListener('pointerdown', onDown, true);
    if (leave) {
      leave();
      leave = undefined;
    }
  };
});

/**
 * `hover` — enter↔leave pareado: `mouseenter` → handler (devolve o cleanup do
 * "un-hover"), `mouseleave` → roda o cleanup. Sem delay/touch (etapa própria).
 */
registerCustomEvent<MouseEvent>('hover', (target, emit) => {
  let leave: Cleanup | undefined;
  const onEnter = (e: Event) => {
    if (leave) leave(); // defensivo: re-enter sem leave pendente
    leave = emit(e as MouseEvent) ?? undefined;
  };
  const onLeave = () => {
    if (leave) {
      leave();
      leave = undefined;
    }
  };
  target.addEventListener('mouseenter', onEnter);
  target.addEventListener('mouseleave', onLeave);
  return () => {
    target.removeEventListener('mouseenter', onEnter);
    target.removeEventListener('mouseleave', onLeave);
    if (leave) {
      leave();
      leave = undefined;
    }
  };
});
