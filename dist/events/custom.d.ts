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
export type EventSource<Ev = Event, Opts = unknown> = (target: Element, emit: (event: Ev) => void | Cleanup, options?: Opts) => Cleanup;
export declare function registerCustomEvent<Ev = Event, Opts = unknown>(name: string, source: EventSource<Ev, Opts>): void;
export declare function getCustomEvent(name: string): EventSource | undefined;
