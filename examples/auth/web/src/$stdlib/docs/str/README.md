# Str

Casing de strings: kebab, camel, primeira letra. Classe estática `Str`. Isolado — não depende de outros módulos da `$stdlib`.

Em vez de `kebabCase` / `camelCase` duma toolkit, ou de um helper solto por ecrã, a fachada é `Str`. Não é slug de URL. [Obj.isEmpty](../obj/) é só objecto (ou `null` / `undefined`). `Str.isEmpty` é só `=== ''`.

Uma chave de i18n ou um modo da API chega em `ON_SITE` / `notCertified`. O caminho feliz é `Str.kebabCase` ou `Str.camelCase`.

```ts
import { Str } from '.../str';

Str.kebabCase('notCertified');
// 'not-certified'

Str.camelCase('ON_SITE');
// 'onSite'
```

---

## Como passar a kebab-case

`Str.kebabCase` parte em limites camel, `_`, espaço e `-`, e junta em minúsculas com hífen. String vazia continua vazia.

```ts
Str.kebabCase('notCertified');
// 'not-certified'

Str.kebabCase('foo_bar');
// 'foo-bar'
```

```ts
Str.kebabCase('');
// ''
```

---

## Como passar a camelCase

A mesma partição. A primeira palavra fica minúscula; as seguintes começam com maiúscula.

```ts
Str.camelCase('ON_SITE');
// 'onSite'

Str.camelCase('not-certified');
// 'notCertified'
```

---

## Como capitalizar

O primeiro carácter fica maiúsculo; **o resto, minúsculo**. `''` → `''`.

```ts
Str.capitalize('ada');
// 'Ada'

Str.capitalize('ADA');
// 'Ada'
```

---

## Quando não é string

`kebabCase`, `camelCase` e `capitalize` **lançam** se o valor não for string. Não há coerção. `null` conta como `null` na mensagem, não `object`.

```ts
Str.kebabCase(null);
// throws Expected string, got null

Str.camelCase(1);
// throws Expected string, got number
```
