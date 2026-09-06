/**
 * Custom events — fontes que montam listeners e emitem para o handler.
 *
 * Uma `EventSource` recebe o elemento-alvo e uma função `emit`; monta o que precisar
 * (listener global, delegação…) e retorna o cleanup. Custom events "disparam", então
 * moram em `on: {}` (a fronteira: se comporta sem disparar → `use`).
 */

import type { Cleanup } from '../lifecycle';

export type EventSource<Ev = Event> = (
  target: Element,
  emit: (event: Ev) => void,
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

registerCustomEvent<FocusEvent>('focusOutside', (target, emit) => {
  const onFocus = (e: FocusEvent) => {
    if (!target.contains(e.target as Node)) emit(e);
  };
  document.addEventListener('focusin', onFocus, true);
  return () => document.removeEventListener('focusin', onFocus, true);
});

registerCustomEvent<MouseEvent>('hover', (target, emit) => {
  const onEnter = (e: Event) => emit(e as MouseEvent);
  target.addEventListener('mouseenter', onEnter);
  return () => target.removeEventListener('mouseenter', onEnter);
});
