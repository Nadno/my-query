/** `mount` — abre o escopo raiz de lifecycle e injeta a árvore no alvo. */
import type { Component } from './types';
export type Mountable = Node | Component | [Component, Record<string, unknown>] | (() => unknown);
export declare function mount(target: string | Element, component: Mountable, props?: Record<string, unknown>): () => void;
