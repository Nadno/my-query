# mini-q — Glossário

Linguagem comum dos recursos de DX. Use estes nomes nas docs, commits e conversas para consistência.
Cada termo: **nome** — definição curta · `token de código`.

---

## Núcleo (DOM / render)

- **`$` (raiz)** — o objeto único: selector `$(sel)` + factories de tag + utilitários (`$.mount`, `$.style`, `$.handle`…). · `import $ from 'mini-q'`
- **Factory de tag** — função que cria um elemento de uma tag. · `$.div(props?, ...children)`
- **Forma elemento** — chamada que devolve um `Element` agora. · `$.button({ type:'button' }, 'ok')`
- **Forma setup (componente)** — 1º arg função ⇒ define um componente cuja raiz é a tag; recebe `(props, ctx)`, retorna filhos. · `$.div<P>((props, ctx) => [...])`
- **Componente closure** — função comum que retorna um elemento. · `const Row = (t) => $.li({}, t.title)`
- **Prop reativa (`$`-prop)** — chave prefixada com `$` liga a prop a um signal/derivação. · `{ $disabled: sig }`
- **Derivação inline** — `() => expr` como valor reativo (funciona com qualquer adapter). · `{ $class: () => on.value ? 'a':'b' }`
- **Filho reativo** — signal/função na posição de filho; vira uma **região reativa**. · `$.span({}, () => n.value)`
- **Região reativa** — trecho de filhos governado por uma fonte reativa, delimitado por uma **âncora** (comment node) e reconciliado a cada mudança.
- **Âncora** — nó-marcador invisível que fixa a posição de uma região no DOM.
- **Tupla de componente** — `[Component, props]`: renderização **lazy** e **cacheável** (ideal em listas). · `[Row, { ...t, key: t.id }]`
- **Reconciliação keyed** — reuso/reordenação de nós por `key` (move só o fora de posição; preserva foco). · `key`
- **Escopo (owner)** — fronteira de lifecycle que coleta **cleanups**; aberta por `$.mount` e por cada região/componente aninhado. `unmount` roda os cleanups do escopo.
- **Cleanup** — função de desmontagem (para effects, listeners, custom events, behaviors).
- **untrack** — leitura que **não** cria dependência (constrói a subárvore de uma região/`when` sem virar dep dela).

## Reatividade

- **Adapter de reatividade** — ponte agnóstica para a lib de signal. · `$.useSignal({ isSignal, getValue, effect, untrack?, signal? })`
- **Signal** — fonte reativa com `.value`. **Bindable** — valor de `$`-prop: signal | `() => expr` | cru.
- **Effect** — reação que roda e re-roda quando deps mudam; retorna stop.

## Eventos

- **Mapa de eventos (`on`)** — record `{ evento: valor }`. · `on: { click, keydown }`
- **Handler** — `(event, ctx) => void` (`ctx.element` = nó cru).
- **Modificador** — transformador de handler composável. · `$.handle.keys('Enter')`, `.prevent`, `.debounce(300)`
- **`handle` (namespace)** — combina handler + modificadores; `$.handlers({...})` nomeia/reusa. · `handle(fn, ...mods)`
- **Custom event** — evento que **dispara** e é escutado no `on` (fonte registrada). · `clickOutside`, `hover`
- **Fronteira on/use** — regra: *dispara e chama handler* → `on`; *só se comporta* → `use`.

## Behaviors

- **Behavior (`use`)** — comportamento pós-criação que **não dispara**; recebe `ctx`, retorna cleanup. · `use: $.model(sig)`, `$.show(cond)`

## Estilo / CSS (namespace de entidade)

Filosofia: **caixas maiores compostas por caixas menores.** Hierarquia semântica (convenção, não imposta):
**Layout** ⊃ **Componente** ⊃ **Elemento visual**; e Componente pode conter Componente.

- **`style` (namespace)** — subsistema de CSS na raiz: `$.style(nome, config)` define entidade e injeta; `$.style.css(sel, obj)` = escape hatch global. · `$.style('category-card', {...})`
- **StyleHandle** — o retorno de `$.style(nome, config)`: **callable** (`field({ size })` → string de classes) que carrega `self`/`parts`/`flags`/`variants`/`keyframes`.
- **Bloco** — a entidade raiz; nome `escopo-elemento`. · `category-card`
- **Tipos de bloco (semântica, convenção):**
  - **Layout** — estrutura/posição/espaçamento (`header`, `grid`, `sidebar`); contém outros blocos.
  - **Componente** — pedaço reutilizável e com comportamento (`category-card`); cuida do conteúdo interno.
  - **Elemento visual** — parte interna nomeada de um bloco (as partes).
- **self** — a classe da própria caixa. · `card.self` → `'category-card'`; parte: `card.parts.title.self` → `'-category-card-title'`
- **Parte** — descendente da entidade (sob `parts`, recursivo): classe = **nome completo do bloco** + chave em toda profundidade (`-category-card-title`), combinador descendente automático. · `card.parts.content.parts.description`
- **Flag** — estado booleano **independente** como classe composta `.bloco.--nome` (token em `.flags`). · `card.flags.featured` → `'--featured'`
- **Variante** — grupo **exclusivo** como classe composta `.bloco.--grupo-valor` (token em `.variants`). · `btn.variants.size.sm` → `'--size-sm'`; `defaults` = valor default por grupo
- **Override de parte em flag/variante** — `flags.x.parts.p` / `variants.g.v.parts.p` emite `.bloco.--x .-bloco-p`.
- **Keyframe escopado** — animação (na árvore, chave `keyframes`) nomeada `bloco-nome`. · `card.keyframes.pulse` → `'category-card-pulse'`
- **Chaves reservadas** — `base` / `parts` / `flags` / `variants` / `defaults` / `keyframes`; escalares/`&`/`@` no topo = declarações do bloco. Chave-objeto inesperada no topo → `console.warn` (não vira parte silenciosa).
- **Deprecados** — `$.parts(nome, tree)` → `$.style(nome, { parts: tree })`; `$.css` → `$.style.css` (alias por 1 versão).

## Breakpoints

- **Breakpoint** — media nomeada num registro compartilhado. · `$.config({ breakpoints: { md: 768 } })`
- **`@nome` (CSS)** — chave de media na árvore de estilo, resolvida pelo registro. · `base: { '@md': {...} }`
- **`$.media` (reativo)** — signal booleano de uma media (matchMedia + cleanup). · `const md = $.media('md')`

## Ciclo de vida / infra

- **`$.mount(target, App) → unmount`** — injeta a árvore num escopo raiz; `unmount` limpa tudo. Idioma: passar **builder/componente**, não árvore pronta.
- **Adapter** — ver Reatividade. **Plugin/extend** — mecanismo de composição do `$` (as partes constroem as demais).
