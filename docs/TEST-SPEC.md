# mini-q — Spec de testes (derivada das docs)

> **Origem:** este documento é a **fonte de verdade dos testes** — derivado **exclusivamente** das
> docs (`USAGE.md`, `STYLE.md`, `ARCHITECTURE.md`, `GLOSSARY.md`, `DX-MANIFESTO.md` e as proposals
> **implementadas**: `model.md`, `teleport.md`, `style-namespace.md`). Não foi consultado nenhum teste
> existente: a ideia é **validar depois** se a suíte atual cobre bem o que as docs propõem.
>
> **Escopo:** só o **implementado**. Propostas/pendências (style-scope, ssg, useForm, a11y behaviors,
> segundo adapter, delegation, tokens) ficam de fora — ver [BACKLOG.md](BACKLOG.md).
>
> **Convenção de IDs:** `ÁREA.seção.nº` (ex.: `EVT.3.2`). Cada caso tem **cenário** + **critérios de
> aceite** (asserts concretos). Status: `✅` = implementado (esperado na suíte) · `⚠️` = débito
> conhecido nas docs (o teste deve refletir o comportamento documentado, não o ideal).

---

## 1. Setup / adapter — `$useSignal` (USAGE §1, ARCHITECTURE §4)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| SET.1.1 | Instalar o adapter com `$useSignal(preact)` antes de montar | `$mount` funciona; sem adapter, montar lança/avisa com mensagem acionável |
| SET.1.2 | Contrato mínimo `{ isSignal, getValue, effect }` | `isSignal` reconhece signal da lib; `getValue` lê `.value` dentro de effect (cria dep); `effect` roda + re-roda em mudança e retorna `stop` |
| SET.1.3 | Opcional `untrack?` | `untrack(fn)` roda `fn` sem criar dependência; sem `untrack` no adapter, degrada (roda normal) |
| SET.1.4 | Opcional `signal?` | `signal(i)` cria signal gravável (ex.: `media`); **sem** `signal` no adapter, a feature que precisa dele **lança** |
| SET.1.5 | Opcional `setValue?` | `setValue(s, v)` escreve two-way; sem ele, fallback `s.value = v` |
| SET.1.6 | Derivação inline `() => expr` funciona com qualquer adapter | `{ $disabled: () => !valido.value }` atualiza sem depender de `signal?` do adapter |

## 2. Elementos — `$.tag` (USAGE §2, ARCHITECTURE §3)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| ELM.2.1 | `$.tag(props?, ...children)` → `Element` | `$.div({ id: 'box', class: 'card' }, 'texto', $.span('filho'))` produz o nó esperado; tag ∈ HTML (menos `style`) |
| ELM.2.2 | `props` opcional — 1º arg não-objeto vira filho | `$.div('texto')`, `$.div([$.span('a')])`, `$.span(() => count.value)` funcionam sem `{}` |
| ELM.2.3 | Children aceitam string/number/Node/array/`[Comp, props]`/fonte reativa | cada tipo é normalizado corretamente (primitivo → texto, Node → direto, array → recursivo) |
| ELM.2.4 | `boolean`/`null`/`undefined` como filho são ignorados | condicional inline não deixa nó nem texto vazio |
| ELM.2.5 | **Aridade desambigua** — 0-param = filho reativo; ≥1 param = setup | `$.span(() => x)` é filho reativo; `$.div((props, ctx) => [...])` é componente; função 0-param **nunca** vira componente |
| ELM.2.6 | Prop reativa com prefixo `$` | `{ $disabled: on }` (signal) e `{ $disabled: () => expr }` (função) atualizam o atributo quando o valor muda |
| ELM.2.7 | Valor cru (sem `$`) = estático, aplicado uma vez | `{ disabled: true }` não reage a mudanças posteriores |
| ELM.2.8 | Filho reativo (função/signal na posição de filho) | `$.span(() => \`Total: ${total.value}\`)` e `$.p({}, count)` atualizam o texto |
| ELM.2.9 | `class`: string \| array \| record | `'a b'`, `['a', ativo && 'ativo', { erro: temErro }]` e `$class: () => ...` resolvem para a string de classes |
| ELM.2.10 | `style`: string ou objeto camelCase | `'color: red'` e `{ color: 'red', fontWeight: 700 }` aplicam; `$style: () => ...` reativo |
| ELM.2.11 | `data`/`$data` | `{ data: { foo: 'x', bar: true } }` → `data-foo="x" data-bar="true"`; `$data` com valores reativos por chave |
| ELM.2.12 | `$cx(...)` compõe classes condicionais | `$cx('a', x && 'b', ['c', null])` → `'a b c'`; aceita `StyleHandle` direto (é chamado) |
| ELM.2.13 | Atributo estático: propriedade se existir no elemento, senão `setAttribute` | `value`/`disabled` viram propriedade; `data-*`/`aria-*` viram atributo |

