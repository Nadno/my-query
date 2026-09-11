# mini-q — Estilo: o engine (`mini-q/style`)

O vocabulário do entry **opcional** `mini-q/style` — o engine de CSS-in-JS com **namespace de
entidade** (blocos). O caminho comum (`class`/`$style`/`$cx` e globais) está no
[USAGE](USAGE.md) §2; aqui é o profundo: `style`, partes, flags, variantes, hosts, keyframes e
breakpoints reativos.

> Filosofia: **caixas maiores compostas por caixas menores.** Hierarquia semântica (convenção de nome):
> **Layout** ⊃ **Componente** ⊃ **Elemento visual** — `header`, `category-card`, `category-card-title`.

```ts
import { style, css, config, media } from 'mini-q/style';
```

## `style(name, config)` → `StyleHandle`

Define um **bloco** (nome `escopo-elemento`, ex.: `field`), devolve um **`StyleHandle` callable e
único** e **injeta** as regras num `<style id="mq-styles">`. As **partes ficam promovidas** no próprio
handle (`field.input`), junto de `self`/`flags`/`variants`/`keyframes`/`hosts`. **`class`/`$class`/
`$cx` aceitam o handle direto** (ele é chamado) — sem `.self` no caso comum. Objetos JS: camelCase,
números viram `px` (exceto unitless como `opacity`/`zIndex`/`lineHeight`), aninhamento com `&`
(`&:hover`, `& .filho`) e um nível de `@media`/`@supports`. **Decls ficam no topo do config** — não há
`base`.

**Chaves do config (idioma `$`):**

| chave | o que faz | CSS emitido |
|---|---|---|
| *(topo)* | declarações do bloco (escalares/`&`/`@`) | `.bloco { … }` |
| `$nome` | **parte** (filho direto do self); recursivo | `.bloco > .-bloco-parte { … }` |
| `$:` | **ficha técnica**: `hosts`/`defaults`/`flags`/`variants`/`keyframes`/`scope` | condicional/at-rules (não declara) |
| composto | seletor com refs `$`: `'& > $dot'`, `'& $muted'` (descendente explícito) | autor controla |

> **Refs `$` são GLOBAIS ao bloco** — resolvem de qualquer nível (nivelamento): `$dot` no root
> resolve o neto. **Legacy em transição (deprecado):** `parts:{}`, `>nome`, `slots:` e
> `flags`/`variants`/`defaults`/`keyframes`/`scope` no topo ainda funcionam (combinador
> **descendente**), mas avisam — use o idioma `$`.

```ts
const field = style('field', {
  $: {
    hosts: { control: inputHandle },              // hospeda o bloco `input`
    defaults: { size: 'md' },
    flags: { invalid: { $error: { color: 'red' }, hosts: { control: { borderColor: 'red' } } } },
    variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
  },
  display: 'flex',
  flexDirection: 'column',
  $label: { fontSize: '.9rem' },
  $error: { color: 'var(--danger)' },
});
```
```css
.field { display: flex; flex-direction: column; }
.field > .-field-label { font-size: .9rem; }
.field > .-field-error { color: var(--danger); }
.field.--is-invalid > .-field-error { color: red; }
.field.--is-invalid .input { border-color: red; }        /* host → bloco hospedado */
.field.--size-sm { gap: 4px; }   .field.--size-md { gap: 8px; }
```

```ts
field.self                    // 'field'
field.label.self              // '-field-label'  (parte promovida)
field.flags.invalid           // '--is-invalid'
field.variants.size.sm        // '--size-sm'
field.hosts.control           // 'input'
field({ size: 'sm', invalid: true })   // 'field --size-sm --is-invalid'

$class: () => field({ invalid: err.value })   // estado no callable
class: field.label                            // parte: handle aceito direto
```

- **Parte** = chave `$nome`; nome **completo do bloco** + chave, em **toda profundidade**
  (`-field-label`); combinador **filho direto** (`& >`); mover uma parte de nível **não renomeia**.
  Acessa-se promovida (`field.label`) e pode dar aninhada (`field.content.description`).
  Descendência mais profunda: composto (`'& $muted'`).
- **Flag** = estado booleano **independente** como classe composta `.bloco.--is-{nome}` (o `is-`
  distingue de variante no DevTools). **Variante** = grupo **exclusivo**: `.bloco.--{grupo}-{valor}`.
- **Host** = bloco **estrangeiro** que você hospeda (`$: { hosts: { control: bloco } }`); flags/variants o
  miram por `$: { hosts: { control: { … } } }` → `.bloco.--is-flag .hospedado`. É a composição de 1ª classe
  (em vez de CSS cru). Distingue-se de **parte** (descendente direto que a entidade **possui**).
- **Override em flag/variante** — um corpo unificado: decls + `$parte` (filho direto) e/ou
  `hosts: { s: {…} }`.
- **`$:` é a ficha técnica** — `hosts`/`defaults`/`flags`/`variants`/`keyframes`/`scope`; o topo
  carrega só CSS incondicional (decls/`&`/`@`/parte `$nome`/composto).
- Bloco simples também é handle callable: `class: card` (chama → `'card'`) ou `card.self`.
- Nomes reservados de parte: `self`/`flags`/`variants`/`keyframes`/`hosts`/`slots` (→ `warn`).

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

Forms anteriores do config **ainda funcionam** (combinador descendente), mas avisam — migre para o
idioma `$`:

```ts
parts(nome, tree)                    →  style(nome, { $nome: tree })            // @deprecated (API)
parts: { label: {...} }              →  $label: { ... }                        // @deprecated (config)
'>label': { ... }                    →  $label: { ... }                        // @deprecated (config)
slots: { control: bloco }            →  $: { hosts: { control: bloco } }       // @deprecated (config)
flags/variants/defaults no topo      →  $: { flags/variants/defaults }         // @deprecated (config)
```

## Warnings (falha que fala)

- Nome de bloco **registrado mais de uma vez** → warn (regras podem colidir).
- Chave-objeto **inesperada no topo** (parte sem `$`, flag solta no topo) → warn — não vira
  parte silenciosa.
- Parte com **nome reservado** do handle (`self`/`flags`/`hosts`/…) → warn.
- **Host mirado** por flag/variante mas não declarado em `$: { hosts }` → warn.
- Uso de `parts:`/`>nome`/`slots:`/topo-flags (legacy de transição) → warn de depreciação.

---

Vocabulário resumido: [GLOSSARY](GLOSSARY.md) §Estilo. Por que a API é assim (o engine como maior
orçamento de vocabulário da lib): [DX-MANIFESTO](DX-MANIFESTO.md) §8.
