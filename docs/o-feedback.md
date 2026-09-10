# Feedback — avaliação da implementação de `$useTeleport`

Data: 2026-09-09. Contexto: implementação do behavior `$useTeleport` no core do mini-q
(proposta `docs/proposals/teleport.md`). Este doc registra a avaliação completa, com os
pontos mais importantes para pensar nos próximos passos.

## 1. O que foi implementado

- **`src/behaviors.ts`** — `useTeleport` (exportado como `$useTeleport`): resolve o alvo via
  `getElement`, move o `ctx.element` para o alvo; se `target` for função, usa `bind` (effect
  reativo que move o nó vivo). Marca o elemento como teleportado e registra cleanup.
- **`src/types.ts`** — símbolo `TELEPORTED`.
- **`src/element/children.ts`** — `appendChild` não anexa elementos teleportados (decisão 5 da
  proposta: "não renderiza como filho").
- **`src/index.ts`** — exporta `$useTeleport`.
- **`src/behaviors.test.ts`** — testes novos (alvo por seletor/elemento, alvo reativo, unmount).

## 2. Bug encontrado (crítico) — RESOLVIDO

**Quando o elemento é montado via `$when` e a condição fecha, o nó NÃO era removido do alvo.**

```
after open,  target children: 1
after close, target children: 1   ← deveria ser 0
```

### Causa raiz

A view do `$when` constrói o elemento dentro de `read(source)` no effect da região
(`src/element/region.ts`) — **fora de qualquer `runInScope`**. O debug confirmou
`currentScope = null` quando o `$useTeleport` rodava, então o `registerCleanup` do behavior
era no-op (o cleanup nunca era registrado). O `runInScope(scope, ...)` da região só envolvia o
`appendChild`, mas o elemento já tinha sido construído antes, dentro do `read(source)`.

### Correção

`src/element/region.ts` agora cria um escopo **por reconciliação** e envolve a construção da
view (`read(source)`) nele. O escopo vira o escopo da entrada volátil (disparado no fechamento
do `$when`/troca de ramo) e é descartado se não houver itens voláteis. Isso conserta **todos**
os behaviors em views de `$when`/`$match`/`$switch` (não só o teleport): o cleanup agora é
registrado e roda no unmount da sub-região.

- `src/reactive.ts` — exporta `getAdapter` (a região precisa do `effect` cru para envolver o
  `read` no escopo).
- Teste de regressão: `src/behaviors.test.ts` "com `$when`: remove o nó do alvo e deixa a
  âncora no lugar certo" cobre o fluxo abrir/fechar.

## 3. Pontos de design para pensar

### 3.1. A âncora/placeholder

A decisão 5 (não anexar como filho) resolve o problema de "o pai espera o nó", mas cria o
problema do cleanup: a região não sabe do nó. Vale pensar se o behavior deveria devolver um
placeholder (comentário) no lugar original — como o componente `Teleport` do exemplo fazia —
para que a região o capture e o cleanup seja automático. Isso unificaria o lifecycle.

### 3.2. `insertAdjacentElement([where])` (decisão 5)

A proposta menciona adicionar no alvo com controle de `insertAdjacentElement([where])`. Ainda
não foi implementado — hoje é `appendChild` simples. Definir o contrato de `where`
(`beforebegin`/`afterbegin`/`beforeend`/`afterend`) e como ele interage com o alvo reativo.

### 3.3. Diretivas/composables (pergunta do usuário)

O usuário perguntou se seria muito complexo viabilizar um comportamento tipo **diretivas com
composables** — deixar o popup igual às novas APIs (ex.: Popover API), validando CSS etc.

- **Viável e alinhado**: o mini-q já tem o conceito de `Behavior` (`use:`), que é essencialmente
  uma diretiva. Um "composable" seria um behavior que encapsula estado + cleanup (ex.:
  `usePopover({ placement, offset })` devolvendo um behavior + refs). Isso compõe com o
  `$useTeleport` e com `useFocusScope`.
- **Complexidade**: média. O desafio não é a superfície (behavior já existe), mas o **lifecycle
  do nó teleportado** (bug acima) e a **validação de CSS** (ex.: checar se o alvo tem
  `overflow:hidden`/`position`/`z-index` e avisar). A validação de CSS é um utilitário à parte,
  não precisa estar no core.
- **Recomendação**: resolver o bug do cleanup primeiro; depois evoluir `$useTeleport` para
  aceitar opções (`where`, validação) e, por fim, criar composables de UI (popover/modal) no
  exemplo `auth` como prova de conceito.

### 3.4. `@scope` não se envolve (decisão 6)

Confirmado: o scope é fornecido por contexto via chamada; o Teleport move o nó, o `@scope`
delimita o estilo. Sem ação no core.

## 4. Estado atual

- Testes: 203 passam (20 no behaviors), incluindo o teste de `$when` abrindo e fechando.
- Typecheck: limpo.
- Proposta `teleport.md`: pontos 1–4 marcados como resolvidos; o ponto 2 (alvo reativo +
  `$when`) agora está **de fato** resolvido — o bug de cleanup foi corrigido e coberto por teste.

## 5. Próximos passos (priorizados)

1. ~~**Corrigir o bug de cleanup no `$when`**~~ — **FEITO**: a região envolve a construção da
   view num escopo por reconciliação; o cleanup do behavior roda no unmount da sub-região.
2. ~~**Reabrir o ponto 2** na proposta e documentar a causa raiz~~ — **FEITO** (seção 2 acima).
3. **Definir o contrato de `insertAdjacentElement([where])`** e implementar.
4. **Avaliar placeholder/âncora** para unificar o lifecycle (3.1).
5. **Prova de conceito de composable** (popover/modal) no exemplo `auth`, com validação de CSS.