## 3. Eventos — `on: {}` + `$handle` + custom (USAGE §3, ARCHITECTURE §12)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| EVT.3.1 | `on: { click: (e, ctx) => ... }` | handler recebe `(event, ctx)`; `ctx.element` é o nó cru |
| EVT.3.2 | Modificadores via `$handle` | `$handle.keys('Enter')`, `.alt`, `.prevent`, `.self`, `.debounce(300)`, `.throttle(100)` filtram/transformam o evento |
| EVT.3.3 | Objeto simples no fim do array vira `AddEventListenerOptions` | `{ once: true }`/`{ capture: true }`/`{ passive: true }` aplicados ao listener |
| EVT.3.4 | **Ordem do array = ordem de execução** | `prevent` **antes** de `debounce` age em todo evento (na hora); `prevent` **depois** só age na invocação adiada |
| EVT.3.5 | `debounce(ms, { leading?, trailing?, maxWait? })` estilo lodash | `leading` dispara na 1ª chamada da rajada; `trailing` (default `true`) dispara a última após `ms`; `maxWait` limita o atraso máximo |
| EVT.3.6 | `throttle(ms, { leading?, trailing? })` | default `{ leading: true, trailing: true }`; `{ trailing: false }` = só leading |
| EVT.3.7 | **Retorno do handler** — síncrono vs assíncrono | invocação **leading** (síncrona) propaga o retorno; invocação **trailing/maxWait** (assíncrona) não — o retorno morre no `setTimeout` |
| EVT.3.8 | `$handle.handlers({...})` p/ handlers nomeados/reusáveis | `h.enviar` liga o handler com seus modificadores; `$handle(fn, ...mods)` equivale à forma array |
| EVT.3.9 | Custom events já vêm: `clickOutside`, `focusOutside`, `interactOutside`, `hover` | disparam no mesmo `on`; `clickOutside` dispara ao clicar fora do elemento |
| EVT.3.10 | **Eventos pareados (enter↔leave)** — handler devolve cleanup do "un-enter" | `hover`: `pointerenter` → handler; `pointerleave` → cleanup retornado; sem cleanup → nada no leave |
| EVT.3.11 | `hover` com opções `{ delayIn, delayOut, touchable, holdDelay }` | atrasos de entrada/saída; no touch, hold-to-hover (segurar = hover, soltar = sair; cancela no scroll; suprime `contextmenu`/seleção durante o hold); handler recebe `PointerEvent` |
| EVT.3.12 | `focusOutside` | enter quando o foco **sai** do alvo (via `relatedTarget`); leave quando volta |
| EVT.3.13 | `interactOutside` | enter no 1º `pointerdown` **fora**; leave num `pointerdown` **dentro** |
| EVT.3.14 | **Canal de opções** — objeto no fim da tupla de custom event = opções da fonte | `[handler, { touchable: true, delayIn: 100, delayOut: 250 }]`; tipado via `MQCustomEventOptions` |
| EVT.3.15 | `$registerCustomEvent(name, source)` | `(target, emit, opts) => cleanup`; `emit` devolve o retorno do handler (pareado: cleanup do un-enter); cleanup remove o listener |
| EVT.3.16 | `$on(ctx, nome, valor)` — primitivo de eventos | mesmo caminho do `on:{}` (tupla, roteamento nativo\|custom); auto-registra teardown no escopo ativo; **retorna** cleanup idempotente |

