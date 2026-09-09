# Fetcher

Um pedido HTTP: `fetch`, middleware, parse. Classe `Fetcher` (instância). Isolado nesta pasta — não depende de [FocusScope](../focus-scope/).

Em vez de `fetch` + `res.json()` + timeout à mão, ou de um cliente tipo axios/ky com cache embutido, crie o cliente com `Fetcher.create` **antes** do primeiro verb. Não é cache nem dedup: isso é HttpQuery na `$stdlib`. Daqui sai `T` ou um throw.

Um cliente da API com cookies e limite de 30s. O caminho feliz é uma linha depois do `create`: `get` devolve JSON.

```ts
import { Fetcher, HttpError } from '.../fetcher';

const api = Fetcher.create({ credentials: 'include', timeout: 30_000 });
const item = await api.get<{ id: number }>('/api/items/1');
```

---

## Como criar o cliente

`Fetcher.create` guarda `credentials`, `timeout` (milissegundos) e `headers` por omissão. Sem `timeout`, ou com `timeout <= 0`, o pedido não tem limite da lib. `use` acrescenta middleware **nesta** instância e devolve `this` — não há `extend`.

```ts
const api = Fetcher.create({
  credentials: 'include',
  timeout: 30_000,
  headers: { Accept: 'application/json' },
});
```

```ts
const raw = Fetcher.create();
await raw.get('/api/items/1');
```

O segundo cliente usa os defaults do `fetch`: sem cookies forçados, sem timeout.

---

## Como pedir JSON

Os verbs (`get` / `post` / `put` / `patch` / `delete`) parseiam sempre. 2xx com JSON → objecto. 204, ou body vazio (incluindo espaços), → `undefined`. GET e HEAD **não** enviam body, mesmo que passe um.

```ts
await api.get<Item[]>('/api/items');
await api.post<{ id: number }>('/api/items', { name: 'n' });
```

```ts
await api.post('/api/side');
// 204 ou body vazio → undefined
```

`put` e `patch` levam o body no segundo argumento, como `post`. `delete` só leva URL e options.

---

## Como preencher o path e a query

A URL é uma string **ou** uma tupla `[padrão, params]`. Os `params` da tupla são segmentos (`:userId`); faltando ou sobrando uma chave, o pedido **nem sai** — lança `Missing path param "…"` ou `Unexpected path param "…"`. Os valores passam por `encodeURIComponent`.

`params` nas **options** é a querystring. Não se chama `query`. `undefined` e `null` não entram. Se a URL já tiver `?`, a query acrescenta-se com `&`.

```ts
await api.get(['/api/users/:userId', { userId: 9 }]);
await api.get(['/api/users/:userId', { userId: 'a/b' }]);
// path: /api/users/a%2Fb
```

```ts
await api.get('/api/items', {
  params: { page: 1, empty: undefined, gone: null },
});
// ?page=1
```

URL absoluta `http://` ou `https://` fica intacta. Relativa resolve contra `location.href`; sem `location` (testes em Node), contra `http://localhost/`.

---

## Como mandar FormData

Objecto plano → `JSON.stringify` e `Content-Type: application/json`, salvo o pedido já trazer esse header. `FormData`, `Blob`, `URLSearchParams`, `ArrayBuffer` e vistas de buffer passam intactos — a lib **não** força JSON. String no body vai crua, sem Content-Type extra.

```ts
const form = new FormData();
form.set('Name', 'n');
await api.post('/api/upload', form);
```

```ts
await api.post('/api/items', { name: 'n' });
// Content-Type: application/json
```

---

## Como obter o Response

`send` devolve o `Response` sem parse. Continua a lançar se `!ok`. Use quando precisa de headers ou de um body que não é JSON. Vazio e 204 já são `undefined` nos verbs — não precisa de `send` para isso.

```ts
const res = await api.send('/api/health');
await res.text();
```

```ts
await api.send('/api/missing', { method: 'GET' });
// !ok → HttpError (status 404); o Response vai em error.response
```

---

## Como interceptar

Um `(ctx, next)`. Antes de `next()`, mude `ctx.request` (headers, signal). Depois, `ctx.response` existe. O body lê-se **uma vez**: no middleware, só com `response.clone()`. `next()` duas vezes lança. Sem `next()`, não há `fetch` — a chamada falha com `Fetcher middleware finished without a response`.

```ts
api.use(async (ctx, next) => {
  ctx.request.headers.set('X-Req', '1');
  await next();
  if (ctx.response?.status === 401) {
    // o host decide
  }
});
```

```ts
api.use(async (ctx, next) => {
  await next();
  const peeked = await ctx.response?.clone().json();
  console.log(peeked);
});
await api.get('/api/items/1');
// o get ainda recebe o JSON parseado
```

---

## O que acontece quando falha

`!ok` → `HttpError`: `name` é `HttpError`, `message` é `HTTP ${status}`, `status` é o código, `response` é o `Response` intacto (ainda pode ler o body de erro). Rede = a rejeição do `fetch`. JSON inválido em 2xx → `SyntaxError` do `JSON.parse`.

```ts
try {
  await api.get('/api/items/1');
} catch (e) {
  if (e instanceof HttpError) {
    e.status;
    await e.response.json();
  }
}
```

Timeout no `create` usa `AbortSignal.timeout`. Se o pedido também trouxer `signal`, os dois combinam (`AbortSignal.any`, ou um `AbortController` se `any` não existir): abortar o caller aborta o `fetch`.

```ts
const api = Fetcher.create({ timeout: 30_000 });
const ac = new AbortController();
await api.get('/api/ping', { signal: ac.signal });
ac.abort();
```

Tipos exportados: `FetchUrl`, `FetcherCreateOptions`, `FetcherRequestOptions`, `FetcherSendOptions`, `FetchContext`, `FetcherMiddleware`, `HttpError`.
