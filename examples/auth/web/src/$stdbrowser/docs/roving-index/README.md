# RovingIndex

Índice activo numa **lista** (um eixo). Classe `RovingIndex`. Isolado — sem DOM, sem grelha.

Em vez de um `index++` no keydown do componente (sem overflow, sem loop), o caminho feliz é `RovingIndex.next` ou uma instância que guarda `current`.

Não é [FocusGrid](../focus-grid/) (dois eixos, células, `tabindex`). Não é [FocusScope](../focus-scope/) (trap de região).

Tabs, um menu, uma faixa: setas no **mesmo** eixo. `step` é +1 ou −1 (ou outro delta na mesma lista). Sem colunas: descer uma linha não existe aqui.

```ts
import { RovingIndex } from '.../roving-index';

RovingIndex.next({ index: 2, count: 7, step: 1 });
// { index: 3 }

const roving = RovingIndex.of(7, 2);
roving.next(1);
// { index: 3 }
```

---

## Como avançar no eixo

```ts
RovingIndex.next({ index: 2, count: 7, step: 1 });
// { index: 3 }

RovingIndex.next({ index: 2, count: 7, step: -1 });
// { index: 1 }
```

`step` pode ser maior que 1 no mesmo eixo (`+7` numa lista longa). Isso ainda não é grelha: não há `columns`.

---

## Quando sai da lista

Sem `loop`, a borda devolve overflow. A instância **não** muda `current`.

```ts
RovingIndex.next({ index: 0, count: 7, step: -1 });
// { overflow: 'before' }

RovingIndex.next({ index: 6, count: 7, step: 1 });
// { overflow: 'after' }
```

```ts
const roving = RovingIndex.of(3, 0);
roving.next(-1);
// { overflow: 'before' }
roving.current;
// 0
```

`loop: true` envolve: `0` + `−1` → último; último + `1` → `0`.

```ts
RovingIndex.next({ index: 0, count: 7, step: -1, loop: true });
// { index: 6 }
```

---

## Lista vazia

`count <= 0` é overflow (`after` se `step >= 0`, `before` se `step < 0`).

```ts
RovingIndex.next({ index: 0, count: 0, step: 1 });
// { overflow: 'after' }
```
