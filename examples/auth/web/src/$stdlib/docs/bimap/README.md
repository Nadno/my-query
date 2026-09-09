# BiMap

Tabela de linhas com várias codificações do mesmo conceito — chave de domínio, código curto, id numérico — num único sítio. Forward com `get`; reverso com `keyBy` por coluna. Em vez de objectos paralelos (`key → code`, `key → id`) mais mapas reversos à mão que têm de ser mantidos em sincronia.

Tens `STATUS → code` num record e `STATUS → numericId` noutro, e ainda um `code → STATUS` ou `numericId → STATUS` feito com `Object.entries().reduce()`. Um quarto valor obriga a tocar em três ou quatro sítios; esquecer um reverso converte em lookup mudo. `BiMap.rows` guarda uma linha por chave de domínio; os índices reversos derivam na carga.

```ts
import { BiMap } from '.../bimap';

const STATUS = BiMap.rows({
  ACTIVE: { code: 'ACT', numericId: 1 },
  INACTIVE: { code: 'INA', numericId: 2 },
});

STATUS.get('ACTIVE').code;      // 'ACT'
STATUS.get('ACTIVE').numericId; // 1
```

---

## Forward e reverso

`get(key)` devolve a linha inteira. `keyBy(column, value)` resolve a chave de domínio a partir de uma coluna — útil quando o input externo traz o código ou o id, não a chave interna.

```ts
STATUS.keyBy('code', 'ACT');       // 'ACTIVE'
STATUS.keyBy('numericId', 1);      // 'ACTIVE'
STATUS.keyBy('code', 'MISSING');   // undefined
```

`keys` lista as chaves de domínio. `column(name)` lista os valores únicos de uma coluna, na ordem das chaves. `has(key)` estreita `unknown` para chave válida antes de chamar `get`.

```ts
if (STATUS.has(inputKey)) {
  STATUS.get(inputKey).numericId;
}
```

---

## Duplicado na carga

Cada coluna indexada tem de ser **única** entre as linhas. Valor repetido em `BiMap.rows(...)` **lança** na construção — o erro aparece ao carregar o módulo, não num lookup silencioso depois.

```ts
BiMap.rows({
  A: { code: 'X', numericId: 1 },
  B: { code: 'X', numericId: 2 },
});
// lança: duplicate value "X" in column "code"
```

`keyBy` sem correspondência devolve `undefined`; o consumidor ramifica. Aliases (muitos nomes → um código), classificadores muitos→um e mapas de DTO inteiros ficam fora deste primitive.
