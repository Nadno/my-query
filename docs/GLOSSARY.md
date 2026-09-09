# mini-q — Glossário

Índice **termo → definição de 1 linha**. A prosa (uso, exemplos, arquitetura) vive no
[USAGE](USAGE.md), [STYLE](STYLE.md) (engine de estilo), [ARCHITECTURE](ARCHITECTURE.md) e
[DX-MANIFESTO](DX-MANIFESTO.md) — aqui é só o nome + o que é · `token`.

**Forma da API (2026-09-08):** `$` é **só o namespace de factories de tag** (`$.div`, `$.p`, …); os
recursos são **exports nomeados com prefixo `$`** (`$mount`, `$when`, `$model`, …); o engine de CSS mora
no entry **opcional** `mini-q/style`.

---

## Núcleo (DOM / render)

- **`$` (namespace de tags)** — dicionário de factories de tag (sem seletor, sem helpers). · `import $ from 'mini-q'`
- **Factory de tag** — cria um elemento de uma tag. · `$.div(props?, ...children)`
- **Forma elemento** — chamada que devolve um `Element` agora. · `$.button({ type:'button' }, 'ok')`
- **Forma setup (componente)** — 1º arg função **≥1 param** ⇒ componente cuja raiz é a tag (recebe `(props, ctx)`); **0-param** = filho reativo (desambiguação por **aridade**). · `$.div<P>((props, ctx) => [...])`
- **Componente closure** — função comum que retorna um elemento. **Canônica.** · `const Row = (t) => $.li({}, t.title)`
- **Prop reativa (`$`-prop)** — chave `$`-prefixada ligada a um signal/derivação. · `{ $disabled: sig }`
- **Derivação inline** — `() => expr` como valor reativo (funciona com qualquer adapter). · `{ $class: () => on.value ? 'a' : 'b' }`
- **Filho reativo** — signal/função na posição de filho; vira uma **região reativa**; função **0-param** como 1º arg dispensa o `{}` (açúcar). · `$.span(() => n.value)`
- **Região reativa** — trecho de filhos governado por fonte reativa, fixado por uma **âncora** (comment node) e reconciliado a cada mudança.
- **Âncora** — nó-marcador invisível que fixa a posição de uma região no DOM.
- **Tupla de componente** — `[Component, props]`: renderização lazy e cacheável; props **não conferidas em tipo** (o caminho tipado é `$each`). · `[Row, { ...t, key: t.id }]`
- **Reconciliação keyed** — reuso/reordenação de nós por `key` (preserva foco). · `key`
- **`$each` (lista keyed)** — região para listas: fonte (signal·função·array) + componente + `keyFn`; `key` é **reservada**; tupla crua = branching/props derivadas. · `$each(itens, Row, t => t.id)`
- **`$when` (condicional)** — monta/desmonta o ramo; **estado fresco por design** (preservar estado = `$show`). · `$when(aberto, () => Modal())`
- **`$match` / `$switch` / `$else`** — multi-via por `[cond, view]` (1ª truthy vence); despacho enum-like por chave; sentinela de catch-all. · `$match([cond, v], …)`, `$switch(sel, cases)`, `[$else, v]`
- **Escopo (owner)** — fronteira de lifecycle que coleta cleanups; aberta por `$mount` e por cada região/componente aninhado.
- **Cleanup** — função de desmontagem (effects, listeners, custom events, behaviors).
- **untrack** — leitura que **não** cria dependência (constrói subárvore sem virar dep dela). · `untrack(fn)`

## Reatividade

- **Adapter de reatividade** — ponte agnóstica para a lib de signal. · `$useSignal({ isSignal, getValue, effect, untrack?, signal?, setValue? })`
- **Signal** — fonte reativa com `.value`. **Bindable** — valor de `$`-prop: signal | `() => expr` | cru.
- **Effect** — reação que roda e re-roda quando deps mudam; retorna stop.
- **`bind` / `read` / `setValue` / `isSignal` / `isReactive`** — primitivos de baixo nível (USAGE §9). · `bind(fonte, apply)`, `read(b)`, `setValue(sel, v)`

## Eventos

