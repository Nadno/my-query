/** `use` — aplicação de behaviors + behaviors base (model, show). */

import { registerCleanup } from './lifecycle';
import { bind, read, setValue, type Bindable } from './reactive';
import { on } from './events';
import { getElement } from './dom/nodes';
import { TELEPORTED } from './types';
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
export type ModelValue = string | number | boolean | (string | number)[];

/** Opções de `$model` para alinhar com `v-model` do Vue. */
export interface ModelOptions {
  /** Valor escrito quando um checkbox único está marcado. Default: `true`. */
  trueValue?: unknown;
  /** Valor escrito quando desmarcado. Default: `false`. */
  falseValue?: unknown;
  /** Sincroniza DOM→signal no `change` em vez de `input` (só afeta o modo string). */
  lazy?: boolean;
  /** Casta o `value` string → número ao escrever (`looseToNumber`: falha → mantém string). */
  number?: boolean;
  /** Apara espaços do `value` string ao escrever. */
  trim?: boolean;
}

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Two-way binding para inputs/select/textarea. O modo é **auto-detectado** pelo
 * elemento + tipo do valor atual do signal:
 * - `<input type="checkbox">` com signal **array** → grupo (alterna `el.value` no array);
 * - `<input type="checkbox">` caso contrário → booleano (`.checked`);
 * - `<input type="radio">` → grupo de seleção única; marca se `el.value === signal`, escreve `el.value` ao selecionar;
 * - `<select multiple>` → array dos `value` selecionados;
 * - demais (`text`/`number`/`textarea`/`select` simples) → `el.value` string.
 *
 * Ligação DOM←signal via `bind`; DOM→signal via `$on` (cleanup automático no escopo).
 * Um checkbox-group deve inicializar o signal como array.
 */
export function model(signal: WritableSignal<string>): Behavior<FieldElement>;
export function model(signal: WritableSignal<string>, options: ModelOptions): Behavior<FieldElement>;
export function model(signal: WritableSignal<number>): Behavior<FieldElement>;
export function model(signal: WritableSignal<number>, options: ModelOptions): Behavior<FieldElement>;
export function model(signal: WritableSignal<boolean>): Behavior<HTMLInputElement>;
export function model(signal: WritableSignal<boolean>, options: ModelOptions): Behavior<HTMLInputElement>;
export function model(
  signal: WritableSignal<(string | number)[]>,
): Behavior<HTMLInputElement | HTMLSelectElement>;
export function model(
  signal: WritableSignal<(string | number)[]>,
  options: ModelOptions,
): Behavior<HTMLInputElement | HTMLSelectElement>;
export function model(
  signal: WritableSignal<ModelValue>,
  options?: ModelOptions,
): Behavior<FieldElement> {
  return (ctx) => {
    const el = ctx.element;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      if (Array.isArray(read(signal as Bindable<ModelValue>))) {
        bindCheckboxGroup(ctx as MQ<HTMLInputElement>, signal as WritableSignal<string[]>, options);
      } else {
        bindCheckbox(ctx as MQ<HTMLInputElement>, signal as WritableSignal<boolean>, options);
      }
      return;
    }

    if (el instanceof HTMLInputElement && el.type === 'radio') {
      bindRadio(ctx as MQ<HTMLInputElement>, signal as WritableSignal<string | number>, options);
      return;
    }

    if (el instanceof HTMLSelectElement && el.multiple) {
      bindSelectMultiple(ctx as MQ<HTMLSelectElement>, signal as WritableSignal<string[]>, options);
      return;
    }

    bindText(ctx as MQ<FieldElement>, signal as WritableSignal<string | number>, options);
  };
}

/** Aplica `trim` e/ou `number` numa string vinda do DOM, conforme as opções. */
function castString(value: string, options: ModelOptions | undefined): string | number {
  let next = value;
  if (options?.trim) next = next.trim();
  if (options?.number) {
    const n = parseFloat(next);
    return Number.isNaN(n) ? next : n;
  }
  return next;
}

/** `text`/`number`/`textarea`/`select` simples → `el.value` string. */
function bindText(
  ctx: MQ<FieldElement>,
  signal: WritableSignal<string | number>,
  options?: ModelOptions,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string | number>, (value) => {
    const next = value == null ? '' : String(value);
    if (el.value !== next) el.value = next;
  });
  on(ctx, options?.lazy ? 'change' : 'input', () => setValue(signal, castString(el.value, options)));
}

