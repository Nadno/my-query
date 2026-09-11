/** Aplica `on: {}` a um elemento: resolve valor → handler+options, roteia nativo|custom. */
import { type Cleanup } from '../lifecycle';
import type { MQ } from '../types';
import type { Handler, MQCustomEventMap, MQCustomEventOptions, OnValue, PairedHandler } from './types';
export declare function applyEvents(ctx: MQ, onMap: Record<string, OnValue | undefined>): void;
/**
 * `on` — liga um evento a partir de um `ctx` (behaviors, setups): mesmo caminho do
 * `on: {}` (tupla `[handler, ...mods, options?]`, roteamento nativo|custom). Auto-registra
 * o teardown no escopo ativo e **retorna** o cleanup idempotente, para desligar antes se
 * quiser (chamada manual + teardown do escopo é seguro). Fora de escopo degrada em
 * silêncio, igual `applyEvents`.
 */
export declare function on<K extends keyof HTMLElementEventMap, E extends Element>(ctx: MQ<E>, name: K, value: OnValue<HTMLElementEventMap[K], E>): Cleanup;
export declare function on<K extends keyof MQCustomEventMap, E extends Element>(ctx: MQ<E>, name: K, value: OnValue<MQCustomEventMap[K], E, PairedHandler<MQCustomEventMap[K], E>, MQCustomEventOptions[K]>): Cleanup;
export declare function on<E extends Element>(ctx: MQ<E>, name: string, value: OnValue<any, E, Handler<any, E>, never>): Cleanup;
