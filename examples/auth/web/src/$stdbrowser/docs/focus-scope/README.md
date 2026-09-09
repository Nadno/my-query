# FocusScope

Gerência de foco numa região do DOM. Classe `FocusScope`. Separado de decisões de acessibilidade (`aria-*`, `role`, quando esconder) — isso é do componente que usa.

Em vez de um trap copiado de modal para modal (jQuery, globais, sentinelas à mão), o caminho feliz é `of` + `activate` / `deactivate`. O host decide *quando* o diálogo está aberto.

Um diálogo abre: captura o foco, inerta o resto da página, confina o Tab e foca o primeiro focável. Ao fechar, solta e restaura.

```ts
import { FocusScope } from '.../focus-scope';

const scope = FocusScope.of(dialogEl).activate();
scope.deactivate();
```

Crie o escopo com `FocusScope.of` **antes** de `activate`. Defaults: `trap`, `isolate`, `restoreFocus` e `autoFocus` são `true`.

---

## Como activar e desactivar

`activate` captura o foco actual, empurra o escopo para a pilha, inerta o exterior, põe sentinelas e foca o primeiro focável (ou a raiz). `deactivate` solta o trap, devolve o `inert` que **este** escopo pôs, sai da pilha e restaura o foco anterior.

```ts
const scope = FocusScope.of(dialogEl, {
  trap: true,
  isolate: true,
  restoreFocus: true,
  autoFocus: true,
}).activate();

scope.deactivate();
```

`FocusScope.current` é o topo da pilha — o que governa o Tab.

---

## Capacidades à peça

Use directo quando não quiser o pacote `activate`:

```ts
const scope = FocusScope.of(el, { trap: true, isolate: true });

scope.first();  scope.last();
scope.capture(); scope.restore();
scope.trap();    scope.release();
scope.isolate(); scope.restoreOutside();
```

---

## Modal sobre modal

Aninhamento é **LIFO**: só o topo governa. `isolate()` não mexe no que já está `inert`, então fechar na ordem devolve cada camada certa.

```ts
const outer = FocusScope.of(firstDialog).activate();
const inner = FocusScope.of(secondDialog).activate();
FocusScope.current;
// inner

inner.deactivate();
FocusScope.current;
// outer
outer.deactivate();
```

Fechar fora de ordem (o de baixo primeiro) é **limitação conhecida**: o de cima deixa de ter um exterior coerente. `aria-*` e `role="dialog"` **não** entram nesta lib.
