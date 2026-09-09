# Task

Timers com id, debounce e retry. A fachada `Task` é estática, mas o estado dos timers vive num `TaskScheduler` — pode-se criar um scheduler isolado para testes ou contextos que não devem partilhar ids. O relógio é [TimeSpan](../time-span/) (`TimeInput`: `300` ou `'5s'`). Não é um agendador de calendário e não cria `AbortController`.

Em vez de `setTimeout` solto (sem id, sem `cancelAll` nos testes) ou `debounce` duma toolkit, o caminho feliz é nomear o job (`wait` / `every`) ou obter uma função (`debounce`). `retry` lança se as tentativas esgotarem — não devolve [Result](../result/).

Uma busca dispara a cada tecla: só a última conta. Um load instável tenta de novo. `'300ms'` no sítio de `300`.

```ts
import { Task } from '.../task';

Task.wait('5s', () => undefined);
Task.debounce(search, '300ms');
await Task.retry(load, { delays: ['300ms'], signal });
```

---

## Como esperar e repetir

`wait` dispara uma vez. `every` dispara em intervalo. Ambos devolvem um `Job` (`id`, `type`, `isActive`, `cancel`, `run`). Sem id, o scheduler gera um (`task_1`, …). Com id, o job anterior com o mesmo nome é **cancelado**.

```ts
const later = Task.wait('5s', () => undefined);
later.cancel();

Task.every('tick', '1s', () => undefined);
Task.cancel('tick');
Task.get('tick');
```

```ts
Task.every('tick', '1s', first);
Task.every('tick', '1s', second);
// first já não corre; o id 'tick' é o second
```

`run` executa o handler já, sem cancelar o timer. `cancelAll` esvazia o scheduler default — use nos testes. Delay inválido (`'nope'`) **lança**, a mesma mensagem que `TimeSpan.parse`. Número = milissegundos. String só dígitos (`'5000'`) é milissegundos no Task, sem alargar o parse do TimeSpan. Um id nomeado não pode parecer duração (`'5s'`).

`sleep` devolve `Promise<void>` depois do delay. **Não** ouve `signal` — isso é do `retry`.

---

## Como isolar o estado num scheduler

`Task.wait`, `every`, `cancel`, `cancelAll` e `get` delegam para um scheduler default interno. Para testes ou para evitar colisão de ids, cria-se um `TaskScheduler` separado.

```ts
import { Task, TaskScheduler } from '.../task';

const scheduler = new TaskScheduler();
scheduler.wait('job', '5s', () => undefined);
scheduler.cancelAll(); // não toca no default de Task
```

Cada scheduler tem a sua própria sequência de ids. `TaskScheduler` expõe os mesmos métodos de estado (`wait`, `every`, `cancel`, `cancelAll`, `get`). As operações sem estado (`sleep`, `debounce`, `retry`) permanecem em `Task`.

---

## Como atrasar uma função

`debounce` espera o silêncio. Só a última chamada corre. `cancel` descarta; `flush` corre já se houver chamada pendente; `isPending` diz se o timer está vivo.

```ts
const search = Task.debounce((query: string) => lookup(query), '300ms');
search('a');
search('ab');
search.flush();
search.cancel();
```

---

## Como repetir um trabalho que falha

`retry` recebe um handler e um `RetryOptions` opcional:

- `delays`: lista de esperas entre tentativas. Tentativas = `delays.length + 1`.
- `attempts`: número total de tentativas. Se omitido, calcula-se a partir de `delays`; se `delays` também omitted, o default é uma tentativa.
- `signal`: abort opt-in.
- `shouldRetry(error)`: `false` lança já, sem a próxima tentativa.

```ts
await Task.retry(load, { attempts: 3, delays: ['1s'] });
await Task.retry(load, { delays: ['300ms'], signal });
```

```ts
await Task.retry(load, { delays: ['1s', '2s'] });
// 3 tentativas: já + espera 1s + espera 2s
```

O valor do handler é o valor de `retry`. Falha esgotada: `throw` o último erro.

`{ signal }` é opt-in. Signal já abortado → lança `AbortError` sem correr o handler. Abort a meio do delay → não dispara a próxima tentativa. O handler é quem mete o mesmo `signal` no `fetch`. Se o handler lançar `AbortError` **e** o signal estiver abortado, **não** retenta.

`shouldRetry(error)` — `false` lança já, sem o próximo delay. O default só corta abort de unmount. Task **não** conhece HTTP nem timeout de transporte: isso é predicado do host. Timeout de 30s no fetch **não** se retenta no host (3 × 30s). Não há `Task.abortable()`: o timeout vive no transporte; o `AbortController` vive no host (`AbortSignal` que já tens).
