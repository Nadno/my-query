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

## E2 — Contrato de bindings ✅  ·  `test(reactive):`

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

## E3 — Regressões de branch em `element/` ✅  ·  `test(element):`

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

## E4 — Feature: `onMounted` / `onUnmounted` ✅  ·  `feat(lifecycle):` + `test(lifecycle):`

Não havia hook público de lifecycle (só behaviors `use` que retornam cleanup, e a forma setup como
timing de "montou"). Expostos os hooks globais + realinhado o modelo de behaviors.

- **Decisões travadas:**
  - **Superfície: só global** (`$.onMounted`/`$.onUnmounted`). **Não** mexe em `MQ`/`ctx` — o mesmo
    `ctx` vai a handlers/behaviors (rodam após o mount): expor cleanup neles é footgun. Quem quer
    vincular a um elemento usa `use:` (a forma Behavior, que recebe `ctx.element`).
  - **Nomes:** par `onMounted`/`onUnmounted` (past tense). `onUnmounted` é o teardown e absorve o
    nome "onCleanup" (não vira API pública); o `registerCleanup` interno permanece como base.
  - `onMounted(fn)` roda `fn` **agora** (build, no escopo); se `fn` retornar função → registra-a via
    `onUnmounted`. Fora de escopo: `warn` (ainda roda `fn` uma vez). `onUnmounted` fora de escopo:
    `warn` + no-op.
  - **Behaviors sobre os hooks:** documentado "behavior = composable **com elemento**". O teardown
    interno de `model` registra no escopo via `registerCleanup` (**silencioso**, mesmo caminho do
    `bind`) — o `warn` é reservado aos hooks públicos. `show` não tem teardown imperativo.
  - **Caveat:** "mounted" = componente **construiu** (não necessariamente conectado ao `document`).
- **Testes:** puros em `lifecycle.test.ts` (timing, cleanup retornado, ordem, `warn` fora de escopo);
  integração em `index.test.ts` (unmount raiz, cleanup em item de lista keyed removido, regressão do
  `model`). **101 testes.**
- **Depende de:** E1 (base de escopo verificada).

## E5 — Specs integradas ✅  ·  `test(integration):`

> **Feito (2026-09-08)** — `describe('specs integradas (E5)')` em `src/index.test.ts` (3 casos
> cross-slice novos): `model` em item de lista keyed (foco+valor no reorder, listener limpo na
> remoção); região `when` dentro de item keyed (reage e some em cascata); `onMounted` com teardown
> por item. Os demais cenários que a etapa listava já estavam cobertos por E1–E4 + demo (região
> aninhada/cascata em `region.test.ts`, `onUnmounted`-em-item e `model`-na-raiz em `index.test.ts`,
> foco no reorder com `$.input` cru, aceite end-to-end em `pocketfin.test.ts`) — não re-testados.


Cenários que cruzam slices — pegam regressões que o unit não pega.

- **Casos:** região dentro de `when`; `model` dentro de lista **keyed** (cleanup ao remover item);
  **regiões aninhadas** limpando em cascata; foco preservado com `model` durante reorder;
  (se E4 entrar) `onMount`/`onCleanup` dentro de item de lista.
- **Onde:** ampliar `src/index.test.ts` (lar da integração) ou `src/demo/pocketfin.test.ts` para
  fluxos do app.
- **Depende de:** idealmente após E1–E4 (usa os contratos já fixados).

## E6 — Eventos & `handle` (tratamento da lib dom-events) 🟡  ·  `test(events):` + `feat(events):`

> **Testes de contrato ✅ (2026-09-08)** — slice `events/` coberta em `src/events/__tests__/`
> (`handle`/`apply`/`custom`, 20 casos). As **decisões pendentes de design** abaixo (deprecar
> `$.handlers` raiz, delegation + dedup via `DOMHandlerStore`, hover-touch) ficam como etapas
> próprias (`feat(events):`), fora deste commit.


A slice `events/` é o tratamento de eventos via **`handle`** (modificadores composáveis + custom
events). Hoje só é tocada de lado ([index.test.ts](../src/index.test.ts): "handler simples" e um
array de mods) e carrega pendências de design herdadas do `old-my-query/dom-events`. Etapa dupla:
**fixar o contrato atual** e **decidir os pendentes**.

- **Casos de teste** (colocados em `src/events/__tests__/`):
  - `handle`/`compose`: **ordem** de composição (o 1º modificador é o mais externo → roda primeiro);
    forma callable `handle(fn, ...mods)` (hoje só a forma array em `on:` é testada).
  - Modificadores: `prevent`/`stop`/`self`/`keys`/`alt`/`ctrl`/`shift`/`meta`; `debounce`/`throttle`
    com `vi.useFakeTimers()`.
  - `handle.handlers({...})`: specs função **e** `[handler, ...mods]`; reuso/nomeação.
  - `applyEvents`: roteamento nativo vs custom; `options` (`once`/`capture`/`passive`); **cleanup
    remove o listener no unmount** (liga com E1); custom event → `getCustomEvent` + cleanup da fonte.
  - Custom events built-in: `clickOutside`/`focusOutside`/`hover` (montam/limpam listener global;
    disparam para fora/dentro); `registerCustomEvent`/`getCustomEvent`.
- **Decisões pendentes** (design, a resolver no planejamento da etapa — origem no `old-my-query`
  e nas notas do projeto):
  - `$.handlers` (raiz) → migrar para `$.handle.handlers` (canônico) e **deprecar** a raiz.
  - **Delegation** + **dedup via `DOMHandlerStore`** (hoje "lean in-house": 1 listener por
    elemento×evento) — avaliar trazer de `old-my-query/dom-events`.
  - `hover` touch (hold-to-hover) — falta o caminho touch.
- **Onde:** testes em `src/events/__tests__/` (`handle`/`apply`/`custom`); refactor/feature em
  `feat(events):` separado dos testes.
- **Depende de:** E1 (cleanup) para os testes de remoção de listener.

---

## Ordem sugerida

`E1 → E2 → E3 → E4 → E6 → E5` (decidido: **E6 antes de E5** — atacar a slice de eventos antes das
specs integradas). E1–E3 são independentes e podem trocar de ordem; E4 usa E1; E6 (eventos/`handle`)
também usa E1; E5 fecha os fluxos cruzados por último. Os rótulos (E5/E6) não mudam. Cada etapa vira
seu próprio commit e uma linha no §Progresso do [BACKLOG.md](BACKLOG.md) ao concluir.

**Roadmap de testes concluído (E1–E6, 2026-09-08).** As frentes de eventos em aberto viram etapas
`feat(events):` próprias (delegation, `DOMHandlerStore`, hover-touch, deprecar `$.handlers`).