## 4. Behaviors — `use` (USAGE §4, ARCHITECTURE §12)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| BEH.4.1 | Behavior `(ctx) => cleanup?` roda pós-criação | `ctx.element` é o nó; cleanup roda no unmount |
| BEH.4.2 | `use` aceita vários behaviors | `use: [$show(v), meuBehavior]` roda todos |
| BEH.4.3 | `$model` — modo **text** | `input[type=text]`/`textarea`/`select` simples com signal `string`/`number`: DOM→signal via `$on`, DOM←signal via `bind`, escrita via `setValue` |
| BEH.4.4 | `$model` — modo **checkbox booleano** | signal `boolean` ↔ `.checked` |
| BEH.4.5 | `$model` — modo **checkbox grupo** | signal `string[]`; alterna `el.value` no array; inicializar como `[]` denuncia o modo |
| BEH.4.6 | `$model` — modo **radio** | signal `string`/`number`; marca se `el.value === signal`; selecionar escreve |
| BEH.4.7 | `$model` — modo **select multiple** | signal `string[]`; `value` das opções selecionadas |
| BEH.4.8 | `$model` — `lazy: true` | sincroniza no `change`, não no `input` (só modo string) |
| BEH.4.9 | `$model` — `number: true` | `'3.5'` → `3.5`; inválido mantém string |
| BEH.4.10 | `$model` — `trim: true` | remove espaços ao escrever |
| BEH.4.11 | `$model` — `trim` + `number` juntos | ordem: **trim → number** (igual Vue) |
| BEH.4.12 | `$model` — `trueValue`/`falseValue` | checkbox booleano grava o valor de domínio quando marcado/desmarcado; reflete de volta; **ignorados** em grupo/radio/select |
| BEH.4.13 | `$model` — regressão v1 | `$model(signal)` sem options = comportamento v1 (sem cast, sem lazy) |
| BEH.4.14 | `$show(cond)` | alterna `hidden` conforme a condição **sem desmontar** (preserva estado) |
| BEH.4.15 | `$useTeleport(target)` — alvo por seletor/elemento | move o `ctx.element` para o alvo; **não** anexa como filho do pai |
| BEH.4.16 | `$useTeleport` — alvo reativo `() => Element` | reage a mudanças e **move o nó vivo** para o novo alvo (sem desmontar/remontar) |
| BEH.4.17 | `$useTeleport` — cleanup | ao desmontar o escopo, o nó é removido do alvo; com `$when` abrindo/fechando, o nó sai do alvo no fechamento (regressão do bug de cleanup) |

## 5. Componentes + listas keyed (USAGE §5, ARCHITECTURE §5)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| CMP.5.1 | **Closure (canônica)** — função que retorna elemento | `Row({ title: 'abc' })` → `<li>`; props tipadas |
| CMP.5.2 | **Setup (açúcar)** — `$.tag(setupFn)` | raiz é a tag; setup recebe `(props, ctx)` e retorna filhos; precisa de **≥1 param** |
| CMP.5.3 | Estado local no closure/setup | sobrevive entre renders; cleanup no unmount |
| CMP.5.4 | `$each(fonte, Comp, keyFn)` — fonte reativa | signal, função derivada, array cru ou `readonly`; `Comp` recebe o item como props |
| CMP.5.5 | `$each` — `keyFn` obrigatória | reuso/reordenação sem recriar; `key` é **reservada** (não é dado; `keyFn` prevalece) |
| CMP.5.6 | `$each` — filtro via fonte derivada | `$each(() => itens.value.filter(t => t.on), Row, t => t.id)` |
| CMP.5.7 | Tupla crua `[Component, props]` como filho reativo | renderização lazy e cacheável; branching por item; props **não conferidas em tipo** |
| CMP.5.8 | Reuso/reordenação keyed | nós com a mesma `key` são reutilizados e reordenados (não recriados); removidos rodam cleanup |
| CMP.5.9 | Foco preservado no reorder | nó reusado que estava focado e precisou mover **restaura o foco** (bug 2) |
| CMP.5.10 | Construção da subárvore destrastreada | signals lidos ao montar um item **não** viram dependência da região (não remonta a lista inteira) (bug 1/1b) |

