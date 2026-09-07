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
- **Delegation** de eventos (havia no antigo). P2
- **Dedup/registro** de handlers (`DOMHandlerStore`). P3
- **Runtime rico de custom events**: hoje `emit` é fire-and-forget; falta o modelo de **enter↔leave
  pareado** com cleanup retornado pelo handler (era o `cleanupHover`). P2
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

## Reatividade / adapter (P2)

- Adapter tem `isSignal`/`getValue`/`effect`, mas **não tem `setValue`**. `model` escreve `signal.value`
  direto → acoplado a signals no formato preact. Para two-way realmente agnóstico, adicionar
  `setValue?` opcional ao adapter. P2
- Só o adapter `preact` foi entregue. Documentar/entregar outro (ou um fake) e o **teste de agnosticidade**. P3

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
- Sem SSR/hydration.
- `$(sel)` retorna só `{ element }` (sem traversal) — por design, mas registrado.
- Exemplo `examples/auth` planejado (prompt pronto) e ainda não implementado.

---

## Organização modular do `src/` (P3, doc)

Sensação (do usuário) de que falta modularidade: `events/` já é pasta própria, mas várias features são
arquivos soltos no topo (`reactive.ts`, `style.ts`, `config.ts`, `media.ts`, `behaviors.ts`, `element.ts`).
Direção a considerar: **cada feature = uma pasta** com `index.ts` + partes (ex.: `reactivity/`, `css/`
[style+config+media juntos], `behaviors/`, `element/`), no espírito do `events/`. E **quebrar utilitários**
(`dom/nodes.ts` acumula node-helpers + `resolveClass`/`cx`) para não concentrar contexto num só lugar.
Não muda a API pública (o `index.ts` reexporta) — é refactor de estrutura. Fazer quando as features
estabilizarem (mover cedo demais só gera churn).

## Ordem sugerida quando retomarmos

1. ~~Decidir/entregar o modelo de estilo~~ ✅ feito (entidade + breakpoints).
2. **Migrar `examples/auth`** para a nova API de estilo (call sites `theme/Field/ToastHost/Stepper/PartnersFields/Popover/Button`). (P2)
3. `$.each` tipado + `$.when` com cache de ramo (ganho de DX barato). (P2)
4. Portar runtime rico de eventos → **hover touch** + delegation. (P2)
5. `setValue` no adapter + teste de agnosticidade. (P2)
6. `useForm`/`useField` schema-agnóstico + a11y behaviors (`trap-focus`…) no `examples/auth`. (P2)
7. Organização modular do `src/` (refactor de estrutura, quando estabilizar). (P3)
