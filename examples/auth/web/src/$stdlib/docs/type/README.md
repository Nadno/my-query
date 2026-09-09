# Type

`typeof` que distingue `null` de objecto, mais guards. Classe estática `Type`. Isolado — não depende de outros módulos da `$stdlib`.

Em vez de `typeof x === 'object'` (que é `true` para `null`) ou `isNil` duma toolkit, o caminho feliz é `Type.is(value, Type.STRING)`.

Um valor que veio de JSON ou de um form precisa de narrowing antes da conta ou do `.toUpperCase()`.

```ts
import { Type } from '.../type';

if (Type.is(value, Type.STRING)) {
  value.toUpperCase();
}
```

O literal `'string'` é o mesmo tag. Use a constante — aparece em `Type.`.

---

## Como saber o tipo

`Type.of` devolve o tag (`'null'`, `'array'`, `'object'`, `'map'`, …). `Type.is` é o mesmo teste com narrowing. As constantes (`Type.NULL`, `Type.ARRAY`, `Type.MAP`, …) são esses literais.

```ts
Type.of(null);
// 'null'

Type.is(null, Type.NULL);
// true

Type.is([], Type.OBJECT);
// false
```

`typeof null === 'object'` no JavaScript. Aqui `null` é `Type.NULL`.

```ts
switch (Type.of(value)) {
  case Type.ARRAY:
  case Type.OBJECT:
    break;
}
```

Atalhos: `isString`, `isBoolean`, `isArray`, `isPlainObject` / `isObject` (record, não array nem Date), `isDate`, `isNullOrUndefined`. Map/set/regexp: `Type.is(v, Type.MAP)` — não há `isMap`.

---

## União de tags

`Type.isOneOf` é o mesmo teste para vários tags. Não lança. Para exigir um tag e falhar, use `Type.assert.string` (etc.).

```ts
if (Type.isOneOf(value, [Type.STRING, Type.NUMBER])) {
  value;
  // string | number
}
```

```ts
Type.isOneOf(true, [Type.STRING, Type.NUMBER]);
// false
```

---

## Número: tag vs finito

`Type.is(v, Type.NUMBER)` segue o tag: `NaN` é `'number'`. `Type.isNumber` exige finito e rejeita `NaN`. Use `isNumber` quando o valor tem de ser usável em contas.

```ts
Type.is(NaN, Type.NUMBER);
// true

Type.isNumber(NaN);
// false
```

---

## Quando a pré-condição falha

`Type.assert` / `assert.string` (etc.) **lançam** se a pré-condição falha.

```ts
Type.assert.string(1);
// lança Expected string, got number
```
