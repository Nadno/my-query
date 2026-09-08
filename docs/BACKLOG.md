# mini-q — Pendências e carências

Estado de referência do MVP + o que falta / precisa mudar. Complementa a spec em
`~/.claude/plans/beleza-vamos-planejar-a-refactored-diffie.md` e a `docs/USAGE.md`.
Prioridade: **P1** (base/decisão), **P2** (relevante), **P3** (quando sobrar).

---

## Progresso (log)

Registro corrido do que foi entregue (o histórico git tem o detalhe por commit).

- **2026-09-06** — MVP inicial (DOM + eventos + componentes reativos); demo PocketFin; 19 testes.
- **2026-09-06** — Fix de 2 bugs de runtime: região reativa não rastreia construção do ramo
  (`untrack` no adapter, `$.when`/lista) + reconcile move só nós fora de posição e preserva foco.
- **2026-09-06** — Doc de uso (`docs/USAGE.md`) e este backlog.
- **2026-09-06** — **Redesenho do módulo de estilos** para o modelo de entidade (`base`/`modifiers`/
  `keyframes` + filhos por chave, retorno `self`/`mods`/`keyframes`, warn de duplicado) + **breakpoints**
  integrados (`$.config` + `@nome` no CSS + `$.media` reativo). 31 testes.
- **2026-09-07** — Colocação de testes + fatia `element/` em slice (create/props/children/region/
  control/guards); `docs/FLOW.md` (fluxo fundamental) e `docs/TEST-ROADMAP.md` (E1..E5).
- **2026-09-07** — **E1** do roadmap: contrato de lifecycle fixado (ordem inversa, isolamento de
  erro, no-op fora de escopo, cleanup aninhado ao remover item de região). 53 testes.
- **2026-09-07** — **E2** do roadmap: contrato de bindings (`reactive.ts`) fixado — `bind` cru=1×
  vs reativo=effect+cleanup (signal e função), `read`, comportamento sem adapter, `untrack`
  (delegação vs fallback), `createSignal` lança. 62 testes.
- **2026-09-07** — **E3** do roadmap: branches de `element/` cobertos — `style`/`$style`, `data`
  estático, `setAttr` (fallback `setAttribute` + remoção), `$class` vazio, ramo `else` do `when`,
  signal cru/tupla/nullish como filho, `createTag` sem props. 75 testes.
- **2026-09-08** — **E4** do roadmap: hooks públicos `$.onMounted`/`$.onUnmounted` (só global; par
  que absorve o "onCleanup"; `warn` fora de escopo; `onMounted` retornando teardown). Documentado
  "behavior = composable com elemento"; `model` registra teardown via `registerCleanup` silencioso
  (o `warn` fica p/ os hooks públicos). Ordem do roadmap agora E4 → **E6 → E5**. 101 testes.
- **2026-09-08** — **E6 (testes de contrato)** do roadmap: slice `events/` fixada em
  `src/events/__tests__/` — `handle`/`compose` (ordem, callable, todos os modificadores,
  `debounce`/`throttle` com fake timers, `handlers`), `applyEvents` (options da tupla, roteamento
  nativo vs custom, cleanup remove listener no dispose, nullish ignorado), custom events built-in
  (`clickOutside`/`focusOutside`/`hover` montam/limpam listener; fora vs dentro). As **decisões de
  design** de E6 (deprecar `$.handlers` raiz, delegation + `DOMHandlerStore`, hover-touch) ficam
  como etapas `feat(events):` próprias. **121 testes.**
- **2026-09-08** — **Refactor de API**: `$` vira **namespace puro de tags** (removido o seletor
  `$(sel)`, sem uso); os recursos viram **exports nomeados** com prefixo `$` (`$mount`/`$when`/
  `$match`/`$switch`/`$else`/`$append`/`$handle`/`$handlers`/`$onMounted`/`$onUnmounted`/`$useSignal`/
  `$model`/`$show`/`$cx`/`$registerCustomEvent`). O **engine de estilo + breakpoints saiu do core**
  para o entry opcional **`mini-q/style`** (`style`/`css`/`compile`/`inject`/`config`/`media`);
  `STYLE_HANDLE` fica no core, então `class`/`$class`/`$cx` seguem aceitando handles. Migrados testes,
  demo e `examples/auth` (typecheck do exemplo ok). Docs GLOSSARY/FLOW atualizados; USAGE em DOCS-DRIFT.
  2 commits (`refactor(style):`, `refactor(api):`). 124 testes verdes, typecheck+build ok.
