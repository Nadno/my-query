# Storage

Persistência JSON no browser: um documento por chave, schema = os defaults. Fachada `Storage` (`local` / `session` / `cookie`). Isolado nesta pasta — não depende de [Fetcher](../fetcher/). `patch` junta objectos com [Obj.merge](../../../$stdlib/docs/obj/) da `$stdlib`.

Em vez de `JSON.parse` / `JSON.stringify` à mão em `localStorage`, ou de um helper de cookie que mistura encoding, `Max-Age` e quota, o caminho feliz é `Storage.local.create` **antes** do primeiro `set`. Não é estado Vue nem cache HTTP: o disco (ou o cookie) é o sítio.

Preferências com `{ done: false }`. `create` não escreve; o primeiro `set` grava o documento.

```ts
import { Storage } from '.../storage';

const prefs = Storage.local.create('prefs', { done: false });
prefs.set('done', true);
```

```ts
Storage.local.set('flag', true);
const flag = Storage.local.get<boolean>('flag');
```

O segundo bloco é a **excepção**: uma chave solta (bag), sem schema. Não misture a mesma string como namespace e como bag.

`import { Storage }` sombreia o tipo DOM `Storage` **nesse** ficheiro. O global continua em `globalThis.Storage`.

---

## Como criar um namespace

`create(namespace, defaults)` lê a chave uma vez. Os `defaults` **são** o schema: só essas chaves entram no documento. Se a chave não existe, `storageState()` é `'defaults'` e **nada** se escreve até ao primeiro `set` / `patch`.

```ts
const prefs = Storage.local.create('prefs', { done: false });
prefs.storageState(); // 'defaults'
prefs.get('done'); // false
```

Um segundo `create` no mesmo namespace lê o disco outra vez. As duas instâncias **não** partilham memória: um `set` na segunda não actualiza a primeira. Não há pub/sub nem evento `storage`.

```ts
const first = Storage.local.create('prefs', { n: 0 }).set('n', 1);
const second = Storage.local.create('prefs', { n: 0 });
second.set('n', 2);
first.get('n'); // 1
Storage.local.create('prefs', { n: 0 }).get('n'); // 2
```

---

## Como ler e gravar

`get` devolve uma **cópia** JSON. Mutar o resultado não muda o documento nem os defaults. `set` substitui **um** campo e persiste o documento inteiro. `patch` aplica várias chaves do schema de uma vez. Chaves fora do schema são ignoradas. `undefined` no partial **não** apaga — a chave é skip.

O valor que entra em `set` / `patch` também é copiado: mutar o objecto **depois** da chamada não muda o que está gravado.

```ts
const prefs = Storage.local.create('prefs', { done: false, extra: 'x' });
prefs.get('done');
prefs.set('done', true);
prefs.patch({ extra: 'y' });
```

```ts
const inbound = { snooze: 1, timestamp: 0 };
const poll = Storage.local.create('poll', {
  bar: { snooze: 0, timestamp: 0 },
});
poll.set('bar', inbound);
inbound.snooze = 9;
poll.get('bar').snooze; // 1
```

`clear` apaga a chave e restaura os defaults **em memória**. Não persiste os defaults. `storageState()` volta a `'defaults'`.

A cópia é `JSON.parse(JSON.stringify)`: uma propriedade `undefined` some; um `Date` vira string ISO.

---

## Como o `patch` junta e o `set` substitui

Por cada chave do schema, se o valor actual e o incoming são objectos (não array), `patch` faz o mesmo merge que `Obj.merge`: profundo, o segundo sobrescreve, **arrays substituem**. Depois clona, para não partilhar refs. `set` no campo substitui o valor inteiro — irmãos aninhados desaparecem.

```ts
const poll = Storage.local.create('poll', {
  bar: { snooze: 0, timestamp: 0 },
  byPollId: { '1': 0 } as Record<string, number>,
  items: [1, 2],
});
poll.patch({ bar: { snooze: 1 } });
poll.get('bar'); // { snooze: 1, timestamp: 0 }

poll.patch({ byPollId: { '2': 1 } });
poll.get('byPollId'); // { '1': 0, '2': 1 }

poll.patch({ items: [3] });
poll.get('items'); // [3] — não concatena
```

```ts
poll.set('bar', { snooze: 9 });
poll.get('bar'); // { snooze: 9 } — timestamp some

poll.set('byPollId', { '9': 1 });
poll.get('byPollId'); // { '9': 1 } — para apagar uma chave do mapa, substitua o mapa
```

Num documento com muitos campos, `patch` dum só não repor os outros aos defaults; `set` dum campo não apaga os restantes. Um `create` novo lê o documento completo.

---