- **Mapa de eventos (`on`)** — record `{ evento: valor }`. · `on: { click, keydown }`
- **Handler** — `(event, ctx) => void`; em custom pareado pode devolver o cleanup do "un-enter" (`PairedHandler`). · `ctx.element` = nó cru
- **Modificador** — transformador de handler composável; **ordem do array = ordem de execução**. · `$handle.keys('Enter')`, `.prevent`, `.debounce(300)`
- **Invocação síncrona vs assíncrona** — `debounce`/`throttle` invocam o handler de forma assíncrona no trailing/`maxWait` (o retorno morre no `setTimeout`); só **leading** (síncrono) propaga o retorno.
- **`$handle` (namespace)** — combina handler + modificadores; callable + `.handlers` p/ reuso. · `$handle(fn, ...mods)`, `$handle.handlers({...})`
- **`$on(ctx, name, value)`** — evento avulso a partir de `ctx` (behaviors/setups); mesmo caminho do `on:{}`; auto-cleanup no escopo + retorna cleanup idempotente.
- **Custom event** — evento que **dispara**, escutado no `on`; o objeto no fim da tupla são as **opções da fonte** (tipadas via `MQCustomEventOptions`). · `clickOutside`, `hover`, `$registerCustomEvent`
- **Custom event pareado (enter↔leave)** — handler devolve o **cleanup do "un-enter"** e a fonte o roda na saída. · `hover`, `focusOutside`, `interactOutside`
- **Fronteira on/use** — *dispara e chama handler* → `on`; *só se comporta* → `use`.

## Behaviors

- **Behavior (`use`)** — comportamento pós-criação que **não dispara**; composable **vinculado a um elemento** (recebe `ctx`); registra teardown no escopo. · `use: $model(sig)`, `$show(cond)`
- **`$model`** — two-way em formulários; modo **auto-detectado** pelo elemento + tipo do signal (text/checkbox/grupo/radio/select-multiple).
- **`$show`** — alterna `hidden` (preserva estado; ≠ `$when`, que desmonta e recria).

## Estilo / CSS — `mini-q/style` (entry opcional)

O profundo (filosofia, blocos, exemplos, breakpoints) está no **[STYLE](STYLE.md)**.

- **`style` (namespace)** — `style(nome, config)` define entidade e injeta; `style.css(sel, obj)` = escape hatch global. · `style('category-card', {...})`
- **StyleHandle** — retorno de `style`: **callable** (`field({ size, invalid })` → string de classes) com **partes promovidas** (`field.input`), mais `self`/`flags`/`variants`/`keyframes`/`slots`; `class`/`$class`/`$cx` aceitam o handle.
- **Bloco** — entidade raiz estilizada; nome `escopo-elemento` (semântica: **Layout** ⊃ **Componente** ⊃ **Elemento visual**). · `category-card`
- **Parte** — descendente do bloco (sob `parts`, recursivo), **promovida ao handle**; classe `-{bloco}-{chave}` em toda profundidade. · `card.title`
- **Flag / Variante** — estado booleano independente `.bloco.--is-{nome}` · grupo exclusivo `.bloco.--{grupo}-{valor}`. · `--is-featured`, `--size-sm`
- **Slot** — bloco **estrangeiro** hospedado, mirado por flags/variants; composição de 1ª classe. · `slots: { control: bloco }`
- **Keyframe escopado** — animação nomeada `bloco-nome`. · `card.keyframes.pulse`
- **Decls no topo** — declarações do bloco no topo do config (**sem `base`**); chaves reservadas `parts`/`flags`/`variants`/`defaults`/`slots`/`keyframes`.
- **Breakpoint / `@nome` / `media`** — media registrada em `config({ breakpoints })`; `@md`/`@768` no CSS; `media(nome|query)` → `signal<boolean>`. · `config({ breakpoints: { md: 768 } })`
- **Deprecados** — `parts(nome, tree)` → `style(nome, { parts: tree })`.

## Ciclo de vida / infra

- **`$mount(target, App) → unmount`** — injeta a árvore num escopo raiz; `unmount` limpa tudo. Passar **builder/componente**, não árvore pronta.
- **`$onMounted(fn)`** — roda **agora** (construiu); o retorno vira teardown ("monta e devolve a limpeza"). · `$onMounted(() => () => cleanup)`
- **`$onUnmounted(fn)`** — teardown no escopo ativo (roda no `unmount`/remoção do item).
- **Hooks vs. behavior** — hooks = composable **sem elemento**; behavior = o mesmo conceito **vinculado ao elemento** (`ctx.element`). Fora de escopo, hooks públicos **warn**; behaviors degradam em silêncio.
- **Timing** — "mounted" = construiu (elemento criado), não necessariamente no `document`. Limitação conhecida.
- **`$append(parent, child)`** — injeta um filho renderizável com a normalização do `$.tag` (primitivo/Node/array/`[Comp,props]`/reativo).

---

Como funciona e onde mora o código: [ARCHITECTURE](ARCHITECTURE.md) · Por que a API é assim: [DX-MANIFESTO](DX-MANIFESTO.md) · Pendências: [BACKLOG](BACKLOG.md).