- **2026-09-08** — **`$model` completo** (item 4 da §Ordem) + **`setValue` no adapter**: `model` agora
  **auto-detecta** o modo pelo elemento+tipo do valor — checkbox booleano (`.checked`), radio (compara
  `el.value`, escreve ao selecionar), checkbox-group (signal **array** → alterna presença de `el.value`),
  `<select multiple>` (array dos selecionados), demais → `el.value` string (comportamento antigo). Ligação
  DOM→signal agora via **`$on`** (dogfood); DOM←signal via `bind`. Escrita agnóstica: novo `setValue`
  (reactive.ts) usa `adapter.setValue?` com fallback `signal.value =` (preact-like); `setValue` add ao
  `ReactiveAdapter` + adapter preact + export bare `setValue`. **Mudança de ordem:** `use` (behaviors)
  passa a rodar **pós-children** em `createTag` (`applyProps` devolve o `use`, `createTag` aplica após
  anexar filhos) — semântica "composable com elemento completo"; corrige `$model` em `<select>` (initial
  value precisa das `<option>`) e o bug latente no `examples/auth/Select`. 6 testes novos
  (`src/behaviors.test.ts`), **138 verdes**, typecheck+build+typecheck do exemplo ok.
- **2026-09-08** — **`$on(ctx, name, value)`** (item 3 da §Ordem): primitivo de evento p/ behaviors/setups.
  Extraído `bindEvent` (miolo unitário do loop) em `events/apply.ts` → `applyEvents` e `on` dividem o
  mesmo caminho (resolve tupla + `handle` + roteamento nativo|custom); comportamento/testes de `applyEvents`
  inalterados. `on` **auto-registra** o teardown no escopo **e retorna** cleanup **idempotente** (`once()`);
  fora de escopo degrada em silêncio. Overloads inferem o evento pelo nome (nativo/`MQCustomEventMap`/fallback).
  Export `on as $on`. 8 testes novos (`events/__tests__/on.test.ts`), **131 verdes**, typecheck+build ok.
- **2026-09-08** — **E5 (specs integradas)** do roadmap — **fecha o roadmap de testes E1–E6**:
  `describe('specs integradas (E5)')` em `src/index.test.ts` com 3 fluxos cross-slice novos —
  `model` em item de lista keyed (foco+valor preservados no reorder, listener limpo na remoção),
  região `when` dentro de item keyed (reage e some em cascata ao remover), `onMounted` com teardown
  por item. Os demais cenários da etapa já estavam cobertos por E1–E4 + demo (não re-testados).
  **124 testes.**

---

## Status atual (pronto e testado)

- Núcleo: `reactive` (adapter agnóstico: `isSignal`/`getValue`/`effect`/`untrack?`/`signal?`), `lifecycle` (escopos + `mount → unmount`).
- `element`: `createTag` dual (setup/elemento), props `$`-reativas, children, **lista keyed** com reuso, `$.when`.
- `events`: `on:{}` + `handle` (modificadores) + custom events (`clickOutside`/`focusOutside`/`hover`).
- `behaviors`: `use` + `model`/`show`.
- `style`: **modelo de entidade** (`style`/`parts`/`css`/`compile`/`inject`) — `base`/`modifiers`/`keyframes` + filhos.
- `config`/`media`: breakpoints compartilhados (CSS `@nome` + `$.media` reativo).
- `$` montado em `index`, adapter `preact`, demo PocketFin, **31 testes verdes**, `vite build` ok.

---

## Estilo — ✅ redesenhado (modelo de entidade) — 2026-09-06

Resolvido pelo redesenho: entidade com `base`/`modifiers`/`keyframes` + filhos por chave, nomes BEM-legíveis
(`-card-title`), modificador como classe composta `.bloco.--nome`, keyframes escopados, retorno `self`/`mods`/
`keyframes`, warn de duplicado, breakpoints (CSS + `$.media`). **Restam** (P3): SSR/hydration; GC de regras
(`injected` só cresce); prefixo/namespace configurável p/ evitar colisão em monolito; extração em build-time;
**combinador filho-direto opt-in por parte** (`'>parte': {}` → `.pai > .-parte`; default segue descendente).

