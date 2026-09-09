# Pattern

Escolher um valor entre ramos — literal, condição sobre um valor, ou vários predicados independentes. Em vez de `switch`/`if` soltos no host, ou helpers de match sem tipos apertados e sem regra única para função-resultado.

Precisas mapear um papel a permissões, ou derivar um rótulo de estado a partir de flags que não cabem num único valor. `Pattern.match` cobre literais; `Pattern.when` cobre cadeias condicionais (fluent ou array).

```ts
import { Pattern } from '.../pattern';

Pattern.match(role, {
  admin: 'full',
  guest: 'read',
  _: 'none',
});
```

---

## Literais com `match`

Chave stringificada; fallback `_`. Função-resultado recebe o **valor** comparado.

```ts
Pattern.match(status, {
  idle: 'ready',
  busy: (value) => `working:${value}`,
  _: 'unknown',
});
```

Sem `_` e sem caso correspondente → `undefined`.

---

## Um valor — `when` fluent

First match wins. `.else` (ou `.or` / `.default`) fecha a cadeia. Função-resultado recebe o **valor**.

```ts
Pattern.when(status)
  .is((value) => value === 'loading', '…')
  .is((value) => value === 'error', () => retry())
  .else('idle');
```

---

## Vários predicados — `when` array

Quando não há um único valor — várias variáveis, estado da UI, refs — passa um array de `{ when, then }`. `then` função é **thunk** (sem argumentos; a closure captura o contexto).

```ts
const label = Pattern.when(
  [
    { when: () => isLoading, then: () => 'loading' as const },
    { when: () => progress >= 100, then: () => 'complete' as const },
  ],
  'idle' as const,
);
```

Ordem importa: o primeiro `when()` verdadeiro ganha. O segundo argumento é o fallback quando nenhum ramo casa.

---

## O que fica fora

`enum` / `define` utilitários do dump antigo — sem consumidor nesta base. Aliases e classificadores muitos→um usam outro primitive ou código de domínio.
