/** Helpers de nó DOM e resolução de classe. */
import type { ClassValue } from '../types';
export declare function isNode(value: unknown): value is Node;
/** `true` se o nó foi teleportado (`$useTeleport`) e não vive na árvore do pai. */
export declare function isTeleported(node: Node): boolean;
/** Resolve `class` (string | array | record) para uma string única. */
export declare function resolveClass(value: ClassValue): string;
/** Util de classname condicional (clsx-like). */
export declare function cx(...args: ClassValue[]): string;
/** Converte qualquer valor primitivo/array/Node num array plano de nós. */
export declare function toNodes(value: unknown): Node[];
/** Resolve um alvo (seletor | elemento) para um Element. */
export declare function getElement(target: string | Element): Element;
