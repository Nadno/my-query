# mini-q — Guia de uso (para humanos e IA)

`mini-q` é uma lib **sem build/JSX**: você cria DOM com funções (`$.div(...)`), a reatividade é
**granular** (por signal) e **agnóstica** (você pluga a lib de signal). Este documento é a superfície
**completa e atual** — se algo não está aqui, não existe ainda (veja [Ainda não implementado](#ainda-não-implementado)).

> Para gerar código correto, siga as **[Regras de ouro](#regras-de-ouro)**. Elas evitam os erros comuns.
> Para entender *por que* a API é assim, veja o **[Manifesto de DX](DX-MANIFESTO.md)**.

---

## 1. Setup

```ts
import $ from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal, computed } from '@preact/signals-core';

$.useSignal(preact); // instale o adapter UMA vez, antes de montar

const App = () => $.h1({}, 'Olá mini-q');
const unmount = $.mount('#app', App); // monta; unmount() desfaz tudo
```

O adapter é um objeto `{ isSignal, getValue, effect }`. Qualquer lib de signal serve:

```ts
$.useSignal({
  isSignal: (v) => v instanceof MinhaSignal,
  getValue: (v) => v.value,
  effect: (run) => minhaLibEffect(run), // roda + re-roda; retorna função de parada
});
```

---

## 2. Criar elementos

Assinatura: **`$.tag(props?, ...children)`**.

```ts
$.div({ id: 'box', class: 'card' }, 'texto', $.span({}, 'filho'));
$.button({ type: 'button' }, 'Clique');
$.ul({}, $.li({}, 'a'), $.li({}, 'b'));
```

- `props` é opcional; se o 1º argumento não for um objeto de props, é tratado como filho.
- Atributos são chaves normais (`id`, `type`, `disabled`, `placeholder`, `href`, `value`…), tipados por tag.
- Children aceitam: `string`, `number`, `Node`, arrays, `[Component, props]` (ver §7), e **fontes reativas** (função ou signal — ver §3).
- `boolean`, `null`, `undefined` como filho são ignorados (útil para condicional inline).

> ⚠️ **1º argumento função = definição de componente**, não elemento (ver §7). Para um filho reativo
> sem props, passe props vazias: `$.span({}, () => texto)`.

---

## 3. Reatividade

Marque a prop como reativa com **prefixo `$`** na chave. O valor pode ser um **signal** ou uma
**função `() => expr`** (a função funciona com qualquer adapter):

```ts
const on = signal(false);
$.button({ $disabled: on }, 'x');              // signal direto
$.button({ $disabled: () => !valido.value }, 'x'); // função derivada
$.input({ $value: texto });                    // qualquer atributo aceita $prefixo
```

Valor cru (sem `$`) = estático, aplicado uma vez:

```ts
$.button({ disabled: true }, 'x'); // estático
```

**Filhos reativos** (texto/valor que muda) — passe uma função ou signal na posição de filho:

```ts
$.span({}, () => `Total: ${total.value}`);
$.p({}, count); // signal como filho também funciona
```

---

## 4. class, style, data

```ts
// class: string | array | record { classe: boolean }
$.div({ class: 'a b' });
$.div({ class: ['a', ativo && 'ativo', { erro: temErro }] });
$.div({ $class: () => (ativo.value ? 'on' : 'off') }); // reativo

// style: string ou objeto (camelCase)
$.div({ style: 'color: red' });
$.div({ style: { color: 'red', fontWeight: 700 } });
$.div({ $style: () => ({ color: cor.value }) }); // reativo

// data: cada valor pode ser estático; use $data para valores reativos
$.div({ data: { foo: 'x', bar: true } });        // → data-foo="x" data-bar="true"
$.div({ $data: { count: sig, ok: true } });      // count reativo, ok estático
```

`$.cx(...)` compõe classes condicionais (clsx-like): `$.cx('a', x && 'b', ['c', null]) // 'a b c'`.

---

## 5. Eventos — `on: {}` + `handle`

Eventos ficam num **record `on`**. O valor é um handler, ou um array `[handler, ...modificadores, options?]`.

```ts
$.button({ on: { click: (e, ctx) => console.log('clicou', ctx.element) } }, 'x');
```

- Handler recebe **`(event, ctx)`** — `ctx.element` é o nó cru.
- Modificadores vêm de **`$.handle`** (ou desestruture). Um objeto simples no fim do array vira
  `AddEventListenerOptions` (`once`/`capture`/`passive`).

```ts
const { keys, alt, prevent, stop, self, debounce, throttle } = $.handle;

$.input({
  on: {
    keydown: [enviar, keys('Enter'), alt, prevent], // Enter+Alt, com preventDefault
    input: [aoDigitar, debounce(300)],
    scroll: [aoRolar, throttle(100), { passive: true }],
  },
});
```

`debounce`/`throttle` aceitam opções estilo lodash:

```ts
$.input({
  on: {
    input: [aoDigitar, debounce(300, { leading: true })],       // 1ª imediata + última após 300ms
    scroll: [aoRolar, throttle(100, { trailing: false })],      // só leading (comportamento antigo)
    resize: [aoRedimensionar, debounce(200, { maxWait: 500 })], // no mínimo 1 a cada 500ms
  },
});
```

- **`debounce(ms, { leading?, trailing?, maxWait? })`** — `leading` dispara na 1ª chamada da rajada;
  `trailing` (default `true`) dispara a última após `ms`; `maxWait` limita o atraso máximo (no mínimo
  1 a cada `maxWait`).
- **`throttle(ms, { leading?, trailing? })`** — default `{ leading: true, trailing: true }` (como lodash);
  `{ trailing: false }` = só leading (comportamento antigo).

> ⚠️ **Retorno do handler**: invocações **síncronas** (leading) propagam o retorno do handler;
> invocações **assíncronas** (trailing/`maxWait`) não — o retorno morre no `setTimeout`. Num custom
> event pareado (`hover`…), o cleanup do "un-enter" só atravessa se a invocação for leading. Prefira
> `debounce`/`throttle` em handlers fire-and-forget.

Forma explícita e handlers nomeados/reusáveis:

```ts
const h = $.handlers({ enviar: [enviar, keys('Enter')], fechar });
$.form({ on: { keydown: h.enviar } });
// $.handle(fn, ...mods) também existe (equivalente à forma array)
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
      return () => tooltip.remove(); // un-hover: roda no mouseleave
    },
    interactOutside: () => (aberto.value = false), // sem cleanup → nada no leave
  },
}, ...);
```

- **`hover`** — `mouseenter` → handler (devolve o un-hover); `mouseleave` → roda o cleanup. Sem delay/touch (etapa própria).
- **`focusOutside`** — enter quando o foco **sai** do alvo (via `relatedTarget`), leave quando volta.
- **`interactOutside`** — enter no 1º `pointerdown` **fora** do alvo, leave num `pointerdown` **dentro** (backdrop de popover/modal).

Registrar o seu:

```ts
$.registerCustomEvent('longpress', (target, emit) => {
  const onDown = (e) => { const t = setTimeout(() => emit(e), 500); /* ... */ };
  target.addEventListener('pointerdown', onDown);
  return () => target.removeEventListener('pointerdown', onDown); // cleanup
});
```

> **Fronteira**: *dispara e chama handler* → `on`. *Só se comporta, sem "handler"* → `use` (§6).

---

## 6. Behaviors — `use`

Um behavior é `(ctx) => cleanup?`, roda pós-criação. Bom para o que **não dispara** (binding, foco…).

```ts
$.input({ use: $.model(texto) });          // two-way binding (input/select/textarea)
$.div({ use: $.show(visivel) });           // alterna `hidden` (preserva estado)
$.div({ use: [$.show(v), meuBehavior] });  // vários

const meuBehavior = (ctx) => {
  const id = requestAnimationFrame(() => ctx.element.focus());
  return () => cancelAnimationFrame(id); // cleanup roda no unmount
};
```

---

## 7. Componentes

**Closure (canônica)** — uma função que retorna um elemento:

```ts
const Row = (t: { title: string }) => $.li({ class: 'row' }, t.title);
Row({ title: 'abc' }); // → <li>
```

**Setup (açúcar)** — `$.tag(setupFn)` devolve um componente cuja **raiz é a tag**; o setup recebe `(props, ctx)`
e retorna os filhos. Use quando a raiz é a tag **e** você precisa de `ctx`:

```ts
const Counter = $.div<{ count: Signal<number> }>(({ count }) => [
  $.span({}, () => `count: ${count.value}`),
  $.button({ on: { click: () => count.value++ } }, '+'),
]);
Counter({ count: signal(0) }); // → <div> com os filhos
```

Estado local vive no closure do componente (ou do setup). Ambas as formas produzem `(props) => Element`.
**Prefira a closure** — é mais simples e geral (pode retornar qualquer nó); o setup é açúcar para o caso
"raiz é a tag + preciso de `ctx`". (Decisão travada no [Manifesto de DX](DX-MANIFESTO.md).)

---

## 8. Listas keyed

Canônico: **`$.each`** — fonte reativa (signal, função ou array), componente e `key`:

```ts
$.ul({ class: 'list' }, $.each(itens, Row, (t) => t.id));
```

- `$.each(fonte, Comp, keyFn)` devolve um filho reativo; `Comp` recebe o **próprio item** como props
  (o tipo erra se o item não tiver o que `Comp` espera). `keyFn(item)` é a `key` — **obrigatória**
  (reuso/reordenação sem recriar). Fonte aceita signal, função derivada, array cru ou `readonly`.
- **`key` é reservada** — como em React, não é um dado: `keyFn` prevalece sobre um `key` que o item
  já carregue (não leia `key` dentro da `Comp`; o tipo também não deixa).
- Para **filtrar**, passe uma fonte derivada: `$.each(() => itens.value.filter(t => t.on), Row, t => t.id)`.
- Para **props derivadas ou branching por item**, use a tupla crua — filho reativo que devolve
  `[Component, props]`:

```ts
$.ul({}, () =>
  itens.value.map((t) => [t.avulso ? RowSolto : Row, { ...t, key: t.id }]),
);
```

- **Cuidado**: a tupla crua **não confere as props em tipo** (`[Comp, props]` é `any` — a checagem
  do `$.each` não existe aqui); o contrato é da própria `Comp`. Para listas simples, prefira `$.each`.
- Nós com a mesma `key` são **reutilizados e reordenados** (não recriados) entre atualizações; os removidos rodam cleanup.
- `Component(props)` chamado direto também funciona, mas **não cacheia** — prefira `$.each` ou a tupla em listas.

---

## 9. Condicional — `$.when`

```ts
$.div({},
  $.when(aberto, () => Modal(), () => null), // monta/desmonta conforme a condição
);
```

`$.when(cond, then, else?)` devolve um filho reativo; coloque-o na posição de filho. Cada alternância
**recria** o ramo — o estado interno do ramo é **fresco por design** (não há cache de ramo). Para
esconder **preservando** estado/foco, use o behavior `$.show` (§6).

---

## 10. Lifecycle — `mount` / `unmount`

```ts
const unmount = $.mount('#app', App);
// ...
unmount(); // roda TODOS os cleanups (effects, listeners, custom events, behaviors) e remove os nós
```

> ⚠️ **Passe um builder** (componente/função) para `$.mount`, não uma árvore já construída. A árvore
> precisa ser criada **dentro** do escopo do mount para que seus effects tenham dono e sejam limpos no
> unmount. `$.mount('#app', App)` ✅ — `$.mount('#app', arvorePronta)` ⚠️ (renderiza, mas os effects vazam).

---

## 11. CSS — `$.style` (namespace) / `$.cx`

`$.style(name, config)` devolve um **`StyleHandle`** único e **injeta** as regras num
`<style id="mq-styles">`. O handle é *callable* e as **partes ficam nele** (`field.input`); traz
ainda `self` / `flags` / `variants` / `keyframes` / `slots`. **`class`/`$class`/`cx` aceitam o handle
direto** (ele é chamado) — sem `.self` no caso comum. Decls ficam **no topo** do config (não há `base`).
Objetos JS: camelCase, números viram `px` (exceto unitless como `opacity`/`zIndex`/`lineHeight`),
aninhamento com `&` (`&:hover`, `& .filho`) e um nível de `@media`/`@supports`. **Partes e variantes
coexistem** (chaves reservadas explícitas):

| chave | o que faz | CSS emitido |
|---|---|---|
| *(topo)* | declarações do bloco (escalares/`&`/`@`) | `.bloco { … }` |
| `parts` | partes descendentes (recursivo) | `.bloco .-bloco-parte { … }` |
| `flags` | flags booleanas independentes | `.bloco.--is-flag { … }` |
| `variants` | grupos exclusivos | `.bloco.--grupo-valor { … }` |
| `defaults` | valor default por grupo de variante | — |
| `slots` | bloco estrangeiro hospedado | mirado por flags/variants |
| `keyframes` | animação escopada por bloco | `@keyframes bloco-nome { … }` |

```ts
const field = $.style('field', {
  display: 'flex', flexDirection: 'column',
  parts: {
    label: { fontSize: '.9rem' },
    error: { color: 'var(--danger)' },
  },
  slots: { control: inputClass },              // hospeda o bloco `input`
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

- **Parte** = nome **completo do bloco** + chave, em **toda profundidade** (`-field-label`); combinador
  descendente automático; mover parte de nível não renomeia. Acessa-se como `field.label` (promovida).
- **Flag** = classe composta `.bloco.--is-{nome}` (o `is-` distingue de variante). **Variante** = `.bloco.--{grupo}-{valor}`.
- **Slot** = bloco estrangeiro que você hospeda (`slots: { control: bloco }`); flags/variants o miram por
  `slots: { control: { … } }` → `.bloco.--is-flag .hospedado`. É a composição de 1ª classe (em vez do CSS cru).
- Flag/variante também aceitam `parts: { … }` p/ override de **parte** descendente.
- Bloco simples também é StyleHandle callable: `class: card` (chama → `'card'`) ou `card.self`.
- Nomes reservados p/ parte: `self`/`flags`/`variants`/`keyframes`/`slots` (→ `warn`).
- **Globais / escape hatch**: `$.style.css('body', { margin: 0 })`.
- Nome duplicado → `warn`; chave-objeto inesperada no topo (parte fora de `parts`) → `warn`.

> **Deprecados** (alias por 1 versão): `$.parts(name, tree)` → `$.style(name, { parts: tree })`;
> `$.css(sel, obj)` → `$.style.css(sel, obj)`.

---

## 12. Exemplo completo (miniatura)

```ts
import $ from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal, computed } from '@preact/signals-core';

$.useSignal(preact);

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
    $.input({ use: $.model(draft), on: { keydown: [add, $.handle.keys('Enter')] } }),
    $.button({ $disabled: () => !draft.value.trim(), on: { click: add } }, 'Add'),
    $.p({}, () => `${items.value.length} itens`),
    $.ul({}, () => items.value.map((t) => [Item, { ...t, key: t.id }])),
  );

$.mount('#app', App);
```

---

## Regras de ouro

1. **Instale o adapter** com `$.useSignal(...)` antes de qualquer `$.mount`.
2. **Reativo = `$`-prefixo** na chave da prop (`$disabled`, `$class`, `$data`) **ou** função/`signal` como filho.
3. **1º argumento função = componente** (`$.div(fn)`). Filho reativo sem props → `$.span({}, () => x)`.
4. **Eventos em `on: {}`**; handler é `(event, ctx)`; modificadores via `$.handle`; options = objeto no fim do array.
5. **Custom events** (que disparam) vão em `on`; **behaviors** (que só se comportam) vão em `use`.
6. **Listas**: `$.each(fonte, Comp, t => t.id)` — sempre com `key`; tupla crua só para branching/props derivadas.
7. **`$.mount` recebe um builder/componente**, não árvore pronta.
8. **`$.style(name, config)` devolve um StyleHandle** callable (partes promovidas: `field.input`) e injeta o CSS; `class`/`cx` aceitam o handle; globais com `$.style.css`.

---

## Referência rápida

| API | Assinatura | Nota |
|---|---|---|
| `$.useSignal(adapter)` | `{ isSignal, getValue, effect }` | uma vez, no bootstrap |
| `$.tag(props?, ...children)` | → `Element` | tag ∈ HTML (menos `style`) |
| `$.tag(setup)` | `(props, ctx) => children` → `Component` | 1º arg função |
| `$.mount(target, App, props?)` | → `unmount()` | builder, não árvore pronta |
| `$.when(cond, then, else?)` | → filho reativo | monta/desmonta |
| `$.each(fonte, Comp, keyFn)` | fonte(signal·fn·array) + Comp + key → filho reativo | lista keyed; tupla crua p/ branching |
| `$.handle` | `.keys/.alt/.ctrl/.shift/.meta/.prevent/.stop/.self/.debounce(ms, opts)/.throttle(ms, opts)` | + callable `handle(fn, ...mods)`; `debounce`/`throttle` estilo lodash (`leading`/`trailing`/`maxWait`) |
| `$.handlers(map)` | `{ nome: [fn, ...mods] }` → `{ nome: Handler }` | reuso |
| `$.model(signal)` | behavior | two-way (input/select/textarea) |
| `$.show(cond)` | behavior | alterna `hidden` |
| `$.cx(...)` | → string | classes condicionais; aceita StyleHandle |
| `$.style(name, config)` | → `StyleHandle` | callable + partes promovidas + `self`/`flags`/`variants`/`keyframes`/`slots`; injeta CSS |
| `$.style.css(selector, obj)` | → void | estilo global / escape hatch (seletor cru) |
| `$.parts` / `$.css` | *deprecados* | alias p/ `$.style(…, {parts})` / `$.style.css` |
| `$.registerCustomEvent(name, source)` | `(target, emit) => cleanup` | novo custom event; `emit` devolve o retorno do handler (pareado: cleanup do un-enter) |

Props especiais: `class`/`$class`, `style`/`$style`, `data`/`$data`, `on`, `use`, `key`. Qualquer outra chave = atributo (com `$` = reativo).

---

## Ainda não implementado

- **Engine de CSS avançada** (tokens, SSR, GC de regras, compound variants, prefixo/namespace configurável).
- **Delegation de eventos** e **dedup de handlers** (o runtime de eventos é enxuto).
- **API de manipulação estilo jQuery** (`append/remove/text`…) — use `$.mount` + render reativo.
