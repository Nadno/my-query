---
name: on-off-engine
description: `$on` deveria aceitar listener direto sobre elementos além de ctx de behavior, e a lib deveria expor `$off` para desligar manualmente.
metadata:
  type: project
---

Hoje `$on(ctx, name, value)` só opera sobre um `MQ` (contexto de behavior/component). É comum querer ligar um evento diretamente num `Element` qualquer sem estar dentro de um behavior — por exemplo, num helper que recebe um nó externo.

**Propostas:**

1. **`$on(element, name, value)`** — overload que aceita `Element | MQ` como primeiro argumento, igual outras libs que permitem `on(el, 'click', fn)`.
2. **`$off(element, name, listener?)`** — API simétrica para remover listeners criados por `$on` manualmente. Hoje o cleanup é retornado por `$on` e registrado no escopo; `$off` daria controle explícito.

**Como aplicar:** quando evoluir a engine de eventos do mini-q, tornar `$on` polimórfico no alvo e adicionar `$off` como export nomeado.
