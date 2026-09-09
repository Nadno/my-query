# Result

Erro como valor: um tuplo Go-style `[value, error]`. Classe estática `Result`. Isolado — não depende de outros módulos da `$stdlib`.

Em vez de `try/catch` em cada call site, ou `{ ok, data }` ad-hoc, o consumidor ramifica o tuplo. `unwrap` lança; use só quando não há recuperação.

Um parse que pode falhar (`JSON.parse`, texto do utilizador) devolve Result. Discriminar `error !== null` é o caminho feliz.

```ts
import { Result } from '.../result';

const [value, error] = Result.try(() => JSON.parse('{"ok":true}'));
if (error !== null) {
  // falha
}
```

---

## Como obter um Result

`Result.ok` e `Result.fail` constroem o tuplo. O sucesso leva o valor e `error: null`. A falha leva `value: null` e o erro.

```ts
Result.ok('hello');
// ['hello', null]
```

```ts
Result.fail(new Error('missing'));
// [null, Error]
```

O consumidor discrimina com `error !== null`. Não há `map` nem `andThen` nesta versão.

---

## Como apanhar um throw

`Result.try` corre uma função síncrona. Se lançar, o resultado é `fail`. Se o throw **não** for um `Error`, envolve-o em `Error` (`message` = `String(e)`). `Result.tryAsync` faz o mesmo com uma `Promise`.

```ts
Result.try(() => JSON.parse('{"ok":true}'));
// [{ ok: true }, null]

Result.try(() => JSON.parse('nope'));
// [null, SyntaxError]
```

```ts
Result.try(() => {
  throw 'nope';
});
// [null, Error]  message = 'nope'
```

```ts
await Result.tryAsync(Promise.resolve(1));
// [1, null]
```

---

## Quando não há recuperação

`Result.unwrap` devolve o valor ou **lança** o erro. `Result.or` devolve o valor ou um fallback — não lança.

```ts
Result.unwrap(Result.ok(9));
// 9

Result.unwrap(Result.fail(new Error('x')));
// lança Error: x
```

```ts
Result.or(Result.fail(new Error('x')), 'fallback');
// 'fallback'
```

Tipos exportados: `Ok<T>`, `Fail<E>`, `AnyResult<T, E = Error>`.