/** Checkbox único → booleano (ou `trueValue`/`falseValue`) em `.checked`. */
function bindCheckbox(
  ctx: MQ<HTMLInputElement>,
  signal: WritableSignal<boolean>,
  options?: ModelOptions,
): void {
  const el = ctx.element;
  const trueValue = options?.trueValue ?? true;
  const falseValue = options?.falseValue ?? false;

  bind(signal as Bindable<boolean>, (value) => {
    el.checked = value === trueValue;
  });
  on(ctx, 'change', () => setValue(signal, el.checked ? trueValue : (falseValue as boolean)));
}

/** Radio → marcado se `el.value === signal`; ao selecionar, escreve `castString(el.value)`. */
function bindRadio(
  ctx: MQ<HTMLInputElement>,
  signal: WritableSignal<string | number>,
  options?: ModelOptions,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string | number>, (value) => {
    el.checked = el.value === (value == null ? '' : String(value));
  });
  on(ctx, 'change', () => {
    if (el.checked) setValue(signal, castString(el.value, options));
  });
}

/** Grupo de checkboxes ligados ao mesmo signal array → alterna a presença de `el.value`. */
function bindCheckboxGroup(
  ctx: MQ<HTMLInputElement>,
  signal: WritableSignal<string[]>,
  options?: ModelOptions,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string[]>, (value) => {
    const arr = Array.isArray(value) ? value : [];
    el.checked = arr.map((v) => String(v)).includes(el.value);
  });
  on(ctx, 'change', () => {
    const current = read(signal as Bindable<string[]>);
    const arr = Array.isArray(current) ? current.slice() : [];
    const strArr = arr.map((v) => String(v));
    const i = strArr.indexOf(el.value);
    const next = castString(el.value, options) as string;
    if (el.checked && i === -1) arr.push(next);
    else if (!el.checked && i !== -1) arr.splice(i, 1);
    setValue(signal, arr);
  });
}

/** `<select multiple>` → array dos `value` das opções selecionadas. */
function bindSelectMultiple(
  ctx: MQ<HTMLSelectElement>,
  signal: WritableSignal<string[]>,
  options?: ModelOptions,
): void {
  const el = ctx.element;
  bind(signal as Bindable<string[]>, (value) => {
    const arr = Array.isArray(value) ? value.map((v) => String(v)) : [];
    for (const opt of Array.from(el.options)) opt.selected = arr.includes(opt.value);
  });
  on(ctx, 'change', () => {
    setValue(
      signal,
      Array.from(el.selectedOptions).map((o) => castString(o.value, options) as string),
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

/** Alvo de `$useTeleport`: seletor, elemento, ou função que resolve um deles. */
export type TeleportTarget = string | Element | (() => string | Element);

/**
 * Teleporta o **próprio elemento do contexto** (`ctx.element`) para outro lugar da DOM,
 * fora da árvore do pai — útil para modais, toasts e overlays que precisam escapar de
 * `overflow:hidden` ou de contextos de empilhamento (z-index) do pai.
 *
 * - **Só monta**: sem `open` interno — quem decide renderizar é o `$when` externo.
 * - **Alvo reativo**: se `target` for função, um `effect` observa o alvo resolvido e
 *   **move o nó vivo** para o novo alvo (sem desmontar/remontar). O `stop` do effect é
 *   registrado no escopo, então para no unmount (cobre o caso de `$when`).
 * - **Cleanup**: ao desmontar o escopo, o `disposeScope` do pai já remove os nós; o
 *   behavior só precisa parar o effect do alvo reativo.
 */
export function useTeleport(target: TeleportTarget): Behavior<Element> {
  return (ctx) => {
    const el = ctx.element;

    // Marca como teleportado: `appendChild` do pai não o anexa (vive no alvo).
    (el as Element & { [TELEPORTED]?: boolean })[TELEPORTED] = true;

    const move = (to: Element) => {
      to.appendChild(el);
    };

    if (typeof target === 'function') {
      bind(target, (to) => move(getElement(to)));
    } else {
      move(getElement(target));
    }

    // O elemento teleportado não vive na árvore do pai, então o `disposeScope` do
    // pai não o remove — o behavior remove do alvo no unmount.
    registerCleanup(() => {
      el.remove();
    });
  };
}
