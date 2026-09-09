/**
 * Custom events — fontes que montam listeners e emitem para o handler.
 *
 * Uma `EventSource` recebe o elemento-alvo, uma função `emit` e as **opções da fonte**
 * (o objeto no fim da tupla de `on: {}`); monta o que precisar (listener global,
 * delegação…) e retorna o cleanup. Custom events "disparam", então moram em `on: {}`
 * (a fronteira: se comporta sem disparar → `use`).
 *
 * `emit` devolve o retorno do handler (`void | Cleanup`): num custom event **pareado**
 * (enter↔leave, ex. `hover`), a fonte guarda esse retorno e o roda quando o leave
 * acontece. Quem decide os listeners DOM é a fonte — as opções da tupla não são
 * `AddEventListenerOptions`, são o canal de opções dela (tipado por evento via
 * `MQCustomEventOptions`).
 */

import type { Cleanup } from '../lifecycle';
import type { HoverOptions } from './types';

export type EventSource<Ev = Event, Opts = unknown> = (
  target: Element,
  emit: (event: Ev) => void | Cleanup,
  options?: Opts,
) => Cleanup;

const registry = new Map<string, EventSource>();

export function registerCustomEvent<Ev = Event, Opts = unknown>(
  name: string,
  source: EventSource<Ev, Opts>,
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
 * `hover` — enter↔leave pareado com Pointer Events unificados e hold-to-hover.
 *
 * - **Mouse/caneta**: `pointerenter` → handler (devolve o cleanup do "un-hover"),
 *   `pointerleave` → roda o cleanup. Com `delayIn`/`delayOut` opcionais.
 * - **Touch** (`touchable`): segurar o dedo por `holdDelay` = hover (emite o próprio
 *   `pointerdown`); soltar (`pointerup`) = sair; `pointercancel`/scroll cancelam o hold
 *   e saem. Durante o hold, `contextmenu`/`selectstart` são suprimidos.
 */
registerCustomEvent<PointerEvent, HoverOptions>('hover', (target, emit, opts = {}) => {
  const { delayIn = 0, delayOut = 0, touchable = false, holdDelay = 500 } = opts;
  let leave: Cleanup | undefined;
  let enterTimer: ReturnType<typeof setTimeout> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let touchHold = false; // hold de touch em andamento (p/ suprimir contextmenu/seleção)

  const clearTimers = () => {
    if (enterTimer) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
  };

  const runLeave = () => {
    touchHold = false;
    if (leave) {
      leave();
      leave = undefined;
    }
  };

  const scheduleLeave = () => {
    if (enterTimer) {
      clearTimeout(enterTimer);
      enterTimer = undefined;
    }
    if (delayOut > 0) leaveTimer = setTimeout(runLeave, delayOut);
    else runLeave();
  };

  const enter = (e: PointerEvent) => {
    if (leave) leave(); // defensivo: re-enter sem leave pendente
    leave = emit(e) ?? undefined;
  };

  const scheduleEnter = (e: PointerEvent) => {
    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = undefined;
    }
    if (delayIn > 0) enterTimer = setTimeout(() => enter(e), delayIn);
    else enter(e);
  };

  // mouse/caneta: pointerenter/pointerleave
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return; // touch é hold-to-hover
    scheduleEnter(e);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    scheduleLeave();
  };

  // touch: hold-to-hover
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touchHold = true;
    holdTimer = setTimeout(() => {
      holdTimer = undefined;
      enter(e);
    }, holdDelay);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touchHold = false;
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
    scheduleLeave();
  };
  const onPointerCancel = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touchHold = false;
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
    runLeave();
  };
  const onScroll = () => {
    if (!holdTimer && !leave) return;
    touchHold = false;
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = undefined;
    }
    runLeave();
  };
  const onContextMenu = (e: Event) => {
    if (touchHold) e.preventDefault();
  };
  const onSelectStart = (e: Event) => {
    if (touchHold) e.preventDefault();
  };

  target.addEventListener('pointerenter', onPointerEnter as EventListener);
  target.addEventListener('pointerleave', onPointerLeave as EventListener);
  if (touchable) {
    target.addEventListener('pointerdown', onPointerDown as EventListener);
    target.addEventListener('pointerup', onPointerUp as EventListener);
    target.addEventListener('pointercancel', onPointerCancel as EventListener);
    document.addEventListener('scroll', onScroll, true);
    target.addEventListener('contextmenu', onContextMenu);
    target.addEventListener('selectstart', onSelectStart);
  }

  return () => {
    target.removeEventListener('pointerenter', onPointerEnter as EventListener);
    target.removeEventListener('pointerleave', onPointerLeave as EventListener);
    if (touchable) {
      target.removeEventListener('pointerdown', onPointerDown as EventListener);
      target.removeEventListener('pointerup', onPointerUp as EventListener);
      target.removeEventListener('pointercancel', onPointerCancel as EventListener);
      document.removeEventListener('scroll', onScroll, true);
      target.removeEventListener('contextmenu', onContextMenu);
      target.removeEventListener('selectstart', onSelectStart);
    }
    clearTimers();
    runLeave();
  };
});
