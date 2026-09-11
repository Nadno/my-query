# AGENTS.md — mini-q: guia de operação para agentes de IA

Guia para agentes de IA programarem com `mini-q` com a mesma desenvoltura que com React — **sem
precisar ler o source**. O código é a fonte de verdade (veja [docs/USAGE.md](docs/USAGE.md),
[docs/STYLE.md](docs/STYLE.md), [docs/GLOSSARY.md](docs/GLOSSARY.md)); aqui estão o mapa mental,
os padrões e as pegadinhas.

> **Regra 0:** a API documentada abaixo é completa. Se algo não está aqui nem nas `docs/`, não
> existe — não invente. Ao desconfiar de um comportamento, olhe primeiro os testes em `src/**/__tests__`
> (o contrato de comportamento está lá), depois o source.

---

## 1. Mapa mental em 30 segundos

- **`$` é SÓ tags.** `$.div`, `$.button`, `$.fieldset`, `$.span`, … — tag ∈ HTML (menos `style`).
  Tudo o resto são **exports nomeados** com prefixo `$`: `$mount`, `$when`, `$model`, `$handle`, …
  (importados à parte de `mini-q`).
- **Sem build/JSX**: você monta a árvore com funções (`$.div(props?, ...children)`) e a reatividade é
  **granular por signal**, agnóstica de lib — o consumidor pluga o adapter (`@preact/signals-core`).
- **Estilo** vive no entry opcional `mini-q/style` → `import { style, css, config, media } from 'mini-q/style'`.
- **Acessibilidade/ARIA** vive no entry opcional `mini-q/aria` → `import { RovingFocus, FocusScope, CheckGroup, RovingIndex, FocusGrid } from 'mini-q/aria'`.
- Setup mínimo:

```js
import $, { $mount, $useSignal } from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal, computed } from '@preact/signals-core';

$useSignal(preact); // obrigatório, UMA vez, antes de qualquer $mount

const App = () => $.div({ class: 'app' }, $.p('Olá'));
const unmount = $mount('#app', App); // unmount() desfaz tudo
```

---

## 2. Regras de ouro (não-negociáveis)

1. **`$useSignal(adapter)` antes de qualquer `$mount`.** Adapter preact já existe
   (`mini-q/adapters/preact`); qualquer lib de signal serve.
2. **Reativo = `$`-prefixo na chave** (`$disabled`, `$class`, `$value`, `$aria`) OU função/`signal`
   como **filho** (`$.span(() => count.value)`). Valor cru (sem `$`) é estático, aplicado uma vez.
   - Value reativo: `$.button({ $disabled: on, class: btn })` — o `$` + chave de atributo.
   - **`$aria`** é reativo (`$aria: { checked: sig }`); **`aria`** é estático.
   - **`data`** não reage — use **`$data`** para `data-*` reativos (`{ $data: { show: () => String(show.value) } }`).
3. **1º argumento função — aridade desambigua (NUNCA troque):**
   - `() => valor` (0 params) = **filho reativo** (`$.span(() => x)`).
   - `(props, ctx) => filhos` (≥1 param) = **setup de componente** (`$.div((ctx) => { ... })`).
4. **Eventos em `on: {}`** → handler `(event, ctx)`; modificadores via `$handle`; **ordem do array =
   ordem de execução** (`[handler, $handle.keys('Escape'), $handle.prevent]`).
5. **Custom events** (disparam: `hover`, `interactOutside`, `clickOutside`, `focusOutside`) vão em `on`.
   **Behaviors** (se comportam, não disparam: `$model`, `$show`) vão em `use`.
6. **Listas**: `$each(fonte, Comp, keyFn)` — sempre com `key` (= `keyFn(item)`; a tupla vira
   `[Comp, { ...item, key }]`). `Comp` recebe o item como props. `key` é reservada — não carregue
   dado sob `key`.
