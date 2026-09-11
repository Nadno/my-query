/**
 * mini-q/aria — núcleo de acessibilidade do WAI-ARIA APG, agnóstico de framework.
 *
 * Foco: `RovingIndex` (matemática 1D), `RovingFocus` (roving tabindex em listas),
 * `FocusGrid` (roving 2D), `FocusScope` (modal: trap/inert/restore) e `CheckGroup`
 * (regras de seleção radio/switch/toggle). Interação efêmera (hover, interactOutside)
 * vive nos custom events da lib; posicionamento é do consumidor.
 */

export { RovingIndex } from './roving-index';
export type {
  RovingMove,
  RovingNextInput,
  RovingOverflow,
} from './roving-index';
export { RovingFocus } from './roving-index';
export type {
  RovingFocusOptions,
  RovingFocusOrientation,
} from './roving-index';

export { FocusGrid, stepForKey } from './focus-grid';
export type {
  FocusGridOptions,
  FocusGridOverflowDetail,
} from './focus-grid';

export { FocusScope } from './focus-scope';
export type { FocusScopeOptions } from './focus-scope';

export { CheckGroup } from './check-group';
export type { CheckGroupOptions } from './check-group';
