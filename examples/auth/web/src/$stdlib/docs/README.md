# `$stdlib`

JavaScript normalizado: valores, tempo, cache e HTTP genérico. Sem Vue, sem Pinia, sem paths `/api`, sem vocabulário Neolude.

Esta pasta (`docs/`) é a leitura do código que a rodeia. Copiar o directório da `$stdlib` leva os primitives e a documentação.

---

## Porque existe

Qualquer host imaturo volta a espalhar o mesmo JS: `300000` ilegível, `typeof null`, `debounce` duma toolkit, `Map` no store, `"true"` no env, helpers soltos que ninguém sabe de quem são. A `$stdlib` é o standard no sítio dessas funções: um módulo, uma fachada, um contrato. **Substitui, não soma.**

A SDK (`$sdk`) é o contrato com a plataforma. Esta pasta não mistura HTTP de produto com JS genérico.

Já existem [Result](result/), [TimeSpan](time-span/), [Type](type/), [Obj](obj/), [Cache](cache/), [HttpQuery](http-query/), [Task](task/), [Str](str/) e [RawJSON](raw-json/). O dump de referência espera em [`_incoming/`](../_incoming/). Processo e filtro: [ROADMAP.md](ROADMAP.md).

---

## Ideia em um ecrã

```ts
import { Result } from '.../$stdlib/result';
import { TimeSpan } from '.../$stdlib/time-span';
import { HttpQuery } from '.../$stdlib/http-query';

const delay = TimeSpan.parse('5m');
const outcome = Result.ok(delay.totalMilliseconds);

const query = new HttpQuery();
const [data, error] = await query.handle(['items'], () => listItems(), {
  ttl: '5m',
});
```

O alias de import (`@/$stdlib` ou outro) é convenção do host, não da lib. Vue, Pinia e i18n ficam no host; a `$stdlib` não os importa.

Não importar `_incoming/`. Esse código não é a API pública — espera o plano de cada etapa.

---

## Tarefa → módulo

| Quero… | Módulo |
|--------|--------|
| Ramificar um throw (`JSON.parse`, trabalho que falha) | [Result](result/) |
| TTL ou delay legível (`'5m'`, não `300000`) | [TimeSpan](time-span/) |
| Distinguir `null` de objecto; número usável | [Type](type/) |
| Chave estável para params de lista | [Obj](obj/) |
| Memoizar um valor com TTL | [Cache](cache/) |
| O mesmo GET duas vezes sem voltar à rede | [HttpQuery](http-query/) |
| Atrasar uma busca; retry; timer com id | [Task](task/) |
| kebab / camel / capitalizar uma chave | [Str](str/) |
| `"true"` / `"12"` em texto (env) | [RawJSON](raw-json/) |
| Uma linha, várias codificações, lookup nos dois sentidos | [BiMap](bimap/) |
| Ramificar por valor ou condição (`match` / `when`) | [Pattern](pattern/) |
| O que falta corrigir (revisão da pasta) | [PENDENCIAS.md](PENDENCIAS.md) |
| O que ganha lugar na fachada (admissão) | [DX.md](DX.md) |
| Processo e o que não entra | [ROADMAP.md](ROADMAP.md) |
| O dump que ainda não é API | [`_incoming/`](../_incoming/) |

---

## O que não meter aqui

- Chamadas Neolude (`/api/...`, wire, regras de entidade) — isso é `$sdk`
- Composables Vue, stores Pinia, i18n
- Sniff de user-agent, contentor de DI, lodash-lite dentro de um único módulo
- O wrapper DateTime de 610 linhas (“substitui date-fns”) — entra só o mínimo, na etapa 7

---

## Cobertura

| Etapa | Escopo | Estado |
|-------|--------|--------|
| 0 — Caixa | Este README, ROADMAP, `_incoming/` | feita |
| 1 — Result, TimeSpan | Erro como valor; durações (`"5m"`) | feita |
| 2 — Type, Obj | Guards; identidade estável | feita |
| 3 — Cache, HttpQuery | TTL + GET memoizado | feita |
| 4 — Task | debounce / retry / timers com id | feita |
| 5 — Str | kebab / camel / capitalize | feita |
| 6 — RawJSON | `"true"` / `"12"` em texto | feita |
| 6.5 — Consolidação do MVP | Bugs críticos e `Task` instanciável | feita |
| 7 — DateTime (mínimo) | Factories e comparação | pendente |
| 8 — DateTimeRange | Intervalo entre dois `DateTime` | pendente |
| 9 — BiMap | Mapas paralelos + reversos à mão | feita |
| 10 — Pattern | `match` / `when` soltos no host | feita |

Pedir um módulo é pedir **três planos** (lib, doc, host). Ver [ROADMAP — processo](ROADMAP.md#processo-três-planos-por-etapa).
