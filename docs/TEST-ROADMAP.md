# mini-q — Roadmap de testes

Plano incremental para cobrir o **contrato** da lib (não só os caminhos felizes). Complementa
[BACKLOG.md](BACKLOG.md) (pendências gerais) e [FLOW.md](FLOW.md) (o fluxo que estes testes fixam).

**Como cada etapa funciona:** uma etapa = **um assunto**, entregue sozinha no ciclo
*planejar → implementar → commitar*. Não empilhar etapas num commit só. Critério de pronto de
qualquer etapa: **`npx vitest run` verde + `npm run typecheck` limpo** (e `vite build` quando tocar
source). Testes **colocados** (na slice/arquivo do que testam), conforme [STRUCTURE.md](STRUCTURE.md).

Legenda de estado: ⬜ a fazer · 🟡 em andamento · ✅ feito.

---

## E1 — Contrato de lifecycle ✅  ·  `test(lifecycle):`

O backbone (escopo + cleanup) é interno e hoje só é exercido de lado. Fixar o contrato.

- **Casos:**
  1. `disposeScope` roda cleanups em **ordem inversa** do registro.
  2. **Escopos aninhados**: cleanup de um effect criado dentro de um item de lista dispara quando
     o item é removido (não só no `unmount` da raiz).
  3. **Isolamento de erro**: um cleanup que lança **não** aborta os irmãos (o `try/catch` do
     `disposeScope`); erro vai para `console.error`.
  4. `registerCleanup` **fora de escopo = no-op** (documenta o modo de falha do effect órfão — a
     razão do idioma "passe um builder").
  5. Cleanup de **`use`** (`model`/`show`) dispara quando o elemento é **removido** dentro de uma
     região (behaviors hoje só são testados no topo, nunca removidos).
- **Onde:** `src/lifecycle.test.ts` (casos 1, 3, 4 — puros, sem DOM) + casos 2 e 5 via `$.mount`
  em `src/element/__tests__/` (região) ou `src/index.test.ts`.
- **Depende de:** nada. É a base para E4.

## E2 — Contrato de bindings ⬜  ·  `test(reactive):`

A ponte agnóstica de reatividade só é testada via DOM. Pinar direto.

- **Casos:**
  1. `bind` com valor **cru** → aplica **uma vez**, sem effect e sem registrar cleanup.
  2. `bind` **reativo** (signal | função) → roda em `effect` e registra o `stop` no escopo.
  3. `read` sobre signal | função | cru.
  4. `isReactive`/`isSignal` **sem adapter instalado** (retorna `false`; `bind` aplica 1x).
  5. `untrack` com adapter que suporta vs. fallback (sem suporte, só executa `fn`).
  6. `createSignal` **lança** quando o adapter não implementa `signal` (caminho do `$.media`).
- **Onde:** `src/reactive.test.ts` (colocado). Alguns casos precisam instalar/desinstalar adapter —
  isolar com `beforeEach`/`afterEach`.
- **Depende de:** nada.

## E3 — Regressões de branch em `element/` ⬜  ·  `test(element):`

Branches sem teste que a fatia por papel deixou à vista.

- **Casos:**
  - **props:** `style` (string) e `$style` (objeto/reativo); `data` **estático**; `setAttr`
    fallback `setAttribute` (ex. `aria-label`) e ramo de **remoção** (`false/null` → `removeAttribute`);
    `$class` que resolve vazio → remove `class`.
  - **control:** ramo **`else`** do `when` (`when(cond, then, else)`).
  - **children:** **signal cru** como filho; **tupla `[Component, props]`** como filho direto (fora
    de lista); filhos **nullish** (`null`/`false`); forma `createTag(tag, ...children)` sem props.
- **Onde:** `src/element/__tests__/props.test.ts`, `.../control.test.ts`, `.../children.test.ts`.
- **Depende de:** nada.

## E4 — Feature: `onMount` / `onUnmount` ⬜  ·  `feat(lifecycle):` + `test(lifecycle):`

Hoje **não há hook público** de lifecycle (só behaviors `use` que retornam cleanup, e a forma
setup como timing de "montou"). Projetar e expor.

- **A decidir no planejamento da etapa (esboço):**
  - Superfície: `$.onMount(fn)` + `$.onCleanup(fn)` (expõe o `registerCleanup` interno) — ou via
    `ctx` no setup (`(props, ctx) => { ctx.onCleanup(…) }`)? Provável: ambos apontando pro mesmo
    registro no escopo ativo.
  - `onMount(fn)` roda `fn` **agora** (já estamos no escopo/DOM do setup) e, se `fn` retornar função,
    registra-a como cleanup (ergonomia estilo effect).
  - Fora de escopo: `warn` (não silencioso) — reaproveita o modo de falha do caso E1.4.
- **Implementação:** exportar `registerCleanup` de `lifecycle`, compor em `$` (index), tipar em
  `types.ts`/`MQ` se for via `ctx`. Atualizar GLOSSARY (§Ciclo de vida) e FLOW.
- **Testes:** timing (roda no mount), cleanup no unmount, **ordem** relativa a outros cleanups,
  no-op/`warn` fora de escopo, cleanup retornado por `onMount`.
- **Depende de:** E1 (base de escopo verificada).

## E5 — Specs integradas ⬜  ·  `test(integration):`

Cenários que cruzam slices — pegam regressões que o unit não pega.

- **Casos:** região dentro de `when`; `model` dentro de lista **keyed** (cleanup ao remover item);
  **regiões aninhadas** limpando em cascata; foco preservado com `model` durante reorder;
  (se E4 entrar) `onMount`/`onCleanup` dentro de item de lista.
- **Onde:** ampliar `src/index.test.ts` (lar da integração) ou `src/demo/pocketfin.test.ts` para
  fluxos do app.
- **Depende de:** idealmente após E1–E4 (usa os contratos já fixados).

---

## Ordem sugerida

`E1 → E2 → E3 → E4 → E5`. E1–E3 são independentes e podem trocar de ordem; E4 usa E1; E5 fecha.
Cada uma vira seu próprio commit e uma linha no §Progresso do [BACKLOG.md](BACKLOG.md) ao concluir.
