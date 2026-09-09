# mini-q — Estilo: o engine (`mini-q/style`)

O vocabulário do entry **opcional** `mini-q/style` — o engine de CSS-in-JS com **namespace de
entidade** (blocos). O caminho comum (`class`/`$style`/`$cx` e globais) está no
[USAGE](USAGE.md) §2; aqui é o profundo: `style`, partes, flags, variantes, slots, keyframes e
breakpoints reativos.

> Filosofia: **caixas maiores compostas por caixas menores.** Hierarquia semântica (convenção de nome):
> **Layout** ⊃ **Componente** ⊃ **Elemento visual** — `header`, `category-card`, `category-card-title`.

```ts
import { style, css, config, media } from 'mini-q/style';
```

## `style(name, config)` → `StyleHandle`

Define um **bloco** (nome `escopo-elemento`, ex.: `field`), devolve um **`StyleHandle` callable e
único** e **injeta** as regras num `<style id="mq-styles">`. As **partes ficam promovidas** no próprio
handle (`field.input`), junto de `self`/`flags`/`variants`/`keyframes`/`slots`. **`class`/`$class`/
`$cx` aceitam o handle direto** (ele é chamado) — sem `.self` no caso comum. Objetos JS: camelCase,
números viram `px` (exceto unitless como `opacity`/`zIndex`/`lineHeight`), aninhamento com `&`
(`&:hover`, `& .filho`) e um nível de `@media`/`@supports`. **Decls ficam no topo do config** — não há
`base`.

**Chaves do config:**

| chave | o que faz | CSS emitido |
|---|---|---|
| *(topo)* | declarações do bloco (escalares/`&`/`@`) | `.bloco { … }` |
| `parts` | partes descendentes (recursivo) | `.bloco .-bloco-parte { … }` |
| `>nome` | atalho para uma parte (`>title` ≡ `parts: { title: {…} }`) | `.bloco .-bloco-nome { … }` |
| `flags` | flags booleanas independentes | `.bloco.--is-flag { … }` |
| `variants` | grupos exclusivos | `.bloco.--grupo-valor { … }` |
| `defaults` | valor default por grupo de variante | — |
| `slots` | bloco estrangeiro hospedado | mirado por flags/variants |
| `keyframes` | animação escopada por bloco | `@keyframes bloco-nome { … }` |

```ts
const field = style('field', {
  display: 'flex', flexDirection: 'column',
  parts: {
    label: { fontSize: '.9rem' },
    error: { color: 'var(--danger)' },
  },
  // ou, de forma plana, com o atalho `>nome`:
  '>label': { fontSize: '.9rem' },
  '>error': { color: 'var(--danger)' },
  slots: { control: inputHandle },           // hospeda o bloco `input`
  flags: { invalid: { slots: { control: { borderColor: 'red' } } } },
  variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
  defaults: { size: 'md' },
});
```
```css
.field { display: flex; flex-direction: column; }
.field .-field-label { font-size: .9rem; }
.field .-field-error { color: var(--danger); }
.field.--is-invalid .input { border-color: red; }   /* slot → bloco hospedado */
.field.--size-sm { gap: 4px; }   .field.--size-md { gap: 8px; }
```

```ts
field.self                    // 'field'
field.label.self              // '-field-label'  (parte promovida)
field.flags.invalid           // '--is-invalid'
field.variants.size.sm        // '--size-sm'
field.slots.control           // 'input'
field({ size: 'sm', invalid: true })   // 'field --size-sm --is-invalid'

$class: () => field({ invalid: err.value })   // estado no callable
class: field.label                            // parte: handle aceito direto
```

- **Parte** = nome **completo do bloco** + chave, em **toda profundidade** (`-field-label`);
  combinador descendente automático; mover uma parte de nível **não renomeia**. Acessa-se promovida
  (`field.label`) e pode dar aninhada (`field.content.description`).
- **Flag** = estado booleano **independente** como classe composta `.bloco.--is-{nome}` (o `is-`
  distingue de variante no DevTools). **Variante** = grupo **exclusivo**: `.bloco.--{grupo}-{valor}`.
- **Slot** = bloco **estrangeiro** que você hospeda (`slots: { control: bloco }`); flags/variants o
  miram por `slots: { control: { … } }` → `.bloco.--is-flag .hospedado`. É a composição de 1ª classe
  (em vez de CSS cru). Distingue-se de **parte** (descendente que a entidade **possui**).
- **Override em flag/variante** — um corpo unificado: decls + `parts: { p: {…} }` e/ou `slots: { s: {…} }`.
- **Atalho `>nome`** — declara uma parte no topo do bloco sem aninhar em `parts`; ideal para
  hierarquias simples. `>` é um sinal visual de "filho direto" na fonte, mas o CSS continua
  descendente (`.bloco .-bloco-nome`). Pode misturar com `parts` explícito; chaves iguais se
  mesclam, com `parts` prevalecendo em conflito direto de declaração.
- Bloco simples também é handle callable: `class: card` (chama → `'card'`) ou `card.self`.
- Nomes reservados de parte: `self`/`flags`/`variants`/`keyframes`/`slots` (→ `warn`).

## Breakpoints

Um registro global de medias compartilhado entre o CSS (`@nome`) e o reativo (`media`):

```ts
config({ breakpoints: { sm: 480, md: 768, lg: 1024 } });
```

- **`config({ breakpoints })`** — registra/media nomes. Número = `(min-width: Npx)`; string numérica
  (`'768'`) ou query crua (`'(max-width: 767px)'`) também valem.
- **No CSS** — chave de media resolvida pelo registro (também aceita número cru): `{ '@md': { … } }` →
  `@media (min-width: 768px) { … }`.
- **Reativo** — **`media(nome|query)`** → `signal<boolean>` via `matchMedia`, com cleanup registrado no
  escopo. `media('md')`, `media(768)`, `media('(min-width: 768px)')`. Sem `matchMedia` (SSR/teste sem
  mock) → signal estático `false`. Requer adapter de reatividade com `signal?` (senão lança).

## Globais / escape hatch

```ts
css('body', { margin: 0 });   // seletor cru → regra global
```
`css(sel, obj)` é o export direto; `style.css(sel, obj)` é a mesma função. Para regras cruas fora do
motor de objeto, há `compile`/`inject` (baixo nível; usados também no SSR).

## Deprecados

```ts
parts(name, tree)  →  style(name, { parts: tree })   // @deprecated
```

## Warnings (falha que fala)

- Nome de bloco **registrado mais de uma vez** → warn (regras podem colidir).
- Chave-objeto **inesperada no topo** (parte fora de `parts`, flag solta no topo) → warn — não vira
  parte silenciosa.
- Parte com **nome reservado** do handle (`self`/`flags`/…) → warn.
- **Slot mirado** por flag/variante mas não declarado em `slots` → warn.

---

Vocabulário resumido: [GLOSSARY](GLOSSARY.md) §Estilo. Por que a API é assim (o engine como maior
orçamento de vocabulário da lib): [DX-MANIFESTO](DX-MANIFESTO.md) §8.