## 6. Control-flow (USAGE §6, ARCHITECTURE §6)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| CTL.6.1 | `$when(cond, then, else?)` | monta/desmonta o ramo; cada alternância **recria** o ramo (estado fresco por design) |
| CTL.6.2 | `$when` — só a cond é rastreada | ramos construídos com `untrack`; signals lidos ao montar o ramo não viram dep da região |
| CTL.6.3 | `$match(...cases)` + `$else` | `[cond, view]` em sequência; 1ª cond truthy vence; `View` solta no fim = fallback; `$else` = catch-all |
| CTL.6.4 | `$switch(selector, cases, fallback?)` | `String(selector)` indexa o record; sem a chave, usa o `fallback` (ou `null`) |

## 7. Lifecycle — `$mount` + hooks (USAGE §7, ARCHITECTURE §2)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| LIF.7.1 | `$mount(target, builder, props?)` | `target` = seletor ou `Element`; `builder` = node, componente, tupla `[Component, props]` ou função |
| LIF.7.2 | `unmount()` | roda **todos** os cleanups (effects, listeners, custom events, behaviors) e remove os nós |
| LIF.7.3 | **Builder, não árvore pronta** | `$mount('#app', App)` ✅; `$mount('#app', arvorePronta)` ⚠️ renderiza mas effects vazam (débito conhecido — teste documenta o comportamento) |
| LIF.7.4 | `$onMounted(fn)` | roda **agora** (construiu); retorno vira teardown ("monta e devolve a limpeza") |
| LIF.7.5 | `$onUnmounted(fn)` | teardown no escopo ativo; roda no unmount/remoção do item |
| LIF.7.6 | Hooks fora de escopo **warn** | `$onUnmounted` no global avisa (falha que fala) |
| LIF.7.7 | Timing | "mounted" = construiu (elemento criado), não necessariamente conectado ao `document` |
| LIF.7.8 | Escopos aninhados | regiões/componentes aninhados abrem sub-escopos; `unmount` da raiz cascateia; cleanups em **ordem inversa**; erro num cleanup não aborta os demais |

## 8. Baixo nível (USAGE §9, ARCHITECTURE §4)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| LOW.8.1 | `$append(parent, child)` | injeta filho renderizável com a normalização do `$.tag` (primitivo/Node/array/`[Comp,props]`/reativo) |
| LOW.8.2 | `createTag(name, ...)` | factory crua de elemento por trás do `$` |
| LOW.8.3 | `compose(handler, mods)` | aplica modificadores a um handler; ordem do array = ordem de execução |
| LOW.8.4 | `getCustomEvent(name)` | resolve a fonte custom registrada (o que `$registerCustomEvent` registra) |
| LOW.8.5 | `applyUse(ctx, behaviors)` | roda behaviors (miolo do `use`) |
| LOW.8.6 | `isSignal(v)` / `isReactive(v)` | predicados: signal do adapter? função ou signal? |
| LOW.8.7 | `read(bindable)` | valor atual de um `Bindable` (signal \| função \| cru) |
| LOW.8.8 | `bind(source, apply)` | fonte reativa → roda `apply` dentro de `effect` + registra o stop no escopo; cru → aplica 1x |
| LOW.8.9 | `untrack(fn)` | roda `fn` sem criar dependências (usa `adapter.untrack` se houver) |
| LOW.8.10 | `setValue(signal, value)` | escreve two-way (`adapter.setValue` ou fallback `signal.value = value`) |

## 9. Style engine — `mini-q/style` (STYLE.md, ARCHITECTURE §7)

