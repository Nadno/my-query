# FocusGrid

Grelha 2D: setas, células em ordem DOM, roving `tabindex`. Classe `FocusGrid`. Usa [RovingIndex](../roving-index/) por baixo (`±1` e `±columns`). Isolado de [FocusScope](../focus-scope/) (isso é trap/isolate de região).

Em vez de um keydown no componente que mistura linha, coluna e `tabindex`, o caminho feliz é `FocusGrid.of` + `activate`. Não é uma lista. `'both'` num eixo único não é isto — ↓ aqui é `index + columns`.

Uma grelha de 7 colunas (mês, teclado, paleta): direita/esquerda um passo, baixo/cima uma linha. Crie a grelha **antes** de `activate`.

```ts
import { FocusGrid } from '.../focus-grid';

const grid = FocusGrid.of(root, { columns: 7 }).activate();
grid.deactivate();
```

---

## Como activar

`columns` é obrigatório. `cells` escolhe as peças (omissão: `[role="gridcell"]:not([disabled])`). `initial` é índice ou selector da célula que começa com `tabindex="0"`.

```ts
FocusGrid.of(root, {
  columns: 7,
  cells: '[role="gridcell"]:not([disabled])',
  initial: 0,
}).activate();
```

O root passa a `tabindex="-1"`: o tab stop é a célula activa, não o contentor.

---

## Como as setas movem

Direita/esquerda: um passo. Baixo/cima: uma linha (`columns`). Sem wrap na linha — a borda chama `onOverflow` (`before` / `after` e o `step` da tecla) se `loop` for falso.

```ts
FocusGrid.of(root, {
  columns: 7,
  onOverflow: (edge, { step }) => {
    edge;
    // 'before' | 'after'
    step;
    // ±1 | ±columns
  },
}).activate();
```

`Tab`, `Enter` e `Escape` não são interceptados. `onMove` corre só quando a seta **mudou** de célula — não no overflow.

```ts
FocusGrid.of(root, {
  columns: 7,
  onMove: (cell) => {
    cell;
    // a célula que recebeu o foco
  },
  onOverflow: (edge, { step }) => {
    edge;
    step;
    // a seta saiu da grelha — onMove não corre
  },
}).activate();
```

O consumidor usa `step` para avançar o modelo (um dia, uma semana) e voltar a pintar. A grelha não sabe o que é um mês.

---

## O que acontece ao sair

Só a célula do índice activo tem `tabindex="0"`. Ao **mover** entre células, a anterior fica `-1`. Ao **sair** do root, esse `0` **fica** — é o sítio para voltar. Não se devolve o tab stop ao primeiro nem ao contentor.

`refresh()` relê as células depois de um re-render. Se o foco **já** está numa célula da grelha, essa célula vira o índice — `fromInitial` não conta. Se o foco está fora, `refresh(true)` volta a `initial`; `refresh(false)` (omissão) só pinta o índice actual (com clamp). Depois de pintar um mês novo, chame `refresh(false)` e foque a célula alvo.

```ts
grid.refresh(false);
```
