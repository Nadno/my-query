# Examples — plano

Propósito: exemplos **pequenos, focados e copiáveis**. Cada um prova UMA ideia da API.
O `auth/` continua como showcase full-stack; os exemplos abaixo são o material de aprendizado.

## Regras

- **Um arquivo por exemplo** (`main.ts` + `index.html`). Se não cabe num arquivo, não é exemplo — é app (vai para `showcases/`).
- Zero backend, zero fetch, zero router. Estado em memória.
- Todo exemplo roda com `vite examples/<nome>`.
- Código comentado só onde a API é não-óbvia. O resto deve ser auto-evidente.
- Sem libs externas além de `@preact/signals-core`. (Exceção: `carousel` pode demonstrar integração, depois.)

## Estrutura

```
examples/
  counter/          # hello world: $mount, filho reativo, on.click
  form/             # $model: text, checkbox, radio, select, + options (trim/number/lazy)
  list/             # $each keyed: add/remove/reorder, item como tupla [Comp, props]
  control-flow/     # $when / $match / $switch / $else lado a lado
  todos-style/      # app pequeno com mini-q/style: bloco, parts, flags, breakpoints
  ui/               # componentes primitivos estilo radix (um por arquivo)
    button.ts       # style: bloco + variants (size, tone) — base dos outros
    toggle.ts       # signal interno + $aria + pressed flag
    popover.ts      # $useTeleport + clickOutside + $aria
    accordion.ts    # lista de seções: $show + roving tabindex (backlog) como demo
    dialog.ts       # dialog nativo + focus trap manual + $aria-modal
    tabs.ts         # $switch + aria roles
```

## Cobertura → qual exemplo prova o quê

| Feature | Exemplo |
|---|---|
| `$mount` + filho reativo `() =>` | counter |
| `on` com `$handle` + modificadores | counter (`keys`, `prevent`) |
| `$prop` reativa (`$disabled` etc.) | form |
| `$model` (5 modos) + options | form |
| `$each` keyed + reorder | list |
| `$when`/`$match`/`$switch`/`$else` | control-flow |
| `Component` setup + props tipadas | list (item), ui/* |
| `class`/`$class` (ClassValue) | todos-style |
| style: bloco + parts + flags + variants | ui/button, todos-style |
| style: breakpoints + `media()` | todos-style |
| `$useTeleport` + `clickOutside` | ui/popover |
| `$aria`/`aria` | ui/toggle, ui/dialog, ui/tabs |
| `use` (behavior custom) | list (ex.: behavior `animate-in`) |
| lifecycle (`$onMounted`/`$onUnmounted`) | ui/popover |
| custom event próprio (`$registerCustomEvent`) | ui/accordion (ou exemplo extra) |

## Ordem sugerida

1. `counter` — 20 linhas, valida o fluxo whole-loop (adapter → mount → signal → unmount)
2. `ui/button` — prova o engine de style com 1 componente
3. `form` — `$model` é a feature mais pedida
4. `list` — `$each` keyed é onde a reconciliação brilha (e onde tem os edge cases)
5. `ui/popover` — integra teleport + clickOutside + aria (mais complexo, depois dos básicos)

## E2E (Playwright)

Cada exemplo com interação ganha um `*.spec.ts`. Vitest/jsdom continua para lógica pura; Playwright cobre o que o jsdom mascara (prop readonly, foco, scroll, pointer, layout).

**Setup (uma vez, na raiz):**

```bash
npm i -D @playwright/test
npx playwright install chromium   # já tem em ~/.cache/ms-playwright
```

`playwright.config.ts` na raiz, servindo cada exemplo com o Vite:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './examples',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://localhost:5173' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
});
```

> Alternativa mais limpa: um `webServer` por projeto (`projects: [{ name: 'counter', webServer: { command: 'vite examples/counter --port 5201' } }]`), mas começar com um único server e rotas por exemplo (`/counter/`, `/form/`) é mais simples.

**Regras:**
- Spec vive ao lado do exemplo (`examples/counter/counter.spec.ts`).
- 1–3 asserts por spec, no máximo: provar a interação, não cobrir a API (isso é do Vitest).
- Nomear pelo comportamento: `'incrementa ao clicar'`, `'reordena sem perder foco do input'`.
- Sem `page.waitForTimeout` — usar `expect(locator).toHaveText(...)` etc. (auto-wait).

**O que cada spec prova (mínimo):**

| Exemplo | Assert chave |
|---|---|
| counter | texto muda ao clicar; sem reload |
| form | digitar reflete no signal (e nas options: `trim`, `number`) |
| list | add/remove/reorder mantêm identidade do nó (foco não pula) |
| control-flow | toggle não remonta irmãos; `$else` aparece no fallback |
| todos-style | classe da variant aplicada; breakpoint muda ao redimensionar viewport |
| ui/popover | abre via teleport, fecha com clickOutside, foco preso dentro |
| ui/dialog | `Esc` fecha; foco volta ao trigger |
| ui/tabs | seta direita/esquerda navega (roving tabindex), painel correto visível |

Esses specs são também os **testes de regressão** dos bugs que o jsdom esconde (o `input list` readonly, o foco no reorder do `$each`, o debounce em elemento desmontado).

## Não-objetivos

- Não replicar o Radix inteiro. Só o suficiente para mostrar que a API comporta esse padrão.
- Não adicionar roteamento, SSR, ou state manager.
- Não usar `old-my-query/` como referência de API — superfície atual é o USAGE.
