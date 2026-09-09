---
name: teleported-styles-engine
description: Estilos para elementos teleportados precisam de escape do contexto do pai — propostas `>name` outer e `style.scope()` com @scope CSS.
metadata:
  type: project
---

Elementos teleportados (Popover panel, Modal, Toast) são renderizados fora da árvore do componente pai, mas a engine de estilos do mini-q gera classes aninhadas/prefixadas assumindo contexto (`sPopover.panel` → `.popover__panel`). Isso quebra quando o elemento mora em `body` e vários componentes do mesmo tipo coexistem.

**Propostas de API para anotar:**

1. **`>name` no `style()`** — açúcar sintático já anotado para filhos de `parts`. Estender o significado para `<` indicar "outer"/"elemento que mora fora do pai". Exemplo:
   ```ts
   style('popover', {
     parts: {
       panel: { /* normal */ },
       '<panel': { /* gera seletor standalone, não aninhado ao pai */ },
     },
   });
   ```

2. **`style.scope('inner-classname-prefix', () => style({}))`** — cria um escopo CSS via `@scope` nativo do CSS, restringindo o estilo a uma região sem depender de cascata ancestral. Útil para componentes que teleportam partes de si mesmos.

**Como aplicar:** quando for evoluir a engine de estilos do mini-q, considerar um desses mecanismos para classes geradas independentemente do contexto DOM. No exemplo `auth`, o Popover e Modal são os casos de uso atuais.
