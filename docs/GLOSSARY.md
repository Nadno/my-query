# mini-q — Glossário

Linguagem comum dos recursos de DX. Use estes nomes nas docs, commits e conversas para consistência.
Cada termo: **nome** — definição curta · `token de código`.

**Forma da API (2026-09-08):** `$` é **só o namespace de factories de tag** (`$.div`, `$.p`, …). Os
recursos são **exports nomeados com prefixo `$`** (`$mount`, `$when`, `$handle`, `$model`,
`$useSignal`, …), importados à parte. O engine de CSS vive no entry **opcional** `mini-q/style`.

---

## Núcleo (DOM / render)

- **`$` (namespace de tags)** — dicionário de factories de tag (sem seletor, sem helpers). · `import $ from 'mini-q'`
- **Factory de tag** — função que cria um elemento de uma tag. · `$.div(props?, ...children)`
- **Forma elemento** — chamada que devolve um `Element` agora. · `$.button({ type:'button' }, 'ok')`
- **Forma setup (componente)** — 1º arg função ⇒ define um componente cuja raiz é a tag; recebe `(props, ctx)`, retorna filhos. **Açúcar** — a forma canônica é a closure. · `$.div<P>((props, ctx) => [...])`
- **Componente closure** — função comum que retorna um elemento. **Canônica.** · `const Row = (t) => $.li({}, t.title)`
- **Prop reativa (`$`-prop)** — chave prefixada com `$` liga a prop a um signal/derivação. · `{ $disabled: sig }`
- **Derivação inline** — `() => expr` como valor reativo (funciona com qualquer adapter). · `{ $class: () => on.value ? 'a':'b' }`
- **Filho reativo** — signal/função na posição de filho; vira uma **região reativa**. · `$.span({}, () => n.value)`
- **Região reativa** — trecho de filhos governado por uma fonte reativa, delimitado por uma **âncora** (comment node) e reconciliado a cada mudança.
- **Âncora** — nó-marcador invisível que fixa a posição de uma região no DOM.
- **Tupla de componente** — `[Component, props]`: renderização **lazy** e **cacheável** (ideal em listas). Props **não conferidas em tipo** (`ComponentTuple<P = any>`; o caminho tipado é `$.each`). · `[Row, { ...t, key: t.id }]`
- **Reconciliação keyed** — reuso/reordenação de nós por `key` (move só o fora de posição; preserva foco). · `key`
- **`$each` (lista keyed)** — açúcar de região para listas: fonte (signal·função·array, readonly ok) + componente + `keyFn`; cada item vira `[Comp, { ...item, key }]`. `key` é **reservada** (keyFn prevalece; Comp não lê `key` tipada). Tupla crua é a saída para branching/props derivadas. · `$.each(fonte, Row, t => t.id)`
- **`$when` (condicional)** — monta/desmonta o ramo conforme a condição; **estado fresco por design** (cada alternância recria o ramo — preservar estado = `$show`). · `$.when(aberto, () => Modal())`
- **Escopo (owner)** — fronteira de lifecycle que coleta **cleanups**; aberta por `$mount` e por cada região/componente aninhado. `unmount` roda os cleanups do escopo.
- **Cleanup** — função de desmontagem (para effects, listeners, custom events, behaviors).
- **untrack** — leitura que **não** cria dependência (constrói a subárvore de uma região/`$when` sem virar dep dela).

## Reatividade

- **Adapter de reatividade** — ponte agnóstica para a lib de signal. · `$useSignal({ isSignal, getValue, effect, untrack?, signal? })`
- **Signal** — fonte reativa com `.value`. **Bindable** — valor de `$`-prop: signal | `() => expr` | cru.
- **Effect** — reação que roda e re-roda quando deps mudam; retorna stop.

## Eventos

- **Mapa de eventos (`on`)** — record `{ evento: valor }`. · `on: { click, keydown }`
- **Handler** — `(event, ctx) => void` (`ctx.element` = nó cru). Em custom events pareados, o handler pode devolver o cleanup do "un-enter" (`PairedHandler`).
- **Modificador** — transformador de handler composável. · `$handle.keys('Enter')`, `.prevent`, `.debounce(300, { leading })`
- **Invocação síncrona vs assíncrona** — modificadores que atrasam (`debounce`/`throttle`) invocam o handler de forma **assíncrona** no trailing/`maxWait` (o retorno morre no `setTimeout`); só invocações **síncronas** (leading) propagam o retorno do handler (cleanup do "un-enter").
- **`$handle` (namespace)** — combina handler + modificadores; `$handlers({...})` nomeia/reusa. · `$handle(fn, ...mods)`
- **Custom event** — evento que **dispara** e é escutado no `on` (fonte registrada via `$registerCustomEvent`). O objeto no fim da tupla são as **opções da fonte** (canal de opções, tipado por evento via `MQCustomEventOptions`; quem decide os listeners DOM é a fonte). · `clickOutside`, `hover`
- **Custom event pareado (enter↔leave)** — custom event com **entrada e saída**: o handler devolve o **cleanup do "un-enter"** e a fonte o roda na saída (mesmo idioma do `$onMounted(() => () => cleanup)`). · `hover`, `focusOutside`, `interactOutside`
- **Fronteira on/use** — regra: *dispara e chama handler* → `on`; *só se comporta* → `use`.