| ID | Cenário | Critérios de aceite |
|---|---|---|
| STY.9.1 | `style(name, config)` → `StyleHandle` | define bloco, injeta regras num `<style id="mq-styles">`, devolve handle callable e único |
| STY.9.2 | Decls no topo do config (sem `base`) | `.bloco { … }`; camelCase; números viram `px` (exceto unitless: `opacity`/`zIndex`/`lineHeight`); aninhamento `&` (`&:hover`, `& .filho`); um nível de `@media`/`@supports` |
| STY.9.3 | **`$nome` parte (filho direto, recursivo)** | `$title` declara parte; `.bloco > .-bloco-parte { … }` (**combinador `>`**); nome = completo do bloco + chave em **toda profundidade**; mover parte de nível não renomeia |
| STY.9.4 | **`$:` ficha técnica** | `$: { hosts/defaults/flags/variants/keyframes/scope }`; não gera regra; topo carrega só CSS incondicional |
| STY.9.5 | `flags` | `.bloco.--is-flag { … }`; booleanas independentes |
| STY.9.6 | `variants` + `defaults` | `.bloco.--grupo-valor { … }`; grupos exclusivos; `defaults` = valor default por grupo |
| STY.9.7 | **`hosts`** | bloco estrangeiro hospedado (`$: { hosts: { control: bloco } }`); mirado por flags/variants → `.bloco.--is-flag .hospedado`; distingue-se de parte |
| STY.9.8 | Override em flag/variante | corpo unificado: decls + `$parte` (filho direto) e/ou `hosts: { s: {…} }` |
| STY.9.9 | `keyframes` escopado | `@keyframes bloco-nome { … }`; exposto em `card.keyframes.pulse` |
| STY.9.10 | StyleHandle callable | `field({ size: 'sm', invalid: true })` → `'field --size-sm --is-invalid'`; `field.self` → `'field'`; `field.label.self` → `'-field-label'`; `field.flags.invalid` → `'--is-invalid'`; `field.variants.size.sm` → `'--size-sm'`; `field.hosts.control` → `'input'` |
| STY.9.11 | Handle aceito em `class`/`$class`/`$cx` | `class: field.label` (parte) e `class: card` (bloco simples) chamam o handle; `$class: () => field({ invalid: err.value })` |
| STY.9.12 | Nomes reservados de parte | `self`/`flags`/`variants`/`keyframes`/`hosts`/`slots` → `warn` |
| STY.9.13 | `config({ breakpoints })` | registra medias nomeadas; número = `(min-width: Npx)`; string numérica (`'768'`) ou query crua (`'(max-width: 767px)'`) também valem |
| STY.9.14 | `@nome`/`@número` no CSS | `{ '@md': {...} }` → `@media (min-width: 768px) { … }`; chave resolvida pelo registro; número cru também aceito |
| STY.9.15 | `media(nome\|query)` → `signal<boolean>` | via `matchMedia`, com cleanup registrado no escopo; `media('md')`, `media(768)`, `media('(min-width: 768px)')`; sem `matchMedia` (SSR/teste sem mock) → signal estático `false`; requer adapter com `signal?` (senão lança) |
| STY.9.16 | `css(sel, obj)` global | seletor cru → regra global; `style.css(sel, obj)` é a mesma função |
| STY.9.17 | Warnings | bloco registrado mais de uma vez → warn; chave-objeto inesperada no topo → warn (não vira parte silenciosa); parte com nome reservado → warn; host mirado mas não declarado em `hosts` → warn; uso de `parts:`/`>nome`/`slots:`/topo-flags → warn de depreciação |
| STY.9.18 | `parts(name, tree)` (deprecado) | `parts(nome, tree)` ≡ `style(nome, { $nome: tree })` (combinador descendente; avisa) |
| STY.9.19 | **Refs `$` globais (nivelamento) + composto** | `'& > $dot'` no root resolve o neto (declarado em qualquer nível); `'& $muted'` = descendente explícito; `'$foo > $bar + $qux'` compõe refs em seletor; classes depth-independent |

## 10. Proposals implementadas (referência cruzada)

| Proposal | Casos cobertos por |
|---|---|
| `model.md` (implementada 2026-09-10) | §4.3–4.13 (5 modos + options + regressão v1) |
| `teleport.md` (implementada 2026-09-10) | §4.15–4.17 (alvo, alvo reativo, cleanup com `$when`) |
| `style-namespace.md` (implementada 2026-09-06) | §9.1–9.12 (namespace, partes promovidas, flags×variants, slots) |

---

## Matriz de cobertura

| Área | Casos | Doc de origem | Status |
|---|---|---|---|
| Setup / adapter | 6 | USAGE §1, ARCHITECTURE §4 | ✅ implementado |
| Elementos | 13 | USAGE §2, ARCHITECTURE §3 | ✅ implementado |
| Eventos | 16 | USAGE §3, ARCHITECTURE §12 | ✅ implementado |
| Behaviors | 17 | USAGE §4, ARCHITECTURE §12 | ✅ implementado |
| Componentes + `$each` | 10 | USAGE §5, ARCHITECTURE §5 | ✅ implementado |
| Control-flow | 4 | USAGE §6, ARCHITECTURE §6 | ✅ implementado |
| Lifecycle | 8 | USAGE §7, ARCHITECTURE §2 | ✅ implementado |
| Baixo nível | 10 | USAGE §9, ARCHITECTURE §4 | ✅ implementado |
| Style engine | 18 | STYLE.md, ARCHITECTURE §7 | ✅ implementado |
| Proposals implementadas | 3 (refs) | model.md, teleport.md, style-namespace.md | ✅ implementado |
| **Total** | **105** | — | — |

