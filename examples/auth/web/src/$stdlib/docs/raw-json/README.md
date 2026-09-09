# RawJSON

Literais JSON-like em **texto** (`"true"` / `"12"` / `"null"`). Classe estática `RawJSON`. Isolado — não depende de outros módulos da `$stdlib`.

Em vez de `value === 'true'` no parse de env, ou de `JSON.parse` em cima de um recorte que não é objecto, o caminho feliz é `RawJSON.parse('true')`. Não é `JSON.parse` de objectos ou arrays. Não é [Type](../type/) (tag de um valor já parseado). Objecto ou array em JSON → `JSON.parse`, não esta classe.

Um env ou um query param chega como string. `"true"` e `"12"` têm de virar boolean e number; uma URL tem de ficar URL.

```ts
import { RawJSON } from '.../raw-json';

RawJSON.parse('true');
// true

RawJSON.parse('12');
// 12
```

---

## Como parsear um literal

`parse` lê a string (com trim) e devolve boolean, number ou `null` quando o texto é um desses literais. Boolean e `null` são case-insensitive. Inteiro e float aceitam sinal (`-12`, `+12.5`).

```ts
RawJSON.parse('true');
// true

RawJSON.parse('TRUE');
// true

RawJSON.parse('12');
// 12

RawJSON.parse('null');
// null
```

---

## Quando fica string

Texto que não é literal (URL, palavra, JSON de array) fica a string **original**. Sem lowercasing. `''` → `''`. Arrays não entram — `'[1,2]'` continua texto.

```ts
RawJSON.parse('https://x');
// 'https://x'

RawJSON.parse('https://Example.COM/Path');
// 'https://Example.COM/Path'
```

```ts
RawJSON.parse('[1,2]');
// '[1,2]'
```

---

## Como stringify

`stringify` passa boolean, number, `null` ou string para texto. `true` → `'true'`; `null` → `'null'`.

Valor que não é um desses primitivos **lança** (`undefined`, objecto).

```ts
RawJSON.stringify(true);
// 'true'

RawJSON.stringify(null);
// 'null'
```

```ts
RawJSON.stringify({});
// throws Expected string | boolean | number | null, got object
```

---

## Quando não é string

`parse` **lança** `Expected string, got …` se o valor não for string. Coerção não existe. `null` conta como `null` na mensagem, não `object`.

```ts
RawJSON.parse(null);
// throws Expected string, got null

RawJSON.parse(1);
// throws Expected string, got number
```