<details><summary>Diagnóstico original (histórico)</summary>

O módulo era CSS-in-JS runtime JS-first com nomes achatados e sem filhos/modificadores de 1ª classe.

**Hoje:** `src/style.ts` é uma **engine de CSS-in-JS em runtime** — a autoria é feita em **objetos JS**
(`StyleObject`), compilados e injetados num `<style id="mq-styles">`. Isso vai na direção oposta da
conclusão que tiramos: *espremer a folha de estilo inteira em JS é chato e não é o objetivo*.

**O que queremos (a decidir antes de investir mais na engine):**
1. **Integração-first, não JS-first.** O default deveria ser **tokens tipados + CSS externo**: `$.style('card')`
   (só o nome, tipado) e você escreve o CSS num `.css`. Autoria em JS vira **opção**, não o caminho principal.
2. **Engine só para o dinâmico/estado** (o que muda por variant/estado), não para a folha toda.
3. **Extração em build-time** (plugin Vite) para tirar o custo de runtime mantendo a DX.
4. **Padrão de entidade** (`Card = { style: $.parts('card', …), on, view }`) como convenção — já suportado via nomes.

**Carências concretas da engine atual (se ela permanecer para o caso dinâmico):**
- Sem **remoção/GC** de regras — o `<style>` só cresce (`injected` nunca esvazia). P2
- **Dedup** só por string de regra inteira; nada de coalescing/atomização. P3
- **Ordem/especificidade** não controladas (ordem de injeção = ordem de import). P2
- **SSR/hydration**: `ensureTag` é client-only; sem extração de CSS crítico. P2
- `<style>` **único global** — sem isolamento/escopo real nem theming por tokens. P2
- Sem **vendor-prefix**, sem ergonomia de `@keyframes`/`@font-face` (só `css()` cru). P3
- Heurística número→px limitada (lista `UNITLESS` fixa). P3
- Tipagem fraca: `parts`/`style` retornam `string`/`VariantFn` soltos; **variant props não tipadas**. P2

**Direção proposta:** repositionar `style` como *camada de integração* (tokens + CSS externo por padrão;
engine opcional para dinâmico; plugin de build depois). **Decidir o modelo de autoria antes de codar mais.**

---

</details>

## ✅ `$.style` como namespace (P1) — IMPLEMENTADO (2026-09-06) — `docs/proposals/style-namespace.md`

Redesenho do estilo p/ namespace callable: `$.style(name, { base, parts, flags, variants, defaults, keyframes })`,
retorno `StyleHandle` único (callable + `.self`/`.parts`/`.flags`/`.variants`/`.keyframes`), `$.style.css`.
Partes e variantes **coexistem**; chave-objeto inesperada no topo → `warn` (não vira parte silenciosa).
Decisões do usuário travadas: **nome completo do bloco sempre** (`-category-card-title`, depth-independent),
**combinador descendente automático** (mantido), **keyframes na árvore** (não içado). `$.parts`/`$.css` = alias
deprecado por 1 versão. Migrados os 8 call-sites de `examples/auth` (Field/Stepper/Button/theme/etc.) + docs
(USAGE §11, GLOSSARY, referência). Testes reescritos (33 verdes), typecheck + build ok.

Pendências que **ficaram** (não faziam parte do núcleo): `$.handlers` (raiz) ainda não migrado p/ `$.handle.handlers`;
prefixo/namespace configurável; GC de regras; SSR; compound variants.

## ✅ Polida da API de estilo — IMPLEMENTADO (2026-09-07) — `~/.claude/plans/…-foamy-flurry.md`

Ergonomia + composição, guiado pelo atrito real do `examples/auth` (que contornava a API):
- **Handle único e leve**: partes **promovidas** (`field.input`), `class`/`$class`/`cx` **aceitam o handle**
  (via brand `STYLE_HANDLE`) → o flatten `bem()` do exemplo **morreu**. `.self`/callable p/ quem precisa.
- **Slots**: `slots: { control: bloco }` + override em flags/variants → **acabou o hatch cross-bloco** no Field.
- **Uma regra de decls**: CSS no topo, **`base` removido** (config/parts/flags/variants).
- **Nomes**: flags viram `.bloco.--is-{nome}` (distinguem-se de variante); parte/variante mantidas.
- **Autoria JS-first**: overload `$.style(name)` (só-nome) **removido**.
- Furos fechados: `FlagBody` unificado (`parts`+`slots`); toast migrou flags→`variants` (exclusivo);
  parte com nome reservado → `warn`. 37 testes verdes, typecheck + build + typecheck do exemplo ok.

