# Obj

Operações sobre objectos no mesmo sítio: chave estável, vazio, recortar, juntar. Classe estática `Obj`. Lembra-se `Obj`, não o nome solto de uma toolkit.

Em vez de `JSON.stringify` com chaves à sorte (dois params iguais, duas chaves de cache) ou `omit` / `merge` importados à peça, a fachada é `Obj`. `identity` não depende de [Type](../type/). `Obj.isEmpty` é só objecto (ou `null` / `undefined`).

Uma listagem com `{ z, a }` e outra com `{ a, z }` têm de bater na mesma entrada de cache. `identity` ordena chaves a todos os níveis.

```ts
import { Obj } from '.../obj';

Obj.identity({ z: 1, a: 2 });
Obj.identity({ a: 2, z: 1 });
// a mesma string
```

---

## Como obter uma chave estável

`Obj.identity` serializa `unknown` com chaves **ordenadas a todos os níveis** (arrays incluídos). `null` / `undefined` → `''`. Serve de chave de cache para params de listagem.

```ts
Obj.identity({ z: 1, a: { b: 2, a: 1 } });
Obj.identity({ a: { a: 1, b: 2 }, z: 1 });
// a mesma string

Obj.identity(['user', 1, { withCourses: true }]);
```

Não é igualdade profunda de toolkit. `Date` serializa pelo `JSON.stringify` (ISO). `Map`, `Set` e `RegExp` são serializados pelo seu tipo e conteúdo, para não colidirem (`new Map([[1, 'a']])` e `new Set([1])` produzem chaves distintas). Uma função vira `''` (`JSON.stringify` devolve `undefined`).

---

## Como recortar e juntar

`omit` e `pick` devolvem uma **cópia rasa**; o original não muda. `merge` é profundo: o segundo sobrescreve; **arrays substituem**, não concatenam. `null` / `undefined` num dos lados: como um objecto vazio no sítio em falta.

```ts
const user = { id: 1, name: 'Ada', password: 'x' };
Obj.omit(user, ['password']);
// { id: 1, name: 'Ada' }
```

```ts
Obj.merge({ items: [1, 2], user: { name: 'Guest' } }, { items: [3] });
// { items: [3], user: { name: 'Guest' } }
```

## Como comparar e copiar

`Obj.isEqual` é igualdade **profunda** (não referência). Compara primitivos, `Date` por `getTime()`, `RegExp` por `source` + `flags`, `Map` e `Set` por conteúdo, arrays e plain objects recursivamente. `NaN` é igual a `NaN`.

```ts
Obj.isEqual({ a: { b: [1, 2] } }, { a: { b: [1, 2] } });
// true

Obj.isEqual(new Set([1, 2]), new Set([2, 1]));
// true
```

`Obj.clone` faz uma cópia **profunda** de `Date`, `RegExp`, `Map`, `Set`, arrays e plain objects. Primitivos e `null` / `undefined` devolvem o mesmo valor.

```ts
const baseline = Obj.clone({ tree: [{ name: 'A' }] });
// mudar o original não muda a cópia
```

## Como omitir por condição

`Obj.omitBy` devolve uma cópia sem as chaves onde o predicado devolver `true`. Útil para remover propriedades `null` / `undefined` antes de enviar para a rede.

```ts
Obj.omitBy({ a: 1, b: null, c: undefined }, (value) => value == null);
// { a: 1 }
```

`Obj.isEmpty({})` é `true`. Não copiar `cloneDeep` nem `get` por path — não entram nesta versão.
