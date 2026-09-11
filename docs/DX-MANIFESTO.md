# mini-q — Manifesto de DX

> O que "DX" significa para o mini-q e o critério que guia decisões de API.
> USAGE diz *como usar*; [ARCHITECTURE](ARCHITECTURE.md) diz *como flui e onde mora*;
> [GLOSSARY](GLOSSARY.md) dá *os nomes*; este documento diz **por que a API é assim** — e é a
> fonte de verdade das decisões de superfície.

## Norte

**DX = o caminho comum é o mais curto, e o que falha fala.**

Dois eixos, uma frase cada:

- **Caminho comum curto** — os padrões de alta frequência (elemento, lista keyed, `$model`, `on`/`use`)
  têm zero cerimônia: sem `{}` vazio, sem cast, sem boilerplate. Fricção em padrão comum é paga
  50× por tela.
- **Falha que fala** — o que parece erro, avisa: todo erro/warn diz **o que** falhou, **onde** e
  **o que fazer**. Silêncio só quando é intencional (e documentado).

---

## Princípios

### 1. O caminho comum é o mais curto

O padrão que todo usuário escreve todo dia tem a menor cerimônia possível. Se um caso comum exige
`{}` vazio, cast ou boilerplate, **a API está errada — não o usuário**.

- `$.div({}, ...)` → `$.div(...)` (props opcionais quando o 1º arg é claramente filho).
- `[Comp, {...t, key}] as [...]` → `$each(items, Comp, t => t.id)` (tipa a key, mata o cast).
- `$model(type as Signal<string>)` → overloads que inferem o modo pelo elemento + tipo.

### 2. Silêncio só quando é intencional

Falha **surpreendente** fala: quando uma chamada parece fazer uma coisa e faz outra (ou nada), avise
com uma mensagem acionável (o que, onde, o que fazer). No-op **intencional** é ok — `null`/`false`
como filho some de propósito, e isso é documentado.

- ✅ warn de estilo duplicado; warn de `onUnmounted` fora de escopo.
- ⚠️ débito: `$disabeld` (typo) vira `setAttribute` mudo — a prop nunca atualiza e nada avisa.
- ⚠️ débito: `$mount` com árvore pronta vaza effects sem avisar.

### 3. `$` é a marca do mini-q

`$` marca a superfície do mini-q em três lugares — e só neles:

| Onde | Exemplo | Significado |
|---|---|---|
| `$` (default) | `$.div`, `$.p` | namespace de tags |
| `$`-prefixo em prop | `$disabled`, `$class` | reativo |
| `$`-prefixo em export | `$mount`, `$when` | recurso do mini-q |

Um único marcador visual diz "aqui tem mágica do mini-q" — o resto é DOM puro. Nunca usar `$` para
outra coisa.

### 4. Reativo é visível

Reatividade é explícita no call site: `$disabled` vs `disabled` — você sabe o que atualiza olhando.
É o diferencial da lib (React não distingue; Vue depende de compilador). **Não adicionar reatividade
implícita** — nada vira reativo sem a marca `$`.

### 5. Uma forma canônica por conceito

Uma única forma para cada conceito. Duas formas "equivalentes" custam aprendizado e dividem o código.

- **Componente = closure** (canônica); setup é açúcar para "raiz é a tag + preciso de `ctx`".
- **Evento que dispara → `on`; que se comporta → `use`** (fronteira explícita).
- Ao achar duas formas, escolher uma e deprecar a outra (ex.: `$handlers` raiz → `$handle.handlers`).

### 6. Tipos que guiam

TypeScript pega o erro e autocompleta o certo. O compilador é o feedback mais rápido que existe.

- Sem `any` vazando em tipos públicos.
- Index signature que engole typo é débito (ver princípio 2).
- Overloads inferem o caso comum (`$model` sem cast).

### 7. Composable com elemento

Behaviors (`use`) são a superfície de composição — um composable que recebe `ctx.element`. `ctx`
carrega o que composables precisam (`on`, `cleanup`, `untrack`). Feature "behavior-like" vira
behavior, não conceito novo no core; enriquecer `ctx` em vez de adicionar helpers globais.

### 8. Complexidade é um custo

Cada conceito novo na API (chave, opção, forma de fazer) é pago por **todo** usuário — mesmo quem
nunca o usa: ele aparece na doc, no autocomplete e no código alheio. Poder tem imposto.

Antes de adicionar um conceito, pergunte: o caso comum pode ser trivial **sem** ele? Se sim, o
conceito vira **opt-in** (entry separado, opção, camada) — não o caminho padrão.

Exemplo: o engine de estilo (`$nome`/`$:`/flags/variants/hosts/keyframes) é o maior orçamento de
vocabulário da lib. Quem só quer estilizar um botão paga o custo de conhecer (ou ignorar) tudo isso.
O default deveria ser o caminho simples (CSS + tokens); o engine, a opção para o caso dinâmico.

### 9. Docs que ensinam o modelo mental

Docs são parte do produto. USAGE/FLOW/GLOSSARY ensinam o modelo; DOCS-DRIFT rastreia mentiras.
Idealmente, toda mudança de API atualiza docs no mesmo PR; quando a doc atrasa, vira **débito
rastreado** (DOCS-DRIFT) — nunca silêncio.

---

## Decisões travadas

Escolhas canônicas registradas (não reabrir sem motivo):

| Decisão | Escolha | Por quê |
|---|---|---|
| Forma de componente | **Closure** (canônica); setup = açúcar | closure é mais simples e geral; setup só quando precisa de `ctx` + raiz fixa |
| 1º arg função | **Arity**: 0-param = filho reativo; ≥1 param = setup | única distinção prática em runtime; setup que ignora props → closure |
| `$` | tags + exports nomeados `$`-prefixados | `$` = superfície do mini-q (princípio 3) |
| Reatividade | `$`-prefixo em props; `() => expr` com qualquer adapter | reativo visível (princípio 4) |
| Eventos | `on` (dispara) vs `use` (se comporta) | fronteira explícita (princípio 5) |
| Condicional | `$when` = monta/desmonta (estado fresco); preservação = `$show` | uma forma por conceito (princípio 5/8) |
| Signal | agnóstico via adapter (`$useSignal`) | sem lock-in |
| Estilo | entry opcional `mini-q/style` | core enxuto (princípio 8) |

---

## Como usar este documento

**Antes de adicionar API**, passar pelos princípios:

1. O caminho comum fica mais curto? (princípio 1)
2. Um typo/uso errado produz erro ou warn acionável? (princípio 2)
3. `$` está sendo usado só para a superfície do mini-q? (princípio 3)
4. Reatividade é visível no call site? (princípio 4)
5. Já existe outra forma de fazer a mesma coisa? Qual é a canônica? (princípio 5)
6. O TypeScript pega o erro e autocompleta o certo? (princípio 6)
7. Dá para ser um behavior em vez de um conceito novo? (princípio 7)
8. O vocabulário novo vale o custo? Dá para ser opt-in? (princípio 8)
9. A doc foi atualizada no mesmo PR? (princípio 9)

**Em PRs/commits**, citar o princípio que a mudança serve (ex.: "princípio 1 — caminho comum").
