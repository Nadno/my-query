/**
 * Type-test do canal de opções de `on` — compilado pelo `npm run typecheck` (TS2578
 * falha se um `@ts-expect-error` não consumir erro nenhum). Não é teste de runtime.
 *
 * As promessas de tipo que isso trava:
 *  - `hover` recebe `PointerEvent` (Pointer Events unificados) — `e.pointerType` existe.
 *  - A tupla de um custom event aceita as **opções da fonte** (`MQCustomEventOptions`),
 *    não `AddEventListenerOptions` — `capture` em `hover` é erro.
 *  - Custom event sem opções (`clickOutside` = `never`) não aceita objeto na tupla.
 *  - Evento nativo continua aceitando `AddEventListenerOptions`.
 */
import { on } from '../apply';
import type { MQ } from '../../types';

const ctx = { element: document.createElement('div') } as MQ;

/* ---- positivos ---- */

// A. hover recebe PointerEvent (e.pointerType existe)
on(ctx, 'hover', (e) => void e.pointerType);

// B. opções da fonte na tupla do hover
on(ctx, 'hover', [
  () => {},
  { touchable: true, delayIn: 100, delayOut: 250, holdDelay: 300 },
]);

// C. nativo continua com AddEventListenerOptions
on(ctx, 'click', [() => {}, { capture: true }]);

/* ---- negativos (must-error) ---- */

// N1. `capture` não é opção do hover (é AddEventListenerOptions, não HoverOptions)
// @ts-expect-error `capture` não é opção do hover
on(ctx, 'hover', [() => {}, { capture: true }]);

// N2. clickOutside não aceita opções (MQCustomEventOptions = never)
// @ts-expect-error clickOutside não aceita opções
on(ctx, 'clickOutside', [() => {}, { capture: true }]);