## Behaviors

- **Behavior (`use`)** — comportamento pós-criação que **não dispara**; um **composable vinculado a um elemento** (recebe `ctx`). Registra teardown no escopo (retornando cleanup **ou** via `registerCleanup`). Ver *Hooks vs. behavior* no Ciclo de vida. · `use: $model(sig)`, `$show(cond)`

## Estilo / CSS — `mini-q/style` (entry opcional, namespace de entidade)

Fora do core de DOM: `import { style } from 'mini-q/style'`. Filosofia: **caixas maiores compostas por
caixas menores.** Hierarquia semântica (convenção): **Layout** ⊃ **Componente** ⊃ **Elemento visual**.

- **`style` (namespace)** — `style(nome, config)` define entidade e injeta; `style.css(sel, obj)` = escape hatch global. · `style('category-card', {...})`
- **StyleHandle** — o retorno de `style(nome, config)`: **callable** (`field({ size, invalid })` → string de classes) com as **partes promovidas** ao próprio objeto (`field.input`), mais `self`/`flags`/`variants`/`keyframes`/`slots`. `class`/`$class`/`$cx` **aceitam o handle** (chamam-no; brand `STYLE_HANDLE` fica no core).
- **Bloco** — a entidade raiz; nome `escopo-elemento`. · `category-card`
- **Tipos de bloco (semântica, convenção):**
  - **Layout** — estrutura/posição/espaçamento (`header`, `grid`, `sidebar`); contém outros blocos.
  - **Componente** — pedaço reutilizável e com comportamento (`category-card`); cuida do conteúdo interno.
  - **Elemento visual** — parte interna nomeada de um bloco (as partes).
- **self** — a classe da própria caixa. · `card.self` → `'category-card'`; parte: `card.title.self` → `'-category-card-title'`
- **Parte** — descendente da entidade (sob `parts`, recursivo), **promovida ao handle**: classe = **nome completo do bloco** + chave em toda profundidade (`-category-card-title`), combinador descendente automático. · `card.title`, `card.content.description`
- **Flag** — estado booleano **independente** como classe composta `.bloco.--is-{nome}` (token em `.flags`). O `is-` distingue de variante no DevTools. · `card.flags.featured` → `'--is-featured'`
- **Variante** — grupo **exclusivo** como classe composta `.bloco.--{grupo}-{valor}` (token em `.variants`). · `btn.variants.size.sm` → `'--size-sm'`; `defaults` = valor default por grupo
- **Slot** — bloco **estrangeiro** hospedado (`slots: { control: bloco }`, token em `.slots`); flags/variants o miram por `slots: { control: {…} }` → `.bloco.--is-flag .hospedado`. É a composição de 1ª classe (vs. CSS cru). Distingue-se de **parte** (descendente que a entidade **possui**).
- **Override em flag/variante** — corpo unificado: decls + `parts: { p: {…} }` e/ou `slots: { s: {…} }`. `flags.x.parts.p` → `.bloco.--is-x .-bloco-p`.
- **Keyframe escopado** — animação (na árvore, chave `keyframes`) nomeada `bloco-nome`. · `card.keyframes.pulse` → `'category-card-pulse'`
- **Decls no topo** — escalares/`&`/`@` no topo do config = declarações do bloco (**não há `base`**). Chaves reservadas: `parts`/`flags`/`variants`/`defaults`/`slots`/`keyframes`. Chave-objeto inesperada no topo → `warn` (não vira parte silenciosa); parte com nome reservado (`self`/`flags`/…) → `warn`.
- **Deprecados** — `parts(nome, tree)` → `style(nome, { parts: tree })`; `css` → `style.css` (alias por 1 versão).

## Breakpoints — `mini-q/style`

- **Breakpoint** — media nomeada num registro compartilhado. · `config({ breakpoints: { md: 768 } })`
- **`@nome` (CSS)** — chave de media na árvore de estilo, resolvida pelo registro. · `{ '@md': {...} }`
- **`media` (reativo)** — signal booleano de uma media (matchMedia + cleanup). · `const md = media('md')`

## Ciclo de vida / infra

- **`$mount(target, App) → unmount`** — injeta a árvore num escopo raiz; `unmount` limpa tudo. Idioma: passar **builder/componente**, não árvore pronta.
- **`$onMounted(fn)`** — roda `fn` **agora** (o componente acabou de construir, já no escopo). Se `fn` retornar função, ela vira teardown (idioma "monta um recurso e devolve sua limpeza"). · `$onMounted(() => { const id = setInterval(t); return () => clearInterval(id); })`
- **`$onUnmounted(fn)`** — registra um teardown no escopo ativo (roda no `unmount`/remoção do item). · `$onUnmounted(() => …)`
- **Hooks vs. behavior** — `$onMounted`/`$onUnmounted` são o **composable sem elemento**; um **behavior** (`use`) é o mesmo conceito **vinculado a um elemento** (recebe `ctx.element`). Fora de escopo os **hooks públicos avisam** (`warn`); o teardown **interno** de behaviors degrada em silêncio (mesmo caminho do `bind`).
- **Timing** — "mounted" = o componente **construiu** (elemento criado), **não** necessariamente conectado ao `document` (a lib não tem fase de commit pós-attach). Limitação conhecida.
- **Adapter** — ver Reatividade.
