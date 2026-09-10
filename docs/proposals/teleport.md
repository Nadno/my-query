# Proposta: Teleport no core (behavior `use-teleport`)

Status: **EM PLANEJAMENTO (2026-09-10)**. Origem: o `examples/auth` tem um `ui/Teleport.ts`
(componente) usado por Modal e Popover para renderizar fora da árvore do pai (escapar de
`overflow:hidden`/z-index). Trazer para o core como **behavior** — decisões travadas em 2026-09-10.

## Decisões travadas

1. **Superfície: behavior `use-teleport`** — teleporta o **próprio elemento do contexto** (`ctx.element`),
   não um filho. Compõe via `use: [useTeleport(...)]`, no fluxo de behaviors do mini-q.
2. **Só monta (keep simples)** — sem `open` interno. Quem decide renderizar é o `$when` externo
   (como hoje no Modal/Popover). O behavior apenas move o elemento para o alvo.
3. **Alvo reativo** — aceita `string | Element | (() => Element)`. Se for função, reage a mudanças
   e **move o nó vivo** para o novo alvo (sem desmontar/remontar).
4. **Nome do export: `$useTeleport`** — recurso nomeado com `$` (toca DOM, segue a convenção
   `$use*` do ROADMAP do exemplo; behaviors que tocam DOM usam `$`).
5. **Não renderiza como filho** — o elemento criado é **marcado como teleportado** e não é anexado
   como filho do pai. No alvo, é adicionado com controle de `insertAdjacentElement([where])`.
6. **`@scope` não se envolve** — o scope é fornecido por contexto via chamada, para que o
   componente lide como bem entender. O Teleport move o nó; o `@scope` delimita o estilo.

## Forma da API (proposta)

```ts
$useTeleport(target: string | Element | (() => Element)): Behavior<Element>
```

Uso:
```ts
$.div({
  class: sModal,
  use: $useTeleport('body'),
}, /* … */);
```

## Comportamento

- **Resolve o alvo** via `getElement` (seletor | elemento) — mesmo helper do `mount`.
- **Move o `ctx.element`** para o alvo (appendChild). O elemento deixa a árvore do pai e passa a
  viver no alvo — o placeholder/posição original não é necessário porque o próprio elemento é o
  que se move (diferente do componente `Teleport` do exemplo, que devolvia um comentário).
- **Alvo reativo**: se `target` for função, um `effect` observa o alvo resolvido; ao mudar, move o
  nó para o novo alvo. Cleanup no escopo (via `registerCleanup`).
- **Cleanup**: ao desmontar o escopo, o elemento é removido do alvo (o `disposeScope` do pai já
  remove os nós; o behavior não precisa de teardown extra além de parar o effect do alvo reativo).

## Por que behavior (e não componente)

- O elemento **já existe** no contexto (`ctx.element`) — não há filho a montar. Um componente
  `Teleport` precisaria montar uma subárvore e devolver placeholder; o behavior move o nó real.
- Compõe com os demais behaviors (`use: [$useTeleport('body'), useFocusScope(...)]`), como o Modal
  já faz com `useFocusScope`.
- Mantém o lifecycle do escopo: o elemento é criado no pai, movido para o alvo, e limpo no unmount.

## Impacto no código (ganchos mapeados)

- **`src/behaviors.ts`** — novo `$useTeleport` (ou um módulo `src/behaviors/teleport.ts` se crescer).
  Importa `getElement` de `dom/nodes`, `bind`/`effect` de `reactive`, `registerCleanup` de `lifecycle`.
- **`src/element/children.ts`** — marcar o elemento como teleportado e não anexá-lo como filho
  (decisão 5).
- **`src/index.ts`** — exporta `$useTeleport`.
- **`examples/auth`** — migrar `ui/Teleport.ts` → `$useTeleport`; Modal/Popover usam o behavior.

## Pontos abertos

1. ~~**Nome do export**~~ — **RESOLVIDO**: `$useTeleport` (recurso nomeado com `$`, toca DOM).
2. ~~**Alvo reativo + `$when`**~~ — **RESOLVIDO**: o `registerCleanup` cobre — o `stop` do
   effect do alvo é registrado no escopo e para no unmount. Como o elemento teleportado não vive
   na árvore do pai, o behavior também registra um cleanup que remove o nó do alvo no unmount
   (o `disposeScope` do pai não o alcança). Implementado e testado. **Nota (2026-09-10)**: o
   cleanup só passou a funcionar de fato quando a região (`src/element/region.ts`) passou a
   envolver a construção da view num escopo por reconciliação — antes, behaviors em views de
   `$when`/`$match`/`$switch` rodavam fora de escopo e o `registerCleanup` era no-op (ver
   `docs/o-feedback.md` §2).
3. ~~**Posição/placeholder**~~ — **RESOLVIDO**: marcar o elemento como teleportado e não renderizar
   como filho; no alvo, adicionar com `insertAdjacentElement([where])`.
4. ~~**`to` do `@scope`**~~ — **RESOLVIDO**: não envolve o scope; scope é fornecido por contexto
   via chamada para o componente lidar como bem entender.
