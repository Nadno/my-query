# mini-q — Guia de uso (para humanos e IA)

`mini-q` é uma lib **sem build/JSX**: você cria DOM com funções (`$.div(...)`), a reatividade é
**granular** (por signal) e **agnóstica** (você pluga a lib de signal). **`$` é só tags** (`$.div`,
`$.p`, …); os recursos são **exports nomeados** (`$mount`, `$when`, `$model`, …) e o engine de CSS
mora no entry opcional `mini-q/style`. Este documento é a superfície **completa e atual** — se algo não
está aqui, não existe (veja [Ainda não implementado](#ainda-não-implementado) e o [BACKLOG](BACKLOG.md)).

> Para gerar código correto, siga as **[Regras de ouro](#regras-de-ouro)**.
> Para entender *por que* a API é assim, veja o **[Manifesto de DX](DX-MANIFESTO.md)**.

---

## 1. Setup

```ts
import $, { $mount, $useSignal } from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal, computed } from '@preact/signals-core';

$useSignal(preact); // instale o adapter UMA vez, antes de montar

const App = () => $.h1('Olá mini-q');
const unmount = $mount('#app', App); // monta; unmount() desfaz tudo
```

**`$` = só factories de tag**; tudo mais é importado pelos nomes: `$mount`, `$useSignal`, `$when`,
`$model`, …
O adapter é um objeto **mínimo** — qualquer lib de signal serve:

```ts
$useSignal({
  isSignal: (v) => v instanceof MinhaSignal, // reconhece um signal da lib
  getValue: (v) => v.value,                  // lê o valor (dentro de effect, cria dep)
  effect: (run) => minhaLibEffect(run),      // roda + re-roda em mudança; retorna stop
  untrack: (fn) => …,  // opcional: roda sem criar dependência (regiões/`$when`)
  signal: (i) => …,    // opcional: cria signal gravável (ex.: `media`); sem ele, lança
  setValue: (s, v) => … // opcional: escrita two-way (`$model`); sem ele, `s.value = v`
});
```

> Os opcionais `untrack?`/`signal?`/`setValue?` têm fallback embutido (ver [§9](#9-baixo-nível)) —
> `untrack` e `write` degradam; `signal` é o único que **lança** se ausente e a feature precisar.

---

## 2. Elementos

**Assinatura: `$.tag(props?, ...children)`** → `Element`, tipada por tag (tag ∈ HTML, menos `style`).

```ts
$.div({ id: 'box', class: 'card' }, 'texto', $.span('filho'));
$.button({ type: 'button' }, 'Clique');
$.ul({}, $.li('a'), $.li('b'));
```

- `props` é opcional; se o 1º argumento **não for um objeto de props**, vira filho. **Açúcar**: quando o
  1º arg é claramente um filho, o `{}` vazio pode sumir — `$.div('texto')`, `$.div([$.span('a')])`,
  `$.span(() => count.value)`.
- Atributos são chaves normais (`id`, `type`, `disabled`, `placeholder`, `href`, `value`…), tipadas por tag.
- Children aceitam: `string`, `number`, `Node`, arrays, `[Component, props]` (§5) e **fontes reativas**
  (função ou signal — abaixo). `boolean`/`null`/`undefined` como filho são ignorados (condicional inline).

> **1º argumento função — a aridade desambigua:** `() => valor` (0 params) é **filho reativo** (o açúcar
> acima); `(props, ctx) => filhos` (≥1 param) é **definição de setup** (§5). Uma função 0-param **nunca**
> vira componente.

### Reatividade (props)

Marque a prop como reativa com **prefixo `$`** na chave. O valor pode ser um **signal** ou uma
**função `() => expr`** (a função funciona com qualquer adapter):

```ts
const on = signal(false);
$.button({ $disabled: on }, 'x');                    // signal direto
$.button({ $disabled: () => !valido.value }, 'x');   // função derivada
$.input({ $value: texto });                          // qualquer atributo aceita $prefixo
```

Valor cru (sem `$`) = estático, aplicado uma vez: `$.button({ disabled: true }, 'x')`.

**Filhos reativos** (texto/valor que muda) — passe uma função ou signal na posição de filho:

```ts
$.span(() => `Total: ${total.value}`);
$.p({}, count); // signal como filho também funciona
```

### class, style, data

```ts
// class: string | array | record { classe: boolean }
$.div({ class: 'a b' });
$.div({ class: ['a', ativo && 'ativo', { erro: temErro }] });
$.div({ $class: () => (ativo.value ? 'on' : 'off') }); // reativo

// style: string ou objeto (camelCase)
$.div({ style: 'color: red' });
$.div({ style: { color: 'red', fontWeight: 700 } });
$.div({ $style: () => ({ color: cor.value }) }); // reativo

// data: cada valor pode ser estático; use $data p/ valores reativos
$.div({ data: { foo: 'x', bar: true } });        // → data-foo="x" data-bar="true"
$.div({ $data: { count: sig, ok: true } });      // count reativo, ok estático
```

**`$cx(...)`** compõe classes condicionais (clsx-like): `$cx('a', x && 'b', ['c', null])` → `'a b c'`.
Aceita `StyleHandle` direto (é chamado). O **engine completo** — blocos, partes, flags, variantes,
slots e breakpoints — fica em `mini-q/style`: **[STYLE.md](STYLE.md)**.

---

## 3. Eventos — `on: {}` + `$handle` + custom

Eventos ficam num **record `on`**. O valor é um handler, ou um array `[handler, ...modificadores, options?]`:

```ts
$.button({ on: { click: (e, ctx) => console.log('clicou', ctx.element) } }, 'x');
```

- Handler recebe **`(event, ctx)`** — `ctx.element` é o nó cru.
- **Modificadores** vêm de **`$handle`**. Um objeto simples no fim do array vira
  `AddEventListenerOptions` (`once`/`capture`/`passive`).

```ts
const { keys, alt, prevent, self, debounce } = $handle;

$.input({
  on: {
    keydown: [enviar, keys('Enter'), alt, prevent], // Enter+Alt; preventDefault
    input: [aoDigitar, debounce(300)],
    scroll: [aoRolar, $handle.throttle(100), { passive: true }],
    click: [soEu, self],                            // só se e.target === elemento
  },
});
```

> **A ordem do array é a ordem de execução**: o 1º modificador roda primeiro, o handler por último.
> Logo `prevent` **antes** de `debounce` age em todo evento (na hora); `prevent` **depois** fica
> "dentro" do adiamento — só quando o handler invoca. Fique atento: modificadores que **atrasam**
> (`debounce`/`throttle`) empurram para depois tudo que vier após eles na tupla.

`debounce`/`throttle` são estilo **lodash**:

```ts
$.input({
  on: {
    input: [aoDigitar, debounce(300, { leading: true })],       // 1ª imediata + última após 300ms
    scroll: [aoRolar, $handle.throttle(100, { trailing: false })], // só leading
    resize: [aoRedimensionar, debounce(200, { maxWait: 500 })], // no mínimo 1 a cada 500ms
  },
});
```

- **`debounce(ms, { leading?, trailing?, maxWait? })`** — `leading` dispara na 1ª chamada da rajada;
  `trailing` (default `true`) dispara a última após `ms`; `maxWait` limita o atraso máximo.
- **`throttle(ms, { leading?, trailing? })`** — default `{ leading: true, trailing: true }` (lodash);
  `{ trailing: false }` = só leading.

> ⚠️ **Retorno do handler**: invocações **síncronas** (leading) propagam o retorno do handler;
> invocações **assíncronas** (trailing/`maxWait`) não — o retorno morre no `setTimeout`. Num custom
> event pareado (`hover`…), o cleanup do "un-enter" só atravessa se a invocação for leading. Prefira
> `debounce`/`throttle` em handlers fire-and-forget.

Forma explícita e handlers nomeados/reusáveis:

```ts
const h = $handle.handlers({ enviar: [enviar, keys('Enter')], fechar });
$.form({ on: { keydown: h.enviar } });
// $handle(fn, ...mods) também existe (equivalente à forma array).
// (A raiz `$handlers(map)` é um alias — a forma canônica é `$handle.handlers`.)
```

### Custom events

Disparam como eventos normais, no mesmo `on`. Já vêm: **`clickOutside`**, **`focusOutside`**,
**`interactOutside`**, **`hover`**.

```ts
$.div({ on: { clickOutside: () => (aberto.value = false) } }, ...);
```

**Eventos pareados (enter↔leave)** — `hover`, `focusOutside` e `interactOutside` têm **entrada e saída**.
O handler devolve o **cleanup do "un-enter"** (mesmo idioma do `$onMounted(() => () => cleanup)`); a fonte
o guarda e o roda quando a saída acontece:

```ts
$.div({
  on: {
    hover: () => {
      // enter: monta o tooltip…
      return () => tooltip.remove(); // un-hover: roda no pointerleave
    },
    interactOutside: () => (aberto.value = false), // sem cleanup → nada no leave
  },
}, ...);
```

- **`hover`** — Pointer Events unificados (`pointerenter` → handler; `pointerleave` → cleanup). Com
  opções **`{ delayIn, delayOut, touchable, holdDelay }`**: atrasos de entrada/saída, e no touch
  **hold-to-hover** (segurar por `holdDelay` = hover, soltar = sair; cancela no scroll; suprime
  `contextmenu`/seleção durante o hold). O handler recebe `PointerEvent` (leia `e.pointerType`).
- **`focusOutside`** — enter quando o foco **sai** do alvo (via `relatedTarget`), leave quando volta.
- **`interactOutside`** — enter no 1º `pointerdown` **fora**, leave num `pointerdown` **dentro**
  (backdrop de popover/modal).

**Canal de opções** — o objeto no fim da tupla de um custom event são as **opções da fonte** (não
`AddEventListenerOptions` — quem decide os listeners DOM é a fonte). Tipadas por evento via
`MQCustomEventOptions` (estenda-a junto do `MQCustomEventMap`, por declaration merging):

```ts
$.div({ on: { hover: [handler, { touchable: true, delayIn: 100, delayOut: 250 }] } });
```

Registrar o seu (a fonte recebe as opções no 3º parâmetro):

```ts
$registerCustomEvent<PointerEvent, { delay?: number }>('longpress', (target, emit, opts) => {
  const onDown = (e) => {
    const t = setTimeout(() => emit(e), opts?.delay ?? 500);
    // ...
  };
  target.addEventListener('pointerdown', onDown);
  return () => target.removeEventListener('pointerdown', onDown); // cleanup
});
```

### `$on(ctx, nome, valor)` — o primitivo de eventos

Para **behaviors e setups** que precisam ligar um evento a partir de `ctx` (o `$model` usa isso): mesmo
caminho do `on: {}` (tupla `[handler, ...mods, options?]`, roteamento nativo|custom). Auto-registra o
teardown no escopo ativo e **retorna** o cleanup idempotente — para desligar antes, se quiser.

```ts
import { $on } from 'mini-q';

const useLogar = (ctx) => {
  $on(ctx, 'click', [logar, debounce(200)]); // teardown já vai no escopo
  return () => limparOutroRecurso();         // teardown próprio do behavior
};
```

> **Fronteira**: *dispara e chama handler* → **`on`**. *Só se comporta, sem "handler"* → **`use`** (§4).
> `$on` é o `on` interno dos behaviors — nada que você escreve em `on: {}` precisa dele.

---

## 4. Behaviors — `use`

Um behavior é `(ctx) => cleanup?`, roda pós-criação. Bom para o que **não dispara** (binding, foco…).

```ts
$.input({ use: $model(texto) });          // two-way binding (input/select/textarea)
$.div({ use: $show(visivel) });           // alterna `hidden` (preserva estado)
$.div({ use: [$show(v), meuBehavior] });  // vários

const meuBehavior = (ctx) => {
  const id = requestAnimationFrame(() => ctx.element.focus());
  return () => cancelAnimationFrame(id); // cleanup roda no unmount
};
```

### `$model(signal, options?)` — two-way por elementos de formulário

O modo é **auto-detectado** pelo elemento + tipo do signal (nada de configurar). Um segundo argumento
`options` estende o two-way com as opções clássicas do `v-model` do Vue:

| controle | signal | liga |
|---|---|---|
| `text`/`number`/`textarea`/`select` simples | `string`/`number` | `el.value` |
| `checkbox` | `boolean` | `.checked` |
| `checkbox` (**grupo**) | `string[]` | alterna `el.value` no array |
| `radio` (grupo de seleção única) | `string`/`number` | marca se `el.value === signal`; selecionar escreve |
| `select multiple` | `string[]` | `value` das opções selecionadas |

```ts
$.input({ use: $model(draft) });                     // text
$.input({ type: 'checkbox', use: $model(acessa) });  // booleano
$.div({},                                             // grupo
  $.label({}, $.input({ type:'checkbox', value:'a', use: $model(perms) }), 'A'),
  $.label({}, $.input({ type:'checkbox', value:'b', use: $model(perms) }), 'B'),
);
$.input({ type: 'radio', value: 'x', name: 'r', use: $model(sel) });
$.select({ multiple: true, use: $model(escolhidos) }, $.option({ value:'1' }, '1'), …);
```

Fluxo: DOM→signal via `$on`, DOM←signal via `bind` e a escrita via `setValue` (usa o adapter).
**Um checkbox-group deve inicializar o signal como `[]`** (é o que denuncia o modo).

#### `options`

```ts
$model(texto, { lazy: true });                // sincroniza no `change`, não no `input`
$model(numero, { number: true });             // converte `'3.5'` → `3.5`; inválido mantém string
$model(busca, { trim: true });               // remove espaços ao escrever
$model(status, { trim: true, number: true }); // ordem: trim → number (igual Vue)

// checkbox booleano com valores de domínio
$.input({ type: 'checkbox', use: $model(status, { trueValue: 'ativo', falseValue: 'inativo' }) });
```

| opção | aplica-se a | efeito |
|---|---|---|
| `lazy` | modo string (`text`/`number`/`textarea`/`select` simples) | escuta `change` em vez de `input` |
| `number` | qualquer valor string produzido pelo controle | `parseFloat` (inválido mantém string) |
| `trim` | qualquer valor string produzido pelo controle | `.trim()` |
| `trueValue` / `falseValue` | checkbox booleano | valor gravado quando marcado/desmarcado (default `true`/`false`) |

Regras:
- `trueValue`/`falseValue` só afetam **checkbox booleano** (ignorados em grupo/radio/select).
- `lazy` só afeta o modo string; checkbox/radio/select[multiple] já ouvem `change`.
- `number`/`trim` são globais: funcionam em `text`, `radio`, `checkbox-group` e `select[multiple]`.
- Ordem do cast: **trim → number**.

### `$show(cond)` — esconder preservando estado

Alterna `hidden` conforme a condição, **sem desmontar** — diferente do `$when` (§6), que monta/desmonta
e recria o ramo (estado fresco por design).

---

## 5. Componentes + listas keyed

**Closure (canônica)** — uma função que retorna um elemento:

```ts
const Row = (t: { title: string }) => $.li({ class: 'row' }, t.title);
Row({ title: 'abc' }); // → <li>
```

**Setup (açúcar)** — `$.tag(setupFn)` devolve um componente cuja **raiz é a tag**; o setup recebe
`(props, ctx)` e retorna os filhos. Use quando a raiz é a tag **e** você precisa de `ctx`. O setup
precisa de **≥1 param** — uma função **0-param** é filho reativo (§2):

```ts
const Counter = $.div<{ count: Signal<number> }>(({ count }) => [
  $.span(() => `count: ${count.value}`),
  $.button({ on: { click: () => count.value++ } }, '+'),
]);
Counter({ count: signal(0) }); // → <div> com os filhos
```

Estado local vive no closure do componente (ou do setup). Ambas produzem `(props) => Element`.
**Prefira a closure** — é mais simples e geral (pode retornar qualquer nó); o setup é açúcar para o caso
"raiz é a tag + preciso de `ctx`". (Decisão travada no [Manifesto de DX](DX-MANIFESTO.md).)

### Listas keyed — `$each`

Canônico: **`$each(fonte, Comp, keyFn)`** — fonte reativa (signal, função ou array), componente e `key`:

```ts
$.ul({ class: 'list' }, $each(itens, Row, (t) => t.id));
```

- `$each` devolve um filho reativo; `Comp` recebe o **próprio item** como props (o tipo erra se o item
  não tiver o que `Comp` espera). `keyFn(item)` é a `key` — **obrigatória** (reuso/reordenação sem
  recriar). Fonte aceita signal, função derivada, array cru ou `readonly`.
- **`key` é reservada** — como em React, não é um dado: `keyFn` prevalece sobre um `key` que o item já
  carregue (não leia `key` dentro da `Comp`; o tipo também não deixa).
- Para **filtrar**, passe uma fonte derivada: `$each(() => itens.value.filter(t => t.on), Row, t => t.id)`.
- Para **props derivadas ou branching por item**, use a **tupla crua** — `[Component, props]` como filho
  reativo (renderização lazy e cacheável):

```ts
$.ul(() =>
  itens.value.map((t) => [t.avulso ? RowSolto : Row, { ...t, key: t.id }]),
);
```

- **Cuidado**: a tupla crua **não confere as props em tipo** (`[Comp, props]` é `any` — a checagem do
  `$each` não existe aqui); o contrato é da própria `Comp`. Para listas simples, prefira `$each`.
- Nós com a mesma `key` são **reutilizados e reordenados** (não recriados) entre atualizações; os
  removidos rodam cleanup.
- `Component(props)` chamado direto funciona, mas **não cacheia** — prefira `$each` ou a tupla em listas.

---

## 6. Control-flow

Só as **condições** são rastreadas; a construção da view roda **destrastreada** (`untrack`), então
signals lidos ao montar a subárvore **não** viram dependência da região (evita remontar tudo a cada
mudança).

### `$when(cond, then, else?)` — monta/desmonta

```ts
$.div({},
  $when(aberto, () => Modal(), () => null),
);
```

Devolve um filho reativo; coloque-o na posição de filho. Cada alternância **recria** o ramo — o estado
interno é **fresco por design** (não há cache de ramo). Para esconder **preservando** estado/foco, use
`$show` (§4).

### `$match(...cases)` + `$else` — multi-via

`[cond, view]` em sequência — a **1ª cond truthy vence**; a `view` é uma função que monta o ramo. Uma
`View` solta no fim é o **fallback**. `$else` é a sentinela de catch-all:

```ts
$.div({},
  $match(
    [loading, () => $.span('…')],
    [erro, () => $.p({ class: 'e' }, erro.value)],
    [ $else, () => Conteudo() ],
  ),
);
```

### `$switch(selector, cases, fallback?)` — despacho por chave (enum-like)

`String(selector)` indexa o record de cases; sem a chave, usa o `fallback` (ou `null`):

```ts
$.div({},
  $switch(pagina, {
    home: () => Home(),
    sobre: () => Sobre(),
    contato: () => Contato(),
  }, () => NotFound()),
);
```

---

## 7. Lifecycle — `$mount` + hooks

```ts
const unmount = $mount('#app', App);
// ...
unmount(); // roda TODOS os cleanups (effects, listeners, custom events, behaviors) e remove os nós
```

`$mount(target, builder, props?)` — `target` é seletor ou `Element`; `builder` pode ser **node**,
**componente**, tupla `[Component, props]` ou **função** que devolve qualquer coisa montável.

> ⚠️ **Passe um builder** (componente/função), não uma árvore já construída. A árvore precisa ser
> criada **dentro** do escopo do mount para que seus effects tenham dono e sejam limpos no unmount.
> `$mount('#app', App)` ✅ — `$mount('#app', arvorePronta)` ⚠️ (renderiza, mas os effects vazam).

Hooks de ciclo de vida (rodam no escopo do componente/região corrente):

```ts
const Comp = () => {
  $onMounted(() => {             // roda AGORA (o componente acabou de construir)
    const id = setInterval(tick, 1000);
    return () => clearInterval(id); // retorno vira teardown (idioma "monta e devolve a limpeza")
  });
  $onUnmounted(() => ...);       // teardown no escopo ativo (roda no unmount/remoção do item)
  return $.div('…');
};
```

- **Timing** — "mounted" = o componente **construiu** (elemento criado), **não** necessariamente
  conectado ao `document` (a lib não tem fase de commit pós-attach). Limitação conhecida.
- Fora de escopo, os **hooks públicos `warn`** (ex.: chamar `$onUnmounted` no global) — é o débito que
  fala em vez de sumir silencioso.
- `$onMounted`/`$onUnmounted` são o **composable sem elemento**; um behavior (`use`) é o mesmo conceito
  **vinculado a um elemento** (recebe `ctx.element`).

---

## 8. Exemplo completo (miniatura)

```ts
import $, { $mount, $useSignal, $model, $each, $handle } from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal } from '@preact/signals-core';

$useSignal(preact);

const items = signal<{ id: number; text: string }[]>([]);
const draft = signal('');
let nextId = 1;

const Item = (t: { id: number; text: string }) =>
  $.li({},
    t.text,
    $.button({ on: { click: () => (items.value = items.value.filter((x) => x.id !== t.id)) } }, '×'),
  );

const add = () => {
  if (!draft.value.trim()) return;
  items.value = [...items.value, { id: nextId++, text: draft.value.trim() }];
  draft.value = '';
};

const App = () =>
  $.div({},
    $.input({ use: $model(draft), on: { keydown: [add, $handle.keys('Enter')] } }),
    $.button({ $disabled: () => !draft.value.trim(), on: { click: add } }, 'Add'),
    $.p(() => `${items.value.length} itens`),
    $.ul({}, $each(items, Item, (t) => t.id)),
  );

$mount('#app', App);
```

---

## 9. Baixo nível

O esqueleto sobre o qual os `$*` são construídos — útil para behaviors/integrações. Uso avançado;
fora do tutorial.

| export | o que faz |
|---|---|
| `$append(parent, child)` | injeta um **filho renderizável** em `parent` com a mesma normalização do `$.tag`: primitivo → texto, `Node` → direto, **array → recursivo**, `[Component, props]` → chama, fonte reativa → região reativa |
| `createTag(name, …)` | a factory crua de elemento por trás do `$` |
| `compose(handler, mods)` | aplica modificadores a um handler (a ordem do array é a ordem de execução) |
| `getCustomEvent(name)` | resolve a fonte custom registrada (o que `$registerCustomEvent` registra) |
| `applyUse(ctx, behaviors)` | roda behaviors (é o miolo do `use`) |
| `isSignal(v)` / `isReactive(v)` | predicados: signal do adapter? função ou signal? |
| `read(bindable)` | valor atual de um `Bindable` (signal | função | cru) |
| `bind(source, apply)` | fonte reativa → roda `apply` dentro de `effect` + registra o stop no escopo; cru → aplica 1x |
| `untrack(fn)` | roda `fn` sem criar dependências (usa `adapter.untrack` se houver) |
| `setValue(signal, value)` | escreve two-way (`adapter.setValue` ou fallback `signal.value = value`) |

---

## Regras de ouro

1. **Instale o adapter** com `$useSignal(...)` antes de qualquer `$mount`.
2. **Reativo = `$`-prefixo** na chave da prop (`$disabled`, `$class`, `$data`) **ou** função/`signal` como filho.
3. **1º argumento função**: `() => valor` (0 params) = filho reativo (`$.span(() => x)`); `(props, ctx) => filhos` (≥1 param) = setup (`$.div(fn)`). Nunca troque.
4. **Eventos em `on: {}`**; handler é `(event, ctx)`; modificadores via `$handle` (ordem do array = ordem de execução); options = objeto no fim do array.
5. **Custom events** (que disparam) vão em `on`; **behaviors** (que só se comportam) vão em `use`; **`$on`** é o primitivo para hooks de eventos em behaviors/setups.
6. **Listas**: `$each(fonte, Comp, t => t.id)` — sempre com `key`; tupla crua só para branching/props derivadas.
7. **`$mount` recebe um builder/componente**, não árvore pronta.
8. **Estilo**: caminho comum `class`/`$class`/`$style`/`$cx`; o engine (parts/flags/variants/slots/breakpoints) fica em `mini-q/style` — **[STYLE.md](STYLE.md)**.

---

## Referência rápida

Imports: `import $, { $mount, $when, $model, … } from 'mini-q'` · `import { style, css, config, media } from 'mini-q/style'`.

| API | Assinatura | Nota |
|---|---|---|
| `$` (default) | `$.tag(props?, ...children)` → `Element` | tag ∈ HTML (menos `style`); açúcar omite `{}` quando o 1º arg é filho |
| `$useSignal(adapter)` | `{ isSignal, getValue, effect, untrack?, signal?, setValue? }` | uma vez, no bootstrap |
| `$mount(target, builder, props?)` | → `unmount()` | node/componente/tupla/função — builder, não árvore pronta |
| `$onMounted(fn)` | `() => cleanup?` | roda agora (construiu); warn fora de escopo |
| `$onUnmounted(fn)` | teardown | no escopo ativo; warn fora |
| `$handle` | `.keys/.alt/.ctrl/.shift/.meta/.prevent/.stop/.self/.debounce(ms,{leading,trailing,maxWait})/.throttle(ms,{leading,trailing})/.handlers(map)` | callable `$handle(fn, ...mods)`; `$handlers` = alias raiz a deprecar |
| `$on(ctx, name, value)` | → `Cleanup` | primitivo p/ behaviors/setups; mesmo caminho do `on:{}`; auto-cleanup no escopo |
| `$registerCustomEvent(name, source)` | `(target, emit, options?) => cleanup` | novo custom event; `emit` devolve o retorno do handler (pareado: cleanup do un-enter) |
| `$model(signal)` | behavior | modos auto-detectados (text/checkbox/grupo/radio/select-multiple) |
| `$show(cond)` | behavior | alterna `hidden` (preserva estado) |
| `$cx(...)` | → string | classes condicionais; aceita StyleHandle |
| `$when(cond, then, else?)` | → filho reativo | monta/desmonta; estado fresco |
| `$match(...cases)` | `[cond, view]` …, View solta = fallback | 1ª cond truthy vence; `$else` = catch-all |
| `$switch(selector, cases, fallback?)` | → filho reativo | despacho por chave (enum-like) |
| `$else` | sentinela | `[$else, view]` dentro do `$match` |
| `$each(fonte, Comp, keyFn)` | fonte(signal·fn·array) + Comp + key → filho reativo | lista keyed; `key` reservada; tupla crua p/ branching |
| `$append(parent, child)` | → void | injeta filho renderizável (normalização do `$.tag`) |
| `mini-q/style` | `style, css, config, media` (+ `parts` deprecado) | engine completo → **[STYLE](STYLE.md)** |
| baixo nível | `createTag, compose, getCustomEvent, applyUse, isSignal, isReactive, read, bind, untrack, setValue` | → §9 |

Props especiais: `class`/`$class`, `style`/`$style`, `data`/`$data`, `on`, `use`, `key`. Qualquer outra
chave = atributo (com `$` = reativo).

---

## Ainda não implementado

- **Engine de CSS avançada**: tokens/variáveis, SSR, GC de regras, compound variants, prefixo/namespace
  configurável — ver [STYLE.md](STYLE.md) (estado atual) e [proposals/style-tokens.md](proposals/style-tokens.md).
- **Delegation de eventos** e dedup de handlers.
- **API estilo jQuery**: só `$append` existe — `remove`/`text`/… não (use `$mount` + render reativo).
- **`$model` com `options`** (`trueValue`/`falseValue`, `lazy`/`number`/`trim`) e **`useForm`/`useField`**
  schema-agnóstico — [proposals/model.md](proposals/model.md), [BACKLOG](BACKLOG.md).
- **Segundo adapter** + teste de agnosticidade.

O detalhe e a ordem sugerida estão no [BACKLOG](BACKLOG.md).