## Estilo Fase 2 — variáveis de design — DEFERIDA (native-first, 2026-09-07) — `docs/proposals/style-tokens.md`

Decisão: **não crescer o engine** pra tema/scope/valores dinâmicos — o CSS moderno resolve (custom properties,
`@scope`, container queries). Tokens globais seguem via `$.style.css(':root', …)` + `var(--x)` (status quo).
Design registrado p/ o futuro: bloco `vars` por componente (estado **reescreve a var**) + tokens globais +
**valor via função self** (`gap: (self) => self.vars.gap`), sem açúcar de string `'$nome'`. Scope por `data-*`
**recusado** (contradiz legibilidade; fura com elementos destacados).

## Eventos — migração ficou enxuta (P2)

Foi feita uma camada **lean in-house** em vez de portar o runtime `dom-events` antigo. Faltam:
- **`$on(ctx, name, onValue)` — primitivo de evento p/ behaviors (P1, próxima frente).** Hoje um behavior
  ouve evento na mão (`el.addEventListener` + `registerCleanup`, ver `model`), duplicando à margem o que
  a pipeline de `on:{}` já resolve. `$on` reusa **o mesmo `applyEvents`** (roteamento nativo vs custom +
  `handle` + cleanup no escopo) → behavior vira "composable com elemento" de verdade e ganha o mesmo
  vocabulário do builder. É o substrato p/ reescrever os custom events ricos abaixo **como behaviors**.
- **Runtime rico de custom events (P2)**: hoje `emit` é fire-and-forget; falta o modelo de **enter↔leave
  pareado** com cleanup retornado pelo handler (era o `cleanupHover`). É o que destrava, sobre a mesma base:
  `interactOutside` (**hoje não existe**), `focusOutside` via `relatedTarget` (mais correto que o `focusin`
  global atual) e `hover` hold-to-hover (`delayIn`/`delayOut` + Pointer Events p/ mobile).
- **Delegation** de eventos (havia no antigo) — **adiada/em dúvida**. Numa lib de escopo por-componente com
  cleanup por escopo, delegação global é aposta grande de payoff incerto (acopla o `DOMHandlerStore`).
  Segurar até ter um caso real que doa (lista gigante). P3
- **Dedup/registro** de handlers (`DOMHandlerStore`). P3
- Mais modificadores e o açúcar de token (`'.enter'`) sobre os composables. P3

### hover com touch (P2)
`hover` atual é mínimo (enter-only, sem delay, sem touch). Queremos **hold-to-hover** (segurar o dedo =
hover, soltar = sair), como sites de vídeo: Pointer Events unificados, `holdDelay`, cancelar no scroll,
suprimir contextmenu/seleção, `delayIn`/`delayOut`. API preferida: **handler retorna o cleanup do
"un-hover"** — depende do runtime rico acima. Alternativa barata sem tocar no runtime: um behavior
`$.hover(onEnter, opts)` (retorna cleanup nativamente).

---

## Componentes / render (P2–P3)

- **`$.when` sem cache de ramo**: recria a subárvore ao alternar (perde estado interno). Adicionar cache por ramo. P2
- **Açúcar de lista tipada `$.each`**: hoje a tupla `[Comp, {...t, key}]` exige `as [...]` (feio). Um
  `$.each(items, Comp, t => t.id)` mataria o cast e tiparia a key. P2
- **`$.tag(...children)` sem `{}` vazio**: permitir omitir props quando o 1º arg é claramente filho
  (string/number/Node/array/função). Reduz o ruído de `$.div({}, …)`. P3

---

## ✅ `$model` — cobrir os tipos de input (P1) — FEITO (2026-09-08)

Resolvido: `model` auto-detecta o modo pelo elemento+tipo do valor — checkbox booleano (`.checked`),
radio (compara `value`, escreve ao selecionar), checkbox-group (signal **array** → alterna presença de
`el.value`), `<select multiple>` (array), demais → `el.value` string. DOM→signal via `$on`; escrita via
`setValue` agnóstico. **Convenção:** um checkbox-group deve **inicializar o signal como array** (a
detecção array-vs-boolean lê o valor atual). Ver §Progresso.

