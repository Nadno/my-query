# mini-q

Lib **sem build/JSX** para DOM, eventos e componentes com **reatividade granular e agnóstica**
(qualquer lib de signal, plugada por um adapter). Você cria DOM com funções (`$.div(...)`),
marca reatividade com o **prefixo `$`** nas props, e compõe com behaviors (`use`) e control-flow
(`$when`/`$each`). O CSS fica no entry opcional `mini-q/style`.

## Exemplo (30s)

```ts
import $, { $mount, $useSignal } from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { signal } from '@preact/signals-core';

$useSignal(preact); // instale o adapter UMA vez, antes de montar

const count = signal(0);

const App = () =>
  $.div({},
    $.p(() => `count: ${count.value}`),          // filho reativo
    $.button({ on: { click: () => count.value++ } }, '+'),
  );

const unmount = $mount('#app', App);
```

## Docs

- **[USAGE.md](docs/USAGE.md)** — guia completo de uso.
- **[STYLE.md](docs/STYLE.md)** — engine de CSS (`mini-q/style`): blocos, partes, variantes, breakpoints.
- **[GLOSSARY.md](docs/GLOSSARY.md)** — vocabulário (índice termo → definição).
- **[DX-MANIFESTO.md](docs/DX-MANIFESTO.md)** — por que a API é assim.
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — como funciona e onde mora o código.
- **[BACKLOG.md](docs/BACKLOG.md)** — pendências e ordem sugerida.
- **[DOCS-PLAN.md](docs/DOCS-PLAN.md)** — estado da campanha de docs.
- **Propostas de design** — [docs/proposals/](docs/proposals/).

> A superfície em dia é o **[USAGE](docs/USAGE.md)**; o profundo do estilo está no
> [STYLE](docs/STYLE.md) e o vocabulário no [GLOSSARY](docs/GLOSSARY.md). O que falta / a próxima ordem:
> [BACKLOG](docs/BACKLOG.md).