> **Fora do escopo (não implementado):** style-scope (`@scope`/`prefixed`), ssg/SSR, `useForm`/`useField`,
> a11y behaviors (`trap-focus`, `roving-index`, `inert`, `overlay`), segundo adapter + teste de
> agnosticidade, delegation/dedup de eventos, tokens/variáveis de design, prefixo/namespace
> configurável, GC de regras, compound variants, extração build-time. Ver [BACKLOG.md](BACKLOG.md).

---

# Auditoria de cobertura (2026-09-10)

Comparação da spec contra a suíte atual (`src/**/*.test.ts` + type-tests `*.types.ts`). Legenda:
**✅** coberto · **⚠️** parcial (comportamento principal coberto, mas um critério da spec não) ·
**❌** não coberto. Os gaps são os candidatos a novos testes.

## 1. Setup / adapter

| ID | Status | Onde / observação |
|---|---|---|
| SET.1.1 | ✅ | `mount.test.ts` (montar sem adapter lança `/Nenhum adapter/`) |
| SET.1.2 | ✅ | `reactive.test.ts` (bind: effect re-roda, stop registrado) |
| SET.1.3 | ✅ | `reactive.test.ts` (untrack com/sem adapter) |
| SET.1.4 | ✅ | `reactive.test.ts` (createSignal lança sem adapter / sem `signal`) |
| SET.1.5 | ✅ | `reactive.test.ts` (setValue com/fallback) |
| SET.1.6 | ✅ | `index.test.ts` (`$class: () => ...`), `reactive.test.ts` (bind função) |

## 2. Elementos

| ID | Status | Onde / observação |
|---|---|---|
| ELM.2.1 | ✅ | `index.test.ts` |
| ELM.2.2 | ✅ | `children.test.ts` (createTag sem props) |
| ELM.2.3 | ✅ | `children.test.ts`, `nodes.test.ts` (toNodes) |
| ELM.2.4 | ✅ | `children.test.ts` |
| ELM.2.5 | ✅ | `children.test.ts` + `sugar.types.ts` |
| ELM.2.6 | ✅ | `index.test.ts` ($disabled/$class/$data) |
| ELM.2.7 | ✅ | `props.test.ts` (prop cru não reage; não vira dep de effect) |
| ELM.2.8 | ✅ | `index.test.ts`, `children.test.ts` |
| ELM.2.9 | ✅ | `index.test.ts`, `nodes.test.ts` (resolveClass) |
| ELM.2.10 | ✅ | `props.test.ts` |
| ELM.2.11 | ✅ | `props.test.ts`, `index.test.ts` |
| ELM.2.12 | ✅ | `index.test.ts`, `nodes.test.ts` (cx) |
| ELM.2.13 | ✅ | `props.test.ts` (foo → setAttribute; key ignorada; false/null removem) |

## 3. Eventos

| ID | Status | Onde / observação |
|---|---|---|
| EVT.3.1 | ✅ | `on.test.ts` |
| EVT.3.2 | ✅ | `handle.test.ts` |
| EVT.3.3 | ✅ | `on.test.ts`, `apply.test.ts` |
| EVT.3.4 | ✅ | ordem genérica (`handle.test.ts` compose) + `prevent` antes/depois de `debounce` |
| EVT.3.5 | ✅ | `handle.test.ts` (trailing/leading/maxWait) |
| EVT.3.6 | ✅ | `handle.test.ts` |
| EVT.3.7 | ✅ | leading propaga retorno; trailing/maxWait NÃO propagam (debounce + throttle) |
| EVT.3.8 | ✅ | `handle.test.ts` |
| EVT.3.9 | ✅ | `custom.test.ts`, `on.test.ts` |
| EVT.3.10 | ✅ | `custom.test.ts`, `apply.test.ts` |
| EVT.3.11 | ✅ | `custom.test.ts` (delayIn/delayOut/touchable/holdDelay/scroll/contextmenu/selectstart) |
| EVT.3.12 | ✅ | `custom.test.ts` |
| EVT.3.13 | ✅ | `custom.test.ts` |
| EVT.3.14 | ✅ | `on.test.ts`, `apply.test.ts`, `on.types.ts` |
| EVT.3.15 | ✅ | `custom.test.ts`, `on.test.ts` |
| EVT.3.16 | ✅ | `on.test.ts` (auto-cleanup, retorno idempotente, degrada fora de escopo) |

