# HttpQuery

GET memoizado: a mesma chave não volta à rede enquanto o TTL viver, e pedidos em voo partilham a Promise. Classe `HttpQuery` (instância). Por baixo: [Cache](../cache/) + [Obj.identity](../obj/) + [Result](../result/).

Em vez de cachear no cliente HTTP, ou de um `Map` de Promises no store, o consumidor passa um handler (`() => listItems()`). Não é uma SDK. `AbortSignal` é opt-in em `handle` — o handler é quem o mete no `fetch`. Não há timeout na Query: o limite do pedido vive no transporte.

Dois sítios pedem a mesma lista. O caminho feliz é uma linha: `handle` devolve `Result`. Não há `tryHandle` nem tipo `{ data, error }`.

```ts
import { HttpQuery } from '.../http-query';

const query = new HttpQuery();
const [data, error] = await query.handle(
  ['items'],
  (_params, _key, signal) => listItems(signal),
  {
    ttl: '5m',
    signal,
  },
);
```

TTL **não** recarrega sozinho. Voltar a pedir depois de uma mutação é `invalidate` (ou `invalidatePrefix`) e outro `handle`.

---

## Como pedir com cache

A chave é `Obj.identity(params)` — a mesma string que `Obj` já documenta; HttpQuery não tem `identity` próprio. `handle` corre o handler, envolve throws como `Result.try` (`Error` ou `new Error(String(e))`) e devolve `Promise<AnyResult<T>>`. Pedidos simultâneos com os mesmos `params` reutilizam a Promise (`Cache.getOrSet`).

```ts
await query.handle(
  ['user', id],
  ([, userId], _key, signal) => fetchUser(userId, signal),
  {
    ttl: '5m',
    signal,
  },
);
```

```ts
await Promise.all([
  query.handle(['items'], listItems),
  query.handle(['items'], listItems),
]);
// listItems corre uma vez
```

Se o handler falhar (incluindo abort e timeout do transporte), o resultado **não** fica em cache: a chave é invalidada num microtask (os waiters da mesma Promise ainda vêem o `fail`). A chamada seguinte volta a executar o handler. `ttl` é o mesmo `TimeInput` do Cache (`'5m'`, milissegundos, ou omitido = não expira).

Signal já abortado → `fail` sem correr o handler. Signal abortado **a meio do voo** → este waiter recebe `fail` sem esperar o handler, e a chave é invalidada na hora. O handler em voo pode ainda completar; esse resultado não volta a ser cacheado. `handle` não cria `AbortController` nem aborta o trabalho partilhado — o `fetch` continua a ser do handler.

Dois `handle` com os mesmos params partilham o trabalho. Abortar **um** signal não rejeita o outro: o segundo waiter ainda recebe o valor se o handler completar.

```ts
const first = query.handle(['items'], listItems, { signal: ac.signal });
const second = query.handle(['items'], listItems);
ac.abort();
// first → fail AbortError; second ainda espera listItems (uma chamada)
```

---

## Como invalidar

`invalidate(params)` remove a chave exacta. `invalidatePrefix(params)` **não** é `startsWith` na identity JSON — isso é o [Cache](../cache/). `["user"]` **não** é prefixo de `["user-admin", 1]`. Match: a chave é igual a `identity(params)` **ou**, se a identity for um array (`[...`), começa por `identity(params)` sem o `]` final mais uma vírgula. Assim `['user']` invalida `['user', 1]` e não `['user-admin', 1]`.

```ts
query.invalidate(['items']);
query.invalidatePrefix(['user']);
```

`invalidatePrefix` olha só para os **primeiros** elementos do array. `['user']` invalida `['user', 1]` porque o segundo começa com o primeiro. Não invalida `['admin', 'user']` — `'user'` não está no início.

```ts
query.invalidatePrefix(['user']);
// invalida ['user', 1]
// NÃO invalida ['user-admin', 1]
// NÃO invalida ['admin', 'user']
```

`clear` esvazia o cache (use nos testes). `dispose` faz o mesmo. O `Cache` interno é privado.
