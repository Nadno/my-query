# Proposta (Fase 2): variáveis de design no `$.style`

Status: **DEFERIDA por decisão (2026-09-07) — native-first.** Não implementar agora. Este doc registra o
**rumo** e o **design preferido** para quando/se for retomado. Origem: pedido do usuário ("algo similar ao
Stitches") + revisão de custo/benefício de CSS-in-JS frente ao CSS moderno.

## Rumo decidido

O CSS moderno já resolve a parte **dinâmica** de forma mais barata que um engine runtime:
- **custom properties** → tema e valores dinâmicos (herdam pelo DOM, sem re-inject, sem FOUC, SSR de graça);
- **`@scope`** → escopo real (o scoping por `data-*` foi **recusado**: contradiz a legibilidade e fura com
  elementos destacados como Popover/Toast);
- **container queries / `@layer` / `color-mix` / `light-dark`**.

Portanto: **não crescer o engine runtime** para tokens/tema. O `$.style` continua sendo o **vocabulário estático**
(parts/flags/variants); o dinâmico monta em CSS nativo.

**Status quo (o que já funciona hoje, sem feature nova):** declarar tokens globais com
`$.style.css(':root', { '--danger': '#ef4444' })` e consumir como `var(--danger)`. É o caminho recomendado por
ora. A feature abaixo só reduz cerimônia/tipagem — não habilita nada que o CSS nativo não faça.

## Design preferido (para quando for retomado)

### 1. Bloco `vars` por componente + "estado reescreve a var"
```ts
const card = $.style('card', {
  vars: { gap: 8 },                 // → .card { --card-gap: 8px }
  display: 'flex',
  gap: (self) => self.vars.gap,     // → gap: var(--card-gap)   (ver §2)
  flags: {
    compact: { vars: { gap: 4 } },  // → .card.--is-compact { --card-gap: 4px }
  },
});
```
O ganho: o estado **reescreve a var**, não redeclara a propriedade — `gap: var(--card-gap)` é declarado uma vez.
Menos CSS, e como var **herda pelo DOM**, até um bloco destacado (toast/popover) lê o valor. Vars locais
escopadas como `--{bloco}-{nome}` (sem colisão global). Expostas em `card.vars.gap`.

### 2. Valor via função `self` (fixado pelo usuário) — sem açúcar de string
Referenciar `card` dentro da própria definição é chicken-egg. Solução: **valor pode ser uma função** que o engine
chama no build passando o handle (expõe `.vars`/`.self`), resolvendo para a string final:
```ts
gap: (self) => self.vars.gap        // 'var(--card-gap)'
```
**Descartado:** o açúcar `'$nome' → var(--nome)` interceptado no `toDecl` (parsing de string em runtime, pouco
tipado, "cheiro" de CSS-in-JS). O acessor tipado via função é explícito e inferível.

### 3. Tokens globais tipados
Declaração única → `:root` + acessor tipado (`t.color.danger → 'var(--color-danger)'`). O acessor é puro
tipo + montagem de string; **zero engine**. Pode conviver com o `$.style.css(':root', …)` atual.

### Tema / dark
Escopo nativo `[data-theme="dark"]` reescrevendo as mesmas vars com outros valores; alterna por atributo no
`<html>` (opcionalmente reativo via `$.media('(prefers-color-scheme: dark)')`).

## Ganchos de implementação (mapeados, p/ o futuro)
- **Valores-função + `var()`**: resolver em `src/style/build.ts` (`buildNode`) antes de `inject`, e/ou no
  `toDecl` de `src/style/emit.ts:25`. É o único ponto por onde todo valor passa.
- **`vars`**: nova chave reservada no `StyleConfig` (emite `--{bloco}-{nome}` no self; override em flags/variants).
- **Tokens globais / registro**: `MiniQConfig` (`src/config.ts`) — hoje só `breakpoints`.

## Decisões abertas (resolver no plano dedicado, se retomado)
1. `vars` numéricos ganham `px` automático (como o resto) ou ficam crus.
2. Escala de nomes dos tokens globais (`--grupo-nome` vs. flat) e sintaxe do acessor.
3. API de tema (`$.theme(name, tokens)`?) e como o app alterna.
4. Ordem/So de emissão (tokens antes das regras) para SSR.