## 4. Behaviors

| ID | Status | Onde / observação |
|---|---|---|
| BEH.4.1 | ✅ | `region.test.ts` (cleanup de use ao remover item) |
| BEH.4.2 | ✅ | `teleport.compose.test.ts` (`use: [teleport, show]`) |
| BEH.4.3–4.7 | ✅ | `behaviors.test.ts` (5 modos) |
| BEH.4.8–4.11 | ✅ | `behaviors.test.ts` (lazy/number/trim/ordem) |
| BEH.4.12 | ✅ | `behaviors.test.ts` (trueValue/falseValue, incl. numéricos) |
| BEH.4.13 | ✅ | `behaviors.test.ts` (sem options = v1) |
| BEH.4.14 | ✅ | `index.test.ts`, `teleport.compose.test.ts` |
| BEH.4.15 | ✅ | `teleport.target.test.ts` (seletor/elemento/erro) |
| BEH.4.16 | ✅ | `teleport.reactive.test.ts` (move nó vivo, identidade preservada) |
| BEH.4.17 | ✅ | `teleport.lifecycle.test.ts` ($when/$match/$each + unmount) |

## 5. Componentes + `$each`

| ID | Status | Onde / observação |
|---|---|---|
| CMP.5.1 | ✅ | `index.test.ts` |
| CMP.5.2 | ✅ | `index.test.ts`, `children.test.ts` |
| CMP.5.3 | ✅ | `control.test.ts` (estado fresco), `index.test.ts` (setup counter) |
| CMP.5.4 | ✅ | `region.test.ts` |
| CMP.5.5 | ✅ | `region.test.ts` + `each.types.ts` (key reservada) |
| CMP.5.6 | ✅ | `region.test.ts` |
| CMP.5.7 | ✅ | `children.test.ts`, `index.test.ts` |
| CMP.5.8 | ✅ | `region.test.ts`, `index.test.ts` |
| CMP.5.9 | ✅ | `region.test.ts`, `index.test.ts` (E5) |
| CMP.5.10 | ✅ | `region.test.ts` (bug 1/1b) |

## 6. Control-flow

| ID | Status | Onde / observação |
|---|---|---|
| CTL.6.1 | ✅ | `control.test.ts` (estado fresco) |
| CTL.6.2 | ✅ | `region.test.ts`, `control.test.ts` |
| CTL.6.3 | ✅ | `control.test.ts` |
| CTL.6.4 | ✅ | `control.test.ts` (String(selector), fallback) |

## 7. Lifecycle

| ID | Status | Onde / observação |
|---|---|---|
| LIF.7.1 | ✅ | `index.test.ts`, `pocketfin.test.ts` |
| LIF.7.2 | ✅ | `index.test.ts`, `lifecycle.test.ts` |
| LIF.7.3 | ✅ | `mount.test.ts` (árvore pronta: renderiza, mas effects vazam no unmount — documenta o débito) |
| LIF.7.4 | ✅ | `index.test.ts`, `lifecycle.test.ts` |
| LIF.7.5 | ✅ | `index.test.ts`, `lifecycle.test.ts` |
| LIF.7.6 | ✅ | `lifecycle.test.ts` (warn fora de escopo) |
| LIF.7.7 | ✅ | `mount.test.ts` (onMounted roda no build, antes de conectar ao document) |
| LIF.7.8 | ✅ | `lifecycle.test.ts` (ordem inversa, erro isolado, aninhamento), `region.test.ts` |

## 8. Baixo nível

