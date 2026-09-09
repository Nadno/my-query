# `$stdbrowser`

Primitivos JS que **precisam do DOM / Web API de browser**, sem framework. Irmão da `$stdlib`, que é agnóstica de ambiente e corre em Node.

Esta pasta (`docs/`) é a leitura do código que a rodeia. Copiar o directório da `$stdbrowser` leva os primitivos e a documentação.

---

## Porque existe

Helpers de DOM espalham-se: trap de foco copiado de modal para modal, índice de setas no componente, `fetch` + parse + timeout à mão. A `$stdbrowser` é o *como* cego — primitivo sem Vue. O host decide o *quando* (composable, ciclo de vida). **Substitui, não soma.**

`AbortSignal` é JS (Node) — não entra aqui; o que sabe de `Request` / `HTMLElement` / `Storage`, sim.

Já existem [Fetcher](fetcher/), [FocusScope](focus-scope/), [RovingIndex](roving-index/), [FocusGrid](focus-grid/) e [Storage](storage/). Processo e filtro: [ROADMAP.md](ROADMAP.md).

---

## Ideia em um ecrã

```ts
import { Fetcher } from '.../fetcher';
import { FocusScope } from '.../focus-scope';
import { Storage } from '.../storage';

const api = Fetcher.create({ credentials: 'include', timeout: 30_000 });
await api.get('/api/items');

const scope = FocusScope.of(dialogEl).activate();
scope.deactivate();

const prefs = Storage.local.create('prefs', { done: false });
prefs.set('done', true);
```

O alias de import (`@/$stdbrowser` ou outro) é convenção do host, não da lib. Vue fica no host; a `$stdbrowser` não o importa.

---

## Tarefa → módulo

| Quero… | Módulo |
|--------|--------|
| Cliente HTTP (`fetch`, timeout, parse) | [fetcher/](fetcher/) |
| Confinar o foco num diálogo | [focus-scope/](focus-scope/) |
| Índice numa lista 1D (tabs, menu) | [roving-index/](roving-index/) |
| Grelha 2D (setas, 7 colunas) | [focus-grid/](focus-grid/) |
| Persistir JSON (local / session / cookie) | [storage/](storage/) |
| Processo e o que não entra | [ROADMAP.md](ROADMAP.md) |

---

## O que não meter aqui

- JS que corre em Node sem DOM — isso é `$stdlib` (`Result`, `HttpQuery`, `Task`)
- Chamadas Neolude (`/api/...` de entidade, wire) — isso é `$sdk`
- Composables Vue, stores Pinia, i18n, `aria-*`
- Progresso de upload (XHR) — o `fetch` não substitui

---

## Cobertura

| Módulo | Estado |
|--------|--------|
| Fetcher | feita — papel, verbs, URL, FormData, `send`, middleware, erros |
| FocusScope | feita — diálogo, LIFO, `inert`, peças |
| RovingIndex | feita — lista 1D, loop, overflow |
| FocusGrid | feita — colunas, overflow vs `onMove`, `refresh` |
| Storage | feita — namespace, storageState, bag, cookie, `patch` vs `set` |