7. **`$mount` recebe builder/componente, não árvore pronta.**
8. **Estilo**: caminho comum `class`/`$class`/`$style`/`$cx`; o engine completo (`style`, parts,
   flags/variants, slots, breakpoints) → [§4](#4-estilo--mini-qlibstyle---o-engine).

---

## 3. Elementos, eventos, control-flow e lifecycle

### Elementos — `$.tag(props?, ...children)`

```js
$.button({ type: 'button', class: 'cta', $aria: { expanded: open } }, 'Abrir');
$.div({ style: { display: 'grid', gap: 8 } }, $.span('a'), $.span('b'));
```

- **Props especiais** (tipadas e manipuladas pelo engine): `class`/`$class`, `style`/`$style`,
  `data`/`$data`, `aria`/`$aria`, `on`, `use`, `key`. Qualquer outra chave = atributo HTML (com `$`
  = reativo).
- Children aceitam: `string`, `number`, `Node`, arrays, `[Component, props]`, fontes reativas
  (função/signal). `boolean`/`null`/`undefined` = ignorados (condicional inline).
- **`class`** aceita: `string`, `array` (`['a', ativo && 'b']`), `record` (`{ erro: temErro }`, chaves
  truthy viram classes), `StyleHandle` (é chamado) e `$class: () => ...` reativo.
- `style` aceita string (`'color: red'`) ou objeto camelCase. **Anti-pattern: nunca passe um objeto
  de estilo em `class:` para "aplicar CSS"** — `class` trata objeto como mapa de classes (bota nomes
  lixo no atributo). Estilo real é `style:`/`$style:` ou o engine `style()`.

### Eventos — `on` + `$handle`

```js
$.button({
  on: {
    click: (e) => (open.value = !open.value),
    keydown: [
      closeFn,
      $handle.keys('Escape'),
      $handle.prevent,       // preventDefault
    ],
  },
});
// modificadores: .keys(...), .prevent, .stop, .self, .alt/.ctrl/.shift/.meta,
// .debounce(ms,{leading,trailing,maxWait}), .throttle(ms,{leading,trailing}),
// .handlers({...}) — $handle(fn, ...mods) compõe.
```

- Custom events pareados (enter↔leave): o handler **devolve o cleanup** do "un-enter"
  (`hover: (e) => { show.value = true; return () => (show.value = false); }`).

### Control-flow

```js
$when(cond, () => Painel(), () => Fallback()); // monta/desmonta; estado fresco a cada vez
$show(cond)                                     // behavior: alterna `hidden` (preserva estado/foco)
$match([cond, () => V1()], [cond2, () => V2()], [ $else, () => V3() ])
$switch(selector, { a: () => A(), b: () => B() }, () => NotFound())
```

- Só as **condições** são rastreadas; a construção da view roda destrastreada.
- **`$show` preserva o nó** (só `hidden`); para trocar conteúdo real use `$switch`/`$when`.

### Lifecycle

```js
const Dialog = () => {
  $onMounted(() => { /* nó já conectado na DOM; roda pós-montagem (deferido) */ });
  $onUnmounted(() => { /* teardown do escopo deste componente */ });
  return $.div(...);
};
// $onMounted pode devolver um cleanup → registrado como teardown.
```

- `$onMounted`/`$onUnmounted` são chamados **no corpo do componente (setup)**, não como child.
  `$when(open, () => [MeuModal, {}] as const)` para componente como filho (tupla).
- Teleport: `$useTeleport('body')` como behavior move o nó ao alvo durante a construção; o nó fica
  conectado no alvo — teste com `target.contains(el)`/`isConnected`, **não** `parentNode === target`.

---

## 4. Estilo — `mini-q/style` (o engine)

**Import:** `import { style, css, config, media } from 'mini-q/style'`.

### 4.1 `style(name, config)` → `StyleHandle`

Define um **bloco** (um componente/entidade de UI), injeta as regras num `<style id="mq-styles">`
e devolve um **`StyleHandle` callable e único** com as **partes promovidas** (`handle.parte`),
mais `self`/`flags`/`variants`/`keyframes`/`slots`. `class`/`$class`/`$cx` aceitam o handle direto
(o engine o chama).

**Chaves do config:**

| chave | o que faz | CSS emitido |
|---|---|---|
| *(topo)* | declarações do bloco (escalares/`&`/`@`) | `.bloco { … }` |
| `>nome` | **shortcut para parte** (`>title` ≡ `parts: { title: {…} }`) | `.bloco .-bloco-nome { … }` |
| `parts` | partes descendentes (recursivo); **prefira `>nome`** para rastreio dos seletores | `.bloco .-bloco-parte { … }` |
| `flags` | booleanas independentes | `.bloco.--is-flag { … }` |
| `variants` | grupos exclusivos | `.bloco.--grupo-valor { … }` |
| `defaults` | valor default por grupo de variante | — |
| `slots` | bloco estrangeiro hospedado (composição) | mirado por flags/variants |
| `keyframes` | animação escopada por bloco | `@keyframes bloco-nome { … }` |

**Preferência do projeto:** declare partes com o **shortcut `>nome` no topo** — dá rastreio visual
e os seletores emitidos ficam óbvios. Funciona recursivo:
`'>content': { padding: 16, '>description': { color: '#666' } }` →
`.bloco .-bloco-content .-bloco-description`.

**Exemplo completo (padrão de referência):**

```js
const card = style('card', {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  '&:hover': { boxShadow: '0 0 0 2px rgba(255,255,255,.2)' },
  '>title': { fontWeight: 700, fontSize: '1.1rem' },
  '>content': {
    color: 'rgba(255,255,255,.75)',
    '>description': { opacity: 0.8 }, // parte aninhada
  },
  flags: { featured: { borderColor: 'gold' } },       // .card.--is-featured
  variants: { size: { sm: { padding: 4 }, md: { padding: 8 } } },
  defaults: { size: 'md' },
});
```
```css
.card { display: flex; flex-direction: column; gap: 8px; }
.card:hover { box-shadow: 0 0 0 2px rgba(255,255,255,.2); }
.card > .-card-title { font-weight: 700; font-size: 1.1rem; }
.card > .-card-content { color: rgba(255,255,255,.75); }
.card > .-card-content > .-card-description { opacity: 0.8; }
.card.--is-featured { border-color: gold; }
.card.--size-sm { padding: 4px; }  .card.--size-md { padding: 8px; }
```

**Handle no call-site:**

```js
card.self                       // 'card'
card.title.self                 // '-card-title'   (parte promovida, nome completo do bloco)
card.content.description.self   // '-card-description' (neto: MESMO prefixo — classes são depth-independent)
card.flags.featured             // '--is-featured'
card.variants.size.md           // '--size-md'
card({ size: 'sm', featured: true })   // 'card --size-sm --is-featured'
```

**Aplicação no DOM (o idioma do estado reativo):**

```js
// parte estática — o handle direto em `class:` é chamado
$.div({ class: card.title }, 'Título');

// estado reativo — NUNCA `class: { objeto }`; use `$class` com o callable do handle
$.div({ $class: () => card({ featured: featured.value }) }, filho);

// flag de uma parte reativa (ex.: ícone gira quando aberto)
const item = style('item', { '>icon': { transition: 'transform .2s ease', flags: { open: { transform: 'rotate(45deg)' } } } });
$.span({ $class: () => item.icon({ open: open.value }), 'aria-hidden': true }, '+');
```

> **O `$class` aceita:** string, função que retorna `string`/`array`/`record`, `StyleHandle`, array.
> O callable do handle (`card({...})`) retorna a string de classes com defaults + tokens — combina
> perfeitamente com `$class: () => card({ flag: sig })`.

### 4.2 Partes, flags, variantes — quando usar cada

- **Parte** = elemento que a entidade **possui** (`card.title`). Combinador descendente automático
  (`.card .-card-title`); mover parte de nível não renomeia. Acesse promovida, em qualquer
  profundidade (`theme.btn.icon`).
- **Flag** = estado **booleano independente** → classe `.bloco.--is-{nome}`. É o padrão para
  `checked`/`open`/`loading`/`error` reativos.
- **Variante** = grupo **exclusivo** (um valor por vez) → `.bloco.--{grupo}-{valor}`. É o padrão para
  `size`/`tone`/`variant` etc., com `defaults`.
- **Override**: uma flag/variante pode sobrescrever partes/slots: `flags: { invalid: { parts: { input: { borderColor: 'red' } } } }`.
- **Slot** = bloco **estrangeiro** hospedado (`slots: { control: outroBloco }`), mirado por
  flags/variants por `slots: { control: { … } }`. Composição de 1ª classe em vez de CSS cru.
- Nomes reservados de parte: `self`/`flags`/`variants`/`keyframes`/`slots` (virarão `warn`).
- **Valores**: camelCase, números viram `px` (exceto unitless: `opacity`, `zIndex`, `lineHeight`,
  `flex`, `fontWeight`, …), `&:` pseudos/at-rule, `@media (…)`/`@supports` crus preservados.

### 4.3 Escopo — `@scope` (native) vs classes (prefixed)

- **Default = `prefixed`** (classes planas globais). Para isolamento real (ou quando o componente
  pode vazar estilos), use **`scope: { strategy: 'native' }`** → emite `@scope (.bloco) { :scope {…} }`.
- `scope: { strategy: 'native', to: '.modal' }` — limita o escopo (`@scope (.x) to (.modal)`).
- `scope: { name: 'acme' }` — prefixo de leitura das classes (`acme-card` root).
- `scope: { name: 'hashed' }` — hash estável do bloco (idempotente p/ SSR/hydration).
- **Handle segue o motor ativo** (`self`/partes batem com as classes emitidas) — sempre aplique a
  classe do root num ancestral para o combinador descendente das partes encontrar alvo.
- Motor global em `config({ scope: { strategy, name } })` — padrão para todos os blocos.

### 4.4 Globais e breakpoints

```js
css('body', { margin: 0, fontFamily: '...' });        // seletor cru global (= style.css)
config({ breakpoints: { md: 768, lg: 1024 } });       // registro global
// no CSS: { '@md': { padding: 16 } } → @media (min-width: 768px)
const isMd = media('md');                              // signal<boolean> via matchMedia
```

---

## 5. Acessibilidade — `mini-q/aria` + composables

Composables compartilhados (fiação recorrente) vivem em `examples/wai-aria/aria-utils.js`
(importado relativo `./aria-utils.js`):

```js
// Grupo de seleção (radio/switch/accordion): CheckGroup + signal por item + sync
useGroup({ names: ['free','pro'], initial: { free: true }, allowAllUnchecked: false, defaultChecked: 'free' });
// → { group, sigs, sync, isChecked, set }; sigs[name] é signal → passe a $aria.checked/expanded

// Roving tabindex (radio/tabs/menu) + setas/Home/End
useRoving(el, { target: '[role=radio]', orientation: 'vertical', loop: true, onMove: (item) => ... });

// Fechar em Esc (menu/dialog)
escClose(close);   // = [close, $handle.keys('Escape'), $handle.prevent]

// Índice circular (combobox, activedescendant)
moveIndex({ index, count, step, loop: true });  // → novo índice | null
```

APG (WAI-ARIA Authoring Practices) é o guia de padrões: roving tabindex, `aria-activedescendant`,
foco preso (`FocusScope`), grupos (`CheckGroup`). O `dist/` da lib é servido via CDN (jsdelivr) nos
exemplos; ver `examples/wai-aria/*.html` como referência viva de cada padrão.

---

## 6. Comandos e verificação (ambiente WSL)

Tudo roda **dentro do WSL** (`wsl.exe -d Ubuntu-20.04`). Do Windows, PowerShell→WSL quoting é
frágil — **prefira scripts `.sh`** colocados em `C:\Users\eunad\AppData\Local\Temp\opencode\` e
rodados via `wsl.exe -d Ubuntu-20.04 -- bash /mnt/c/Users/eunad/AppData/Local/Temp/opencode/<s>.sh`.
Dentro do script: `export HOME=/home/nadno` + node v22 no PATH:

```bash
export HOME=/home/nadno
export PATH="/home/nadno/.nvm/versions/node/v22.13.1/bin:$PATH"
cd /home/nadno/projects/mini-q
```

**Antes de dar qualquer tarefa como pronta, rode (na ordem):**

| O quê | Comando | Esperado |
|---|---|---|
| Unit tests | `npx vitest run` | `Test Files N passed` · `Tests M passed` · exit 0 |
| Typecheck | `npx tsc -p tsconfig.json --noEmit` | exit 0, sem erros |
| Build da lib | `npm run build:lib` | exit 0 (gera `dist/`) |
| E2E (via vite dev) | `npx playwright test` | `N passed` |
| E2E estático (import map real/CDN) | `npx playwright test static.spec.ts` | `11 passed` |

- Playwright está **pinado em `@playwright/test@1.62.0`** (1.63 distribui Chromium sem suporte a
  Ubuntu 20.04).
- `playwright.config.ts` sobe dois servidores: `npm run dev` (5173) e o estático via
  `node scripts/serve.mjs 5174` (raiz do repo). O estático valida que o import map dos exemplos
  resolve (pega bare-specifier quebrado, MIME `.mjs`, CORS).
- Uso local dos exemplos: `npm run serve:aria` → `http://127.0.0.1:4173/examples/wai-aria/`.
- Se algo parece bug: **reproduza num servidor estático/sem build** antes de culpar o vite (o vite
  reescreve bare specifiers via node_modules e mascara erros de import map).
  Ache a causa raiz antes de corrigir; só depois adicione teste de regressão.

---

## 7. Referências vivas

- **Exemplos single-file reais** (fonte de padrões corretos): `examples/wai-aria/{disclosure,switch,radio-group,tabs,accordion,slider,tooltip,menu-button,combobox,dialog}.html` + `aria-utils.js`.
- **Style completo**: `docs/STYLE.md`. **Uso geral**: `docs/USAGE.md`. **Vocabulário**: `docs/GLOSSARY.md`.
- **Testes = contrato de comportamento**: `src/**/__tests__/*.test.ts`, `src/style/__tests__/*.test.ts`.
- **Composables** (auth full-stack): `examples/auth/web/src/composables/`, `examples/auth/web/src/ui/*.style.ts`.