| ID | Status | Onde / observação |
|---|---|---|
| LOW.8.1 | ✅ | `append.test.ts` (primitivo/Node/array/tupla/reativo/nullish) |
| LOW.8.2 | ✅ | `children.test.ts` (createTag sem props) |
| LOW.8.3 | ✅ | `handle.test.ts` (compose) |
| LOW.8.4 | ✅ | `custom.test.ts`, `on.test.ts` |
| LOW.8.5 | ✅ | `applyUse.test.ts` (cleanup no escopo, array em ordem, sem retorno, fora de escopo) |
| LOW.8.6 | ✅ | `reactive.test.ts` |
| LOW.8.7 | ✅ | `reactive.test.ts` |
| LOW.8.8 | ✅ | `reactive.test.ts` |
| LOW.8.9 | ✅ | `reactive.test.ts` |
| LOW.8.10 | ✅ | `reactive.test.ts` |

## 9. Style engine

| ID | Status | Onde / observação |
|---|---|---|
| STY.9.1 | ✅ | `index.test.ts`, `emit.test.ts` |
| STY.9.2 | ✅ | `emit.test.ts` (px/unitless/`&`/`@media`/`@supports`) |
| STY.9.3 | ✅ | `emit.test.ts`, `handle.test.ts` |
| STY.9.4 | ✅ | `emit.test.ts` (atalho `>nome`, mistura, conflito) |
| STY.9.5 | ✅ | `emit.test.ts`, `variants.test.ts` |
| STY.9.6 | ✅ | `variants.test.ts` |
| STY.9.7 | ✅ | `slots.test.ts` (handle e string crua) |
| STY.9.8 | ✅ | `emit.test.ts`, `variants.test.ts` |
| STY.9.9 | ✅ | `emit.test.ts`, `handle.test.ts` |
| STY.9.10 | ✅ | `handle.test.ts`, `variants.test.ts` |
| STY.9.11 | ✅ | `handle.test.ts`, `nodes.test.ts` |
| STY.9.12 | ✅ | `warns.test.ts` |
| STY.9.13 | ✅ | `emit.test.ts`, `media.test.ts` |
| STY.9.14 | ✅ | `emit.test.ts` |
| STY.9.15 | ✅ | `media.test.ts` (matchMedia, cleanup, sem matchMedia) |
| STY.9.16 | ✅ | `emit.test.ts` |
| STY.9.17 | ✅ | `warns.test.ts`, `slots.test.ts` |
| STY.9.18 | ✅ | `emit.test.ts` (parts deprecated) |

## 10. Proposals implementadas

| Proposal | Status | Onde |
|---|---|---|
| `model.md` | ✅ | `behaviors.test.ts` |
| `teleport.md` | ✅ | `teleport.*.test.ts` (6 arquivos) |
| `style-namespace.md` | ✅ | `style/__tests__/*` |

---

## Resumo da auditoria

| Status | Qtd | Casos |
|---|---|---|
| ✅ coberto | 102 | — |
| ⚠️ parcial | 0 | — |
| ❌ não coberto | 0 | — |

**Gaps fechados (2026-09-10):**

| Gap | Teste criado |
|---|---|
| LOW.8.1 `$append` | `src/element/__tests__/append.test.ts` (6 casos: primitivo/Node/array/tupla/reativo/nullish) |
| LOW.8.5 `applyUse` | `src/__tests__/applyUse.test.ts` (4 casos: cleanup no escopo, array em ordem, sem retorno, fora de escopo) |
| LIF.7.3 `$mount` com árvore pronta | `src/mount.test.ts` (effects vazam no unmount — documenta o débito) |
| LIF.7.7 timing do `onMounted` | `src/mount.test.ts` (roda no build, antes de conectar ao document) |
| SET.1.1 montar sem adapter | `src/mount.test.ts` (lança `/Nenhum adapter/`) |
| ELM.2.7 prop cru estático | `src/element/__tests__/props.test.ts` (2 casos: não reage, não vira dep) |
| EVT.3.4 `prevent` antes/depois de `debounce` | `src/events/__tests__/handle.test.ts` (2 casos) |
| EVT.3.7 trailing/maxWait não propaga retorno | `src/events/__tests__/handle.test.ts` (3 casos: debounce trailing, maxWait, throttle trailing) |

**Suíte após o fechamento:** 279 testes verdes (30 arquivos) + typecheck limpo.
