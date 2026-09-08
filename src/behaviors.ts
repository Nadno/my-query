/** `use` — aplicação de behaviors + behaviors base (model, show). */

import { registerCleanup } from './lifecycle';
import { bind, read, setValue, type Bindable } from './reactive';
import { on } from './events';
import type { Behavior, MQ } from './types';

export function applyUse(ctx: MQ, use: Behavior | Behavior[]): void {
  const list = Array.isArray(use) ? use : [use];
  for (const behavior of list) {
    const cleanup = behavior(ctx);
    if (typeof cleanup === 'function') registerCleanup(cleanup);
  }
}

/** Signal com leitura e escrita de `.value` (contrato mínimo p/ two-way). */
export interface WritableSignal<T> {
  value: T;
}

/** Valor two-way suportado por `model`, conforme o tipo de controle. */
export type ModelValue = string | boolean | string[];

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Two-way binding para inputs/select/textarea. O modo é **auto-detectado** pelo
 * elemento + tipo do valor atual do signal:
 * - `<input type="checkbox">` com signal **array** → grupo (alterna `el.value` no array);
 * - `<input type="checkbox">` caso contrário → booleano (`.checked`);
 * - `<input type="radio">` → marca se `el.value === signal`, escreve `el.value` ao selecionar;
 * - `<select multiple>` → array dos `value` selecionados;
 * - demais (`text`/`number`/`textarea`/`select` simples) → `el.value` string.
 *
 * Ligação DOM←signal via `bind`; DOM→signal via `$on` (cleanup automático no escopo).
 * Um checkbox-group deve inicializar o signal como array.
 */
export function model(signal: WritableSignal<string>): Behavior<FieldElement>;
export function model(signal: WritableSignal<boolean>): Behavior<HTMLInputElement>;
export function model(
  signal: WritableSignal<string[]>,
): Behavior<HTMLInputElement | HTMLSelectElement>;
export function model(
  signal: WritableSignal<ModelValue>,
): Behavior<FieldElement> {
  return (ctx) => {
    const el = ctx.element;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      if (Array.isArray(read(signal as Bindable<ModelValue>))) {
        bindCheckboxGroup(ctx as MQ<HTMLInputElement>, signal as WritableSignal<string[]>);
      } else {
        bindCheckbox(ctx as MQ<HTMLInputElement>, signal as WritableSignal<boolean>);
      }
      return;
    }

    if (el instanceof HTMLInputElement && el.type === 'radio') {
      bindRadio(ctx as MQ<HTMLInputElement>, signal as WritableSignal<string>);
      return;
    }

    if (el instanceof HTMLSelectElement && el.multiple) {
      bindSelectMultiple(ctx as MQ<HTMLSelectElement>, signal as WritableSignal<string[]>);
      return;
    }

    bindText(ctx as MQ<FieldElement>, signal as WritableSignal<string>);
  };
}

/** `text`/`number`/`textarea`/`select` simples → `el.value` string. */
function bindText(ctx: MQ<FieldElement>, signal: WritableSignal<string>): void {
  const el = ctx.element;
  bind(signal as Bindable<string>, (value) => {
    const next = value == null ? '' : String(value);
    if (el.value !== next) el.value = next;
  });
  on(ctx, 'input', () => setValue(signal, el.value));
}

/** Checkbox único → booleano em `.checked`. */
function bindCheckbox(ctx: MQ<HTMLInputElement>, signal: WritableSignal<boolean>): void {
  const el = ctx.element;
  bind(signal as Bindable<boolean>, (value) => {
    el.checked = !!value;
  });
  on(ctx, 'change', () => setValue(signal, el.checked));
}

/** Radio → marcado se `el.value === signal`; ao selecionar, escreve `el.value`. */
function bindRadio(ctx: MQ<HTMLInputElement>, signal: WritableSignal<string>): void {
  const el = ctx.element;
  bind(signal as Bindable<string>, (value) => {
    el.checked = el.value === (value == null ? '' : String(value));
  });
  on(ctx, 'change', () => {
    if (el.checked) setValue(signal, el.value);
  });
}

/** Grupo de checkboxes ligados ao mesmo signal array → alterna a presença de `el.value`. */
function bindCheckboxGroup(
  ctx: MQ<HTMLInputElement>,
  signal: WritableSignal<string[]>,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string[]>, (value) => {
    const arr = Array.isArray(value) ? value : [];
    el.checked = arr.includes(el.value);
  });
  on(ctx, 'change', () => {
    const current = read(signal as Bindable<string[]>);
    const arr = Array.isArray(current) ? current.slice() : [];
    const i = arr.indexOf(el.value);
    if (el.checked && i === -1) arr.push(el.value);
    else if (!el.checked && i !== -1) arr.splice(i, 1);
    setValue(signal, arr);
  });
}

/** `<select multiple>` → array dos `value` das opções selecionadas. */
function bindSelectMultiple(
  ctx: MQ<HTMLSelectElement>,
  signal: WritableSignal<string[]>,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string[]>, (value) => {
    const arr = Array.isArray(value) ? value : [];
    for (const opt of Array.from(el.options)) opt.selected = arr.includes(opt.value);
  });
  on(ctx, 'change', () => {
    setValue(
      signal,
      Array.from(el.selectedOptions).map((o) => o.value),
    );
  });
}

/**
 * Alterna `hidden` conforme a condição (preserva estado, sem desmontar).
 * Sem teardown imperativo: o cleanup do `bind` já é auto-registrado no escopo,
 * então não há nada a mover para `onUnmounted`.
 */
export function show(cond: Bindable<boolean>): Behavior<HTMLElement> {
  return (ctx) => {
    bind(cond, (value) => {
      ctx.element.hidden = !value;
    });
  };
}
