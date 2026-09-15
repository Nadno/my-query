# Proposta: SSG (static site generation) para mini-q

Status: **PROPOSTA — não implementada (2026-09-08).** Registra o rumo e o design. Origem: extrapolação
do usuário ("seria muito difícil fazer hydration? SSG por exemplo"). **Decisão de escopo:** mirar **SSG**;
**SSR fica deferido** ("só se vingar"). SSG entrega valor sozinho e é o pré-requisito natural de um SSR futuro.

## Por que SSG (e por que agora dá barato)

O trunfo da lib: **reatividade granular** (signals + effects que ligam direto em atributo/texto/região),
**sem VDOM e sem re-render**. Para *renderizar estático* isso é ideal — o build já produz o DOM final numa
passada; basta serializar. Para *hidratar* (fase opcional, adiante) também é o modelo certo: hidratar não é
diffar duas árvores, é **religar o grafo reativo ao DOM que já veio pronto**.

Estado atual relevante:
- Construção de DOM é **imperativa** e acoplada ao `document` global: [create.ts](../../src/element/create.ts)
  faz `document.createElement`; helpers em [dom/nodes.ts](../../src/dom/nodes.ts); regiões usam **comment-anchors**
  em [region.ts](../../src/element/region.ts).
- CSS **já quase pronto para extração**: [style/emit.ts](../../src/style/emit.ts) tem
  `compile(selector, obj) → string[]` e um `injected: Set<string>` com **todas** as regras. O único acoplamento
  é `ensureTag`/`inject` escreverem num `<style id="mq-styles">` vivo.
- A lib **já roda sob jsdom** (os 101 testes). Ou seja, um `document` de servidor não é hipótese — é o setup de teste.

## Design proposto

### Fase 0 (habilitador) — abstrair as operações de DOM atrás de um *backend*
Extrair as primitivas hoje acopladas ao `document` para uma interface pequena, injetável:

```ts
interface RenderBackend {
  createElement(tag: string): NodeLike;
  createText(data: string): NodeLike;
  createAnchor(label?: string): NodeLike;   // hoje = comment node (região)
  setAttr(el, key, value): void;
  appendChild(parent, child): void;
  // … o mínimo que create/props/children/region usam
}
```

Default = **DOMBackend** (o comportamento atual, `document.*`). Não muda a API pública — o `$` injeta o backend
ativo. Casa com o item do BACKLOG "quebrar `dom/nodes.ts`". É o refactor que destrava tudo abaixo.

### Fase 1 — SSG de verdade
Duas rotas, da mais barata à mais limpa:

1. **Rota jsdom (quase de graça, para validar):** `$mount` num `document` de jsdom/linkedom no Node,
   serializar `innerHTML`. Sai HTML com estado inicial correto **sem tocar no source**. Bom para um spike.
2. **Rota backend-string (recomendada):** um **StringBackend** que implementa `RenderBackend` emitindo uma
   string de HTML em vez de mutar DOM. Sem dependência de jsdom, mais rápido, e é o mesmo caminho que a
   hidratação vai reaproveitar. Os builders (`createTag`, children, control-flow) rodam **iguais** — só o
   backend muda.

**CSS:** trocar o alvo de `inject` de um `<style>` vivo por um coletor de string. Já existe quase tudo:
`compile` gera as regras e `injected` as acumula. `emitStylesheet(): string` = juntar o `injected`. Sai um
`<style>` no `<head>` do HTML gerado. Fecha a pendência de SSR-CSS do BACKLOG.

**Reatividade no SSG:** effects rodam uma vez para produzir o **valor inicial**; não há re-render. Para saída
puramente estática, descartar os `stop`/cleanups após serializar (o "escopo" do SSG é a passada de render).

> **Complementar:** para dar vida a HTML que já está na DOM **de qualquer origem** (não só SSG próprio),
> ver [adopt.md](adopt.md) (stage 0) — runtime puro (`$adopt`), sem cursor de builder.

### Fase 2 (opcional) — progressive hydration
Só quando/se fizer sentido. A base é o `RenderBackend`: um **HydrateBackend** que, em vez de `createElement`,
**reivindica o próximo nó existente** via um cursor que caminha o DOM do SSR na mesma ordem do builder.
Costura conhecida:
- **Âncoras de região** precisam ser **emitidas** no SSG e **casadas** no cliente (reconciliar contra os
  filhos existentes em vez de reinserir). Parte mais fiddly.
- **Texto reativo** (`() => expr`): ler o valor atual; se bate com o SSR, manter o nó e só plugar o effect.
  Dor clássica = whitespace / nós de texto adjacentes fundidos no HTML.
- **Eventos/behaviors** não são serializáveis → `applyEvents`/`use` rodam no cliente de qualquer jeito,
  anexando ao nó reivindicado. Sem problema novo.
- **`onMounted` (ver E4)** roda no *build*, não no *connect*: na hidratação deve rodar **uma vez**; no SSG
  não faz sentido rodar teardown-producing effects. Definir a semântica ao entrar na fase.

## O que NÃO fazer
- **Não** reescrever o núcleo nem introduzir VDOM. O ganho vem de uma **camada de backend**, não de mudar o
  modelo de render.
- **Não** perseguir SSR (servidor com data-fetch por request) agora — só SSG (build-time). SSR entra depois,
  reusando o StringBackend + um modelo de request/streaming, "se vingar".

## Ordem sugerida
1. Fase 0: `RenderBackend` + `DOMBackend` (refactor sem mudança de comportamento; typecheck/testes verdes).
2. Fase 1: `StringBackend` + `emitStylesheet()` → CLI/função `renderToString(App)`. Testes de SSG.
3. Fase 2 (se): `HydrateBackend` + âncoras emitidas + reconciliação de texto.

Maior custo real da hidratação = âncoras de região + texto; a reatividade em si já é a peça pronta.
