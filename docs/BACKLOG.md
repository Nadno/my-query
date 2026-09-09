# mini-q — Pendências e carências

Estado de referência do MVP + o que falta / precisa mudar. O histórico detalhado está nos **commits**
(e condensado no [§Histórico](#histórico)); as **decisões travadas** estão na tabela do
[DX-MANIFESTO.md](DX-MANIFESTO.md). Complementa a [USAGE.md](USAGE.md) — que está em **reescrita**
(Fase 3 do [DOCS-PLAN.md](DOCS-PLAN.md)). Prioridade: **P1** (base/decisão), **P2** (relevante),
**P3** (quando sobrar).

---

## Status atual (pronto e testado)

- Núcleo: `reactive` (adapter agnóstico: `isSignal`/`getValue`/`effect`/`untrack?`/`signal?`/`setValue?`),
  `lifecycle` (escopos + `mount → unmount`), hooks `$onMounted`/`$onUnmounted`.
- `element`: `createTag` dual (setup/elemento), props `$`-reativas, children, `$each` (lista keyed),
  control-flow `$when`/`$match`/`$switch`/`$else`.
- `events`: `on:{}` + `$handle` (modificadores, `debounce`/`throttle` estilo lodash) + custom events
  (enter↔leave pareados: `clickOutside`/`focusOutside`/`interactOutside`/`hover` com touch) + `$on`.
- `behaviors`: `use` + `$model` (checkbox/radio/grupos/select-multiple) / `$show`.
- `style` (entry `mini-q/style`): namespace `style`/`css`/`config`/`media` (StyleHandle: partes promovidas,
  flags, variantes, slots, keyframes).
- `$` = só tags; recursos = exports nomeados `$*`. Demo PocketFin e exemplo `examples/auth` migrados.
- **171 testes verdes**, typecheck + build ok.

---

## Pendências abertas (por área)

### Superfície / formulários (P1–P2)

- **`$model` com `options`** — paridade Vue: `trueValue`/`falseValue`, `lazy`/`number`/`trim`.
  Proposto em [proposals/model.md](proposals/model.md). (P2)
- **`useForm`/`useField`** — composable fino (value, error, touched, dirty, submit, async),
  **schema-agnóstico** (`validate: (values) => errors` **ou** Standard Schema `~standard` —
  Zod/Valibot/ArkType), field arrays via `$each`. Camada de *interação*, não de validação. (P2, gap deliberado)

### Eventos (P2–P3)

- **Delegation** de eventos — **adiada/em dúvida**: numa lib com escopo por componente + cleanup por
  escopo, delegação global é aposta de payoff incerto (acopla o `DOMHandlerStore`). Segurar até haver
  caso real (lista gigante). (P3)
- **Dedup/registro** de handlers (`DOMHandlerStore`). (P3)
- `$handlers` raiz → `$handle.handlers` (deprecar a raiz). (P3)
- Mais modificadores e o açúcar de token (`'.enter'`). (P3)

### Estilo — `mini-q/style` (P3)

- Prefixo/namespace configurável (evitar colisão em monolito).
- GC de regras (`injected` só cresce).
- Compound variants; combinador filho-direto opt-in por parte (`'>parte': {}`) — atalho para declarar partes filhas dentro do bloco pai, refletindo o namespace local (`style('card', { '>title': { ... } })` → `sCard.title`).
- Extração em build-time (plugin Vite).
- Tokens/variáveis de design — **deferida** (native-first: custom properties/`@scope`); ver
  [proposals/style-tokens.md](proposals/style-tokens.md).

### Acessibilidade (P3)

- **`aria`/`$aria` como objeto** — implementado: camelCase → `aria-*`, booleanos viram string, reativo por chave. (feito 2026-09-09)
- Behaviors ausentes (do código antigo): `trap-focus`, `roving-index`, `inert`, `overlay` — reescrever
  como `use` (ex.: modal do exemplo auth).

### Reatividade / adapter (P3)

- Só o adapter `preact` foi entregue — documentar/entregar outro (ou um fake) + **teste de agnosticidade**.
- *Objetos/listas reativos próprios* — **recusado** (é responsabilidade da lib de signals via adapter).

### Infra / entrega (P3)

- Pacote publicável: build em `dist/` e `exports` apontando para o build (hoje apontam p/ `.ts`).
- SSR/hydration — proposta em [proposals/ssg.md](proposals/ssg.md). (P3)
- Organização modular do `src/` — quando as features estabilizarem: `reactivity/`/`behaviors/` para os
  arquivos soltos do topo; quebrar `dom/nodes.ts` (acumula node-helpers + `resolveClass`/`cx`). (P3)

---

## Ordem sugerida quando retomarmos

1. **`$model` com `options`** (paridade Vue) — fecha a superfície de formulário; [proposal](proposals/model.md). (P2)
2. **`useForm`/`useField` schema-agnóstico + a11y behaviors** (`trap-focus`…) no `examples/auth`. (P2)
3. **Organização modular do `src/`** (refactor de estrutura, quando estabilizar). (P3)
4. **SSG** (backend injetável + CSS por string; [proposal](proposals/ssg.md)). (P3)

---

## Histórico (condensado — o detalhe está nos commits)

- **2026-09-06** — MVP: DOM + eventos + componentes reativos; demo PocketFin; 19 testes. Estilo
  redesenhado como **namespace** (parts/flags/variants, `StyleHandle`) + breakpoints.
- **2026-09-07** — Colocação de testes + slice `element/`; roadmap de testes **E1–E4** (lifecycle,
  bindings, branches, `$onMounted`/`$onUnmounted`); polida da API de estilo (partes promovidas, slots).
- **2026-09-08** — **Roadmap E1–E6 fechado** (2026-09-08): eventos/`handle`, integração. `$` vira **só
  tags** + exports nomeados `$*`; estilo sai p/ `mini-q/style`; `$on`; `$model` completo (checkbox/radio/
  grupos/select-multiple); `$each`; control-flow (`$match/$switch/$else`). 142 testes.
- **2026-09-09** — Backend de eventos rico: enter↔leave pareado, `debounce`/`throttle` estilo lodash,
  hover-touch + canal de opções do `EventSource`; açúcar `$.tag(...children)` sem `{}`. **171 testes**.
