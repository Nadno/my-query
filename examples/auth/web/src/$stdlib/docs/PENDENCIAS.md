# Pendências — defeitos conhecidos

Revisão da pasta (2026-09): o que a leitura dos módulos encontrou e ainda não foi corrigido. Este ficheiro só anota — corrigir é trabalho do plano A do módulo correspondente ([processo](ROADMAP.md#processo-três-planos-por-etapa)).

Cada item diz o que acontece, porquê e a correção sugerida. Nenhum é urgente ao ponto de bloquear um consumidor.

---

## Resolvidos

### 1. ~~Pattern — `match` consulta a prototype chain~~

Corrigido: `Object.hasOwn(cases, key)` no ramo literal e no ramo `_`.

### 2. ~~HttpQuery — o handler nunca vê o `signal`~~

Corrigido: `HttpQueryHandler` passa a receber `(params, key, signal)` e `handle` repassa o signal ao handler.

### 3. ~~Task — `retry(handler, {})` não tenta de novo~~

Corrigido: as quatro assinaturas de `retry` colapsaram numa só com `RetryOptions` (`attempts`, `delays`, `signal`, `shouldRetry`). O estado dos timers foi extraído para `TaskScheduler`; `Task` é fachada estática para um scheduler default.

### 4. ~~Obj — `identity` colide em `Map`, `Set` e `RegExp`~~

Corrigido: `Map`, `Set` e `RegExp` são serializados com prefixo de tag e conteúdo, gerando chaves distintas.

---

## Resolvidos (cont.)

### 5. ~~HttpQuery — `invalidatePrefix` é posicional~~

Documentado no README do módulo com exemplo de que o prefixo casa só os primeiros elementos do array (`['user']` invalida `['user', 1]`, mas não `['admin', 'user']`).

### 6. ~~TimeSpan — `'1y'` são 365 dias fixos~~

Documentado no README do módulo com exemplo (`TimeSpan.parse('1y').totalDays === 365`) e reforço de que é duração física, não calendário.

---

## O que não é pendência

A revisão questionou o cruzamento com `es-toolkit` (`Str.*`, `Obj.omit`/`pick`, guards de `Type`). Fica registado como decisão: a sobreposição é deliberada — [substituir, não somar](ROADMAP.md#filtro-o-que-vale) — e o corte continua a ser o consumo real do host, não o inventário do toolkit. `Str.*` em particular duplica bem: contratos pequenos, sem estado, sem bordas escondidas.
