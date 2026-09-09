---
name: aria-object-engine
description: O atributo aria no mini-q precisa aceitar objetos aninhados além de strings, igual a data, mas isso é mudança de engine.
metadata:
  type: project
---

Hoje a API de atributos `aria` no mini-q aceita valores reativos (`() => ...`) e strings planas, mas não objetos aninhados como `{ selected: () => ..., controls: panelId }`. Isso força código verboso quando várias propriedades ARIA precisam ser ligadas dinamicamente.

**Por que importa:** componentes acessíveis (Tabs, Accordion, Modal) precisam de várias propriedades ARIA por elemento. Sem suporte a objeto, o call site fica repetitivo e a API parece inconsistente com `data` / `on`, que já tratam objetos.

**Como aplicar:** quando for mexer na engine de atributos do mini-q, fazer `aria` expandir objetos reativamente, permitindo tanto `aria: { expanded: () => String(...) }` quanto aninhamentos futuros. Não é mudança no exemplo `auth`, é mudança na lib.
