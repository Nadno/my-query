/**
 * Região reativa: uma fonte (signal|função) vira uma âncora + reconciliação keyed.
 *
 * A construção da subárvore roda **destrastreada** (`untrack`), então signals lidos
 * ao montar um item NÃO viram dependência da região (evita remontar tudo). O reconcile
 * move apenas nós fora de posição e restaura o foco de um nó reusado que precisou mover.
 */
import { type Bindable } from '../reactive';
export declare function mountReactiveRegion(parent: Node, source: Bindable<unknown>): void;
