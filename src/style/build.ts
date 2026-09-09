/**
 * `build` — orquestrador do estilo: `$.style(nome, config)` → `StyleHandle`.
 *
 * Monta o escopo e o contexto, delega a recursão de partes ao `buildNode`, e emite o CSS:
 * - `native` → agrupa `ctx.out` num único `@scope (.root) to (…)`.
 * - `prefixed` → injeta as regras planas (classes com prefixo do nome do escopo).
 *
 * A recursão e a montagem do handle vivem em `buildNode.ts`; a lógica de escopo/nome em `scope.ts`.
 */

import { inject, pushRule, scopeBlock } from './emit';
import { buildNode } from './buildNode';
import type { BuildCtx } from './scope';
import { parseLocalScope, resolveScope, rootOf } from './scope';
import type { StyleApi, StyleConfig, StyleHandle } from './types';

const registered = new Set<string>();
const warnedDup = new Set<string>();

function warnDup(name: string): void {
  if (registered.has(name) && !warnedDup.has(name)) {
    warnedDup.add(name);
    console.warn(`[mini-q] estilo "${name}" registrado mais de uma vez — as regras podem colidir.`);
  }
  registered.add(name);
}

function styleFn<T extends StyleConfig>(name: string, config: T): StyleHandle<T> {
  warnDup(name);
  const scope = resolveScope(parseLocalScope(config), name);
  const ctx: BuildCtx = {
    scope,
    block: name,
    root: rootOf(scope, name),
    native: scope.strategy === 'native',
    out: [],
    slots: {},
  };

  const handle = buildNode(config, ctx, [ctx.root]);

  const rules = ctx.native ? scopeBlock(ctx.out, `.${ctx.root}`, scope.to) : ctx.out;
  for (const rule of rules) pushRule(rule);

  return handle as StyleHandle<T>;
}

export const style: StyleApi = Object.assign(styleFn, { css: inject }) as StyleApi;

/**
 * @deprecated Use `$.style(name, { parts: { … } })` e acesse `handle.x`. Alias por 1 versão.
 */
export function parts<T extends StyleConfig>(name: string, tree: Record<string, T>): StyleHandle {
  return style(name, { parts: tree });
}