## Como ler `storageState`

`storageState()` (namespace) e `Storage.local.storageState(key)` (bag) devolvem `'defaults'` ou `'persisted'`. A mesma forma: sempre método.

- `'defaults'` — miss, JSON inválido, ou (no namespace) documento que não é objecto. Nada de útil no disco.
- `'persisted'` — havia JSON válido (no namespace: um objecto, mesmo que faltem chaves do schema).

JSON inválido e não-objecto (`true`, `[]`) **apagam** a chave. O `create` que recuperou e o seguinte vêem `'defaults'`: o wipe não deixa rasto. Não há um terceiro valor.

Campo novo no schema: o default desse campo; `storageState()` do documento continua `'persisted'`. Depois de `set` / `patch` é `'persisted'`; depois de `clear` é `'defaults'`.

```ts
const prefs = Storage.local.create('prefs', { done: false });
prefs.storageState(); // 'defaults' — chave ausente, nada escrito
```

```ts
// disco: { "done": true }  → 'persisted', extra vem do default
Storage.local.create('prefs', { done: false, extra: 'x' }).get('extra'); // 'x'

// disco: true  ou  []  → 'defaults', chave removida
```

---

## Como usar o bag (excepção)

Sem schema: `Storage.local.set` / `get` / `delete` / `storageState` na chave. `get(key, fallback)` **não** escreve. JSON inválido é miss e a chave some.

JSON `null` é `'persisted'` com valor `null`. Miss (chave ausente) é `undefined` — não é o mesmo.

```ts
Storage.local.set('flag', true);
Storage.local.get<boolean>('flag'); // true
Storage.local.get('missing', false); // false — disco continua vazio
Storage.local.delete('flag');
```

```ts
Storage.local.set('flag', null);
Storage.local.storageState('flag'); // 'persisted'
Storage.local.get('flag'); // null
Storage.local.get('missing'); // undefined
```

O bag também clona: objectos e arrays aninhados que `get` devolve são cópia. Os três adaptadores têm bag (`local`, `session`, `cookie`).

---

## Como escolher o adaptador

`Storage.local` → `localStorage`. `Storage.session` → `sessionStorage`. `Storage.cookie` → `document.cookie`. A mesma string de chave **não** se partilha entre adaptadores.

```ts
Storage.local.create('ns', { n: 1 }).set('n', 2);
Storage.session.create('ns', { n: 1 }).set('n', 3);
Storage.local.create('ns', { n: 0 }).get('n'); // 2
Storage.session.create('ns', { n: 0 }).get('n'); // 3
```

```ts
Storage.session.set('flag', 1);
Storage.session.get('flag'); // 1
Storage.local.get('flag'); // undefined
```

---

## Como gravar em cookie

Opções no `create` definem a identidade: `path` e `domain` **só** daí. Num `set` / `patch` / `clear` (ou num write de bag) pode mudar `maxAge`, `sameSite` e `secure`. Sem `maxAge` é cookie de sessão. Não há `HttpOnly` (JS não o define) nem `commit`.

`maxAge` é um **número em segundos**. Nos exemplos, [TimeSpan](../../../$stdlib/docs/time-span/) da `$stdlib` evita magia (`86400`); a API não aceita um `TimeSpan`.

O nome da chave passa por `encodeURIComponent`: `neolude::prefs` round-trip. Payload (documento ou bag) acima de ~3500 bytes lança `RangeError` — o mesmo teto nos dois writes.

```ts
import { TimeSpan } from '.../time-span';

const prefs = Storage.cookie.create(
  'neolude::prefs',
  { done: false },
  { maxAge: TimeSpan.parse('1d').totalSeconds, path: '/' },
);
prefs.set('done', true, { maxAge: TimeSpan.parse('1m').totalSeconds });
```

```ts
Storage.cookie.set('flag', true, {
  maxAge: TimeSpan.parse('1d').totalSeconds,
});
Storage.cookie.create('ns', { blob: '' }).set('blob', 'x'.repeat(4000));
// RangeError
```

---

## Como não colidir namespace e bag

A chave é uma string no mesmo sítio. Último write ganha. Se o bag gravar um não-objecto em cima do documento, o próximo `create` trata lixo: `'defaults'` e apaga a chave.

```ts
Storage.local.create('same', { a: 1 }).set('a', 2);
Storage.local.get<{ a: number }>('same'); // { a: 2 } — bag lê o documento
```

```ts
Storage.local.set('same', true);
Storage.local.create('same', { a: 0 }).storageState(); // 'defaults'
Storage.local.create('same', { a: 0 }).get('a'); // 0
```

Use **ou** `create` **ou** `set`/`get` naquela string, não os dois.
