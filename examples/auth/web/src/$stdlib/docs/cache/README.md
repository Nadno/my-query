# Cache

Mapa em memória com TTL. Classe `Cache` (instância). O relógio do TTL vem de [TimeSpan](../time-span/) (`TimeInput`: `300000` ou `'5m'`). [HttpQuery](../http-query/) guarda Promises neste mapa; não mexe no `Map` à mão.

Em vez de um `Map` no store (sem expirar, sem `clear` nos testes), o caminho feliz é `getOrSet`. Sem `ttl`, a entrada não expira. O valor por omissão quando se passa TTL é cinco minutos (`Cache.DEFAULT_TTL` = `TimeSpan.fromMinutes(5)`).

Um GET caro corre uma vez enquanto o TTL viver. A fábrica só dispara em miss ou depois de expirar.

```ts
import { Cache } from '.../cache';

const cache = new Cache<string>();
cache.getOrSet('item:1', () => loadItem(), { ttl: '5m' });
```

---

## Como guardar com TTL

`set` / `get` / `has` / `getOrSet`. `ttl` é `TimeInput`: número = milissegundos; string = o mesmo que `TimeSpan.parse` — formato inválido **lança**. `getOrSet` corre a fábrica só em miss ou depois de expirar.

```ts
cache.getOrSet('item:1', () => loadItem(), { ttl: '5m' });
cache.getOrSet('item:2', () => loadItem(), { ttl: Cache.DEFAULT_TTL });
```

```ts
cache.set('k', 1, { ttl: 'nope' });
// lança Invalid TimeSpan format
```

`has` e `get` apagam a entrada se o TTL já passou. `Date.now()` no instante **exacto** da expiração conta como expirado (TTL `1000` ms: aos 999 ainda há valor; aos 1000 já não).

---

## Como invalidar

`invalidate(key)` remove uma chave. `invalidatePrefix(prefix)` só olha para chaves **string** e usa `startsWith` — não interpreta JSON. Chave numérica não casa. `clear` esvazia o mapa (use nos testes entre casos). `dispose` faz o mesmo; depois não reutilizar a instância.

Isto **não** é o prefixo do [HttpQuery](../http-query/): lá `['user']` não invalida `['user-admin', 1]`. Aqui `'user:'` casa `'user:1'` e não casa `'admin:1'`.

```ts
cache.invalidate('item:1');
cache.invalidatePrefix('item:');
cache.clear();
```

O `store` é privado. Quem precisa de esvaziar o mapa chama `clear`, não o `Map`.

---

## Como memoizar uma função

`Cache.memoize(fn, options)` envolve uma função num cache com chave por `Obj.identity` dos argumentos. TTL opcional. A função devolvida tem `.clear()` para invalidar todo o cache.

```ts
const format = Cache.memoize(
  (locale: string, options: object) => new Intl.NumberFormat(locale, options),
  { ttl: '5m' },
);

format('pt-BR', { style: 'unit', unit: 'minute' });
format('pt-BR', { style: 'unit', unit: 'minute' }); // cache hit
```

```ts
const byId = Cache.memoize(
  (model: { id: number }) => load(model.id),
  { keyFn: (model) => String(model.id) },
);
```

Sem TTL, a entrada vive até a função ser libertada. Quem precisa de TTL ou invalidação explícita é `Cache` normal; quem precisa só de memoizar resultados de função é `Cache.memoize`.
