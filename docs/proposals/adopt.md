# Proposta (stage 0): `$adopt` — religar comportamento mini-q a HTML existente

Status: **STAGE 0 — PROPOSTA, sem prazo (2026-09-15).** Nada implementado. Origem: o usuário apontou o
[`html-template`](https://github.com/Nadno/html-template/tree/feat-item-interface) (engine `item-*`
one-shot, DOM-manipulation) como possível "camada adicional". Registra o rumo e ancora o design no
código atual de `mini-q`.

## 1. O que resolve (e o que o `html-template` ensina)

O mini-q é 100% builder (`$.div(...)`). **Não existe caminho para pegar HTML que já está na DOM —
SSG, SSR, CMS, estático, markup de designer — e anexar comportamento nele.** O `html-template` preenche
exatamente essa lacuna (clona um `<template>`/`<script type=text/html>`, injeta num container com
`prepend`/`append`/`replace`). Insight do usuário: o engine é pequeno **porque é one-shot** — chaves
planas (`{{key}}` = path no objeto), injeta e pronto; sem parser de expressão. Isso é o que o torna
simples, e é o motivo de o **formato** interessar e o **engine como-é** não colar.

## 2. Decisões fechadas (em conversa)

1. **Só hydrate/adopt — camada *complementar***, nunca "HTML-primeiro". Preenche a lacuna real (o
   builder não consome HTML existente) **sem criar segundo paradigma**. SSG/SSR continua como fonte do
   markup; nada que "mate o SSR". SSG é a melhor aposta (usuário) — o adopt é a outra metade: dar vida ao
   que o SSG gerou.
2. **Sem gramática nova no HTML.** Nada de `-on`/`-value`/`-use` (isso seria Vue/Alpine — segundo runtime
   coabitando com o builder). O mapeamento elemento→comportamento é **JS-só**, com a API normal:
   âncoras via query escoped / `data-attr`, não sintaxe no markup. Comportamento declarado perto do nó
   em que vive.
3. **Do `html-template`, vale só o mecanismo barato de adoção** (`cloneNode`/`firstElementChild`/unwrap),
   **não** a linguagem de binding `item-*` (one-shot, `{{key}}` planas — não escala para reativo sem
   parser de expressão, que mataria a simplicidade).
4. **Complementar a [`ssg.md`](ssg.md)**: lá a Fase 2 é um `HydrateBackend` com **cursor do builder**
   reconciliando SSG próprio. `$adopt` é runtime puro sobre DOM já existente **de qualquer origem** —
   caminho barato, não requer `RenderBackend` nem emissores de âncora.

## 3. O código atual já entrega quase tudo

| peça | onde | o que faz pelo adopt |
|---|---|---|
| `applyProps(el, ctx, props)` | [`element/props.ts:78`](../../src/element/props.ts) | opera em **qualquer** `Element` existente, não só em nó criado por `createTag`: `class/$class`, `style/$style`, `data/$data`, `aria/$aria`, `on`, `use`, atributos `$`-reativos. |
| duas fases `applyProps`→`appendChild`→`applyUse` | [`element/create.ts:55-62`](../../src/element/create.ts) | o molde do adopt: props no host, filhos depois, behaviors por último (`$model` num `<select>` precisa das `<option>`). |
| `applyUse(ctx, use)` | [`behaviors.ts:10`](../../src/behaviors.ts) | aplica behaviors a nó existente; cleanup registrado no escopo ativo. |
| lifecycle escopado | [`lifecycle.ts`](../../src/lifecycle.ts) | `createScope`/`runInScope`/`registerCleanup`/`disposeScope`/`flushMounted` — `$onMounted`/`$onUnmounted` funcionam iguais. |
| `appendChild(parent, child)` | [`element/children.ts:13`](../../src/element/children.ts) | **subárvores novas dentro do host já funcionam** (Node/array/tupla/região reativa) — o adopt não precisa construir filhos. |
| `mount` | [`mount.ts:14`](../../src/mount.ts) | o molde do unmount: registra `before/after` em `childNodes` e remove **só o que anexou** ao desmontar. |

## 4. Forma proposta

```ts
const unmount = $adopt('#widget', {
  $class: () => card({ featured: featured.value }),   // reativo em cima de nó estático
  on: { click: onOpen },
  use: [$model(nome), $show(open)],                 // behaviors no nó existente
  $aria: { expanded: open },
}, () => $.span('filho novo', { use: [$show(open)] })); // opcional: injeta e rastreia

unmount(); // roda cleanups do escopo + remove SÓ o que o adopt anexou; nunca o #widget
```

- Assinatura espelha o idioma de tag: `$adopt(seletor | Element, props?, ...children)` → `() => void`.
  Props são `Props<T>` (o mesmo objeto de `$.div`). `children` não anexam ao host, mas **comportam-se como
  subárvores do host** no escopo do adopt.
- `$onMounted`/`$onUnmounted` no corpo de um **setup** valem aqui como no builder (`ctx.element = host`).
- O nó do host **nunca é removido** pelo unmount — não é nosso; só o que o adopt construiu.

**Superfície:** novo `src/adopt.ts` (~50 linhas, espelhando `mount`) + `export { adopt as $adopt }` no entry.
**Testes (contrato):** props `$reativas`/`on`/`use` aplicadas a nó estático; `$onMounted` deferido
(`flushMounted`); cleanups completos no unmount; remoção só dos filhos anexados (o host permanece);
`$adopt` em nó já conectado e em nó órfão.

## 5. O que NÃO fazer (YAGNI)

- **Parser de expressão** (`{{ a + b }}`, expressions à Alpine) — mataria a simplicidade.
- **Gramática de diretivas no HTML** (`item-*`, `v-`, `x-`, `-on`) — segundo paradigma.
- **Fundir com a Fase 2 do ssg.md agora** — aquela reconcilia SSG próprio com cursor; adopt cobre
  "HTML de qualquer lugar". Se o SSG próprio vingar, reavaliar a sobreposição.
- **Concorrer com o builder** — adopt **anexa comportamento**, não constrói a página.

## 6. Abertas

- **Nome/export**: `$adopt` vs `$hydrate` vs `$from` — o `$` prefixado preserva a regra 1 do AGENTS
  (`$` continua só tags; recurso = export nomeado).
- **API de setup**: só a forma `props+children` acima, ou também o callable `$adopt(target, (host, ctx) => …)`
  (mais aridade, ex.: adotar várias partes e devolver cleanups explícitos).
- **Escopo em `$each`**: adotar um container e a lista de itens é reativa — o adopt vira o "host" da
  região (hoje o `appendChild` já cria região; falta decidir se o adopt expõe isso como API).