## Reatividade / adapter (P2)

- ~~Adapter sem `setValue`~~ ✅ FEITO (2026-09-08): `setValue?` opcional no `ReactiveAdapter` + helper
  `setValue` (fallback `signal.value =` preact-like) + adapter preact + export bare. `model` usa-o (two-way agnóstico).
- Só o adapter `preact` foi entregue. Documentar/entregar outro (ou um fake) e o **teste de agnosticidade**. P3
- **Objetos/listas reativas próprios — RECUSADO (2026-09-08).** Contradiz o posicionamento **agnóstico de
  signal**: coleção reativa é responsabilidade da lib de signals via adapter, não do mini-q (que já monta
  lista keyed a partir de fonte reativa). O gap legítimo aqui é só o açúcar **`$.each` tipado** (ver Componentes).

---

## Formulários (P2, decidido deixar como gap por ora)

Não construir um "form framework". Quando for: composable fino `useForm`/`useField` (value, error,
touched, dirty, submit, async), **schema-agnóstico** — aceitar `validate: (values) => errors` **ou**
qualquer **Standard Schema** (`~standard`: Zod/Valibot/ArkType) para validação + tipos, sem lock-in.
Field arrays via lista keyed (encaixa no `$.each`). Camada é de *interação*, não de validação.

---

## Acessibilidade / behaviors ausentes (P3)

O código antigo tinha como diretivas: `trap-focus`, `roving-index`, `inert`, `overlay`. Nada foi portado.
Reescrever como **behaviors** (`use`) quando forem necessários (ex.: modal do exemplo auth).

---

## Infra / entrega (P3)

- Pacote aponta os `exports` para `.ts` (sem build em `dist/`). Sem artefato publicável ainda.
- Sem SSR/hydration. **Proposta de SSG** (backend injetável + `StringBackend` + `emitStylesheet`; hydration
  como fase opcional; SSR deferido) em [proposals/ssg.md](proposals/ssg.md). P3
- Exemplo `examples/auth` planejado (prompt pronto) e ainda não implementado.

---

## Organização modular do `src/` (P3, doc)

Sensação (do usuário) de que falta modularidade: `events/`/`element/`/`style/` já são pastas próprias
(estilo+config+media agora juntos em `style/`, entry `mini-q/style`), mas ainda há arquivos soltos no
topo (`reactive.ts`, `behaviors.ts`, `mount.ts`). Direção a considerar: **cada feature = uma pasta** com
`index.ts` + partes (ex.: `reactivity/`, `behaviors/`), no espírito do `events/`. E **quebrar utilitários**
(`dom/nodes.ts` acumula node-helpers + `resolveClass`/`cx`) para não concentrar contexto num só lugar.
Não muda a API pública (o `index.ts` reexporta) — é refactor de estrutura. Fazer quando as features
estabilizarem (mover cedo demais só gera churn).

## Ordem sugerida quando retomarmos

Roadmap de testes **E1–E6 fechado** (2026-09-08) → frente atual é **feature**. Ordem repriorizada
após o Q&A das 4 ideias (2026-09-08): as três primeiras se reforçam sobre a mesma pipeline de eventos.

1. ~~Decidir/entregar o modelo de estilo~~ ✅ feito (entidade + breakpoints).
2. ~~Migrar `examples/auth` p/ a nova API de estilo~~ ✅ feito (todos os call sites migrados).
3. ~~**`$on(ctx, name, onValue)`** — primitivo de evento p/ behaviors~~ ✅ feito (2026-09-08; ver §Progresso).
4. ~~**`$model` completo** (checkbox/radio/checkbox-group/`select multiple`) **+ `setValue?` no adapter**~~ ✅ feito (2026-09-08; ver §Progresso).
5. **Runtime rico de eventos** (enter↔leave pareado): `interactOutside` + `focusOutside` por `relatedTarget`
   + `hover` hold-to-hover (mobile). **Delegation fica de fora** (adiada, ver §Eventos). (P2)
6. `$.each` tipado + `$.when` com cache de ramo (ganho de DX barato). (P2)
7. `useForm`/`useField` schema-agnóstico + a11y behaviors (`trap-focus`…) no `examples/auth`. (P2)
8. Organização modular do `src/` (refactor de estrutura, quando estabilizar). (P3)
