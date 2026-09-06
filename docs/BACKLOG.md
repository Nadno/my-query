# mini-q — Pendências e carências

Estado de referência do MVP + o que falta / precisa mudar. Complementa a spec em
`~/.claude/plans/beleza-vamos-planejar-a-refactored-diffie.md` e a `docs/USAGE.md`.
Prioridade: **P1** (base/decisão), **P2** (relevante), **P3** (quando sobrar).

---

## Status atual (pronto e testado)

- Núcleo: `reactive` (adapter agnóstico), `lifecycle` (escopos + `mount → unmount`).
- `element`: `createTag` dual (setup/elemento), props `$`-reativas, children, **lista keyed** com reuso, `$.when`.
- `events`: `on:{}` + `handle` (modificadores) + custom events (`clickOutside`/`focusOutside`/`hover`).
- `behaviors`: `use` + `model`/`show`.
- `style`: engine runtime de CSS-in-JS (`style`/`parts`/`css`/`compile`/`inject`) — **ver §Estilo**.
- `$` montado em `index`, adapter `preact`, demo PocketFin, suíte de testes verde, `vite build` ok.

---

## Estilo — o módulo atual NÃO reflete o que queremos (P1)

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

## Ordem sugerida quando retomarmos

1. **Decidir o modelo de estilo** (integração-first) — bloqueia o resto do CSS. (P1)
2. `$.each` tipado + `$.when` com cache de ramo (ganho de DX barato). (P2)
3. Portar runtime rico de eventos → **hover touch** + delegation. (P2)
4. `setValue` no adapter + teste de agnosticidade. (P2)
5. `useForm`/`useField` schema-agnóstico + `examples/auth`. (P2)
