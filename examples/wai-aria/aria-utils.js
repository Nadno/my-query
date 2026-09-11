/**
 * aria-utils — composables compartilhados dos exemplos WAI-ARIA (single-file + zero build).
 *
 * Encapsula a fiação recorrente entre mini-q e mini-q/aria:
 *  - `useGroup`   → CheckGroup + signal por opção + sync (radio/switch/accordion);
 *  - `useRoving`  → RovingFocus.of(...).activate() (radio/tabs/menu);
 *  - `escClose`   → handler `keydown` com modificador `$handle.keys('Escape')`;
 *  - `toggleIndex`→ util p/ movimentação circular com RovingIndex (combobox).
 *
 * NADA de DOM aqui — o consumidor decide a árvore; estes helpers só amarram estado,
 * comportamento de teclado e roving. Importe via `./aria-utils.js` (relativo).
 */

import { CheckGroup } from 'mini-q/aria';
import { RovingFocus } from 'mini-q/aria';
import { RovingIndex } from 'mini-q/aria';
import { signal } from '@preact/signals-core';
import { $handle } from 'mini-q';

/**
 * Grupo de seleção com signals espelhando o estado do `CheckGroup`.
 * - `opts` → mesmas opções do `CheckGroup.of` (multiple, allowAllUnchecked, defaultChecked);
 * - `names` → lista de chaves registradas;
 * - `initial` → mapa `{ name: boolean }` com o estado inicial por item;
 * - retorna `{ group, sigs, sync, isChecked, set }`.
 * `sigs[name]` é um signal<boolean> reativo — passe a `$aria.checked`/`$aria.expanded`.
 */
export function useGroup({ names, initial = {}, ...opts }) {
  const group = CheckGroup.of(opts);
  for (const name of names) group.register(name, initial[name] ?? false);

  const sigs = Object.fromEntries(names.map((name) => [name, signal(false)]));
  const sync = () => {
    for (const name of names) sigs[name].value = group.isChecked(name);
  };
  sync();

  return {
    group,
    sigs,
    sync,
    isChecked: (name) => group.isChecked(name),
    set: (name, value) => {
      group.set(name, value);
      sync();
    },
  };
}

/**
 * Ativa RovingFocus sobre um elemento (roving tabindex + setas/Home/End).
 * `onMove(el)` é chamado quando o foco muda de item (seleção segue o foco).
 */
export function useRoving(el, { target, orientation = 'vertical', loop = true, onMove }) {
  const rf = RovingFocus.of(el, { target, orientation, loop, onMove });
  rf.activate();
  return rf;
}

/**
 * Handler de `keydown` que chama `close` no Escape (com `$handle.keys` + `prevent`).
 * Ex.: `on: { keydown: escClose(close) }`.
 */
export function escClose(close) {
  return [close, $handle.keys('Escape'), $handle.prevent];
}

/**
 * Move um índice circularmente (combobox: seta ↓/↑ com roving matemático).
 * Retorna o novo índice já clampado, ou `null` se a lista estiver vazia.
 */
export function moveIndex({ index, count, step, loop = true }) {
  if (count === 0) return null;
  const move = RovingIndex.next({ index, count, step, loop });
  return 'index' in move ? move.index : index;
}
