# TimeSpan

Duração física em milissegundos — “quanto tempo”, não “quando”. Classe `TimeSpan` (instância imutável). Usa [Result](../result/) só em `tryParse`.

Em vez de `300000` ou `5 * 60 * 1000` espalhados no TTL e no debounce, o texto `'5m'` é o contrato. Não é um intervalo entre dois instantes (início/fim). Não calcula meses ou anos de calendário: `y` em `parse` são 365 dias fixos.

Um cache ou um retry pede uma duração conhecida. `parse` no caminho feliz; `tryParse` quando o texto vem de fora.

```ts
import { TimeSpan } from '.../time-span';

TimeSpan.parse('5m').totalMilliseconds;
// 300000
```

---

## Como criar uma duração

O caso comum é `parse` (string conhecida) ou `from` / `fromMinutes`. `from`: número = milissegundos; string = o mesmo que `parse` (lança se inválido).

```ts
TimeSpan.parse('5m');
TimeSpan.fromMinutes(5);
TimeSpan.from(300000);
TimeSpan.from('5m');
```

`y` é duração física: **365 dias fixos**, não calendário. Não serve para "próximo aniversário" nem "fim do mês".

```ts
TimeSpan.parse('1y').totalDays;
// 365
```

Totais (`totalDays`, `totalHours`, …) medem a duração inteira. Componentes são resto da unidade acima: `weeks`; `days` (0–6); `hours`; `minutes`; `seconds`. Oito dias → `totalDays === 8`, `weeks === 1`, `days === 1`.

---

## Quando o texto pode falhar

`tryParse` devolve `Result`: formato inválido → `error !== null`, a mesma mensagem que `parse` lançaria. `parse` é `Result.unwrap(tryParse(...))`. `isValid` é `error === null`.

```ts
const [span, error] = TimeSpan.tryParse('5m');
if (error !== null) {
  // não rolou
}
```

```ts
TimeSpan.parse('nope');
// lança Error: Invalid TimeSpan format: "nope"
```

Unidades encadeadas, com ou sem espaços: `y` `w` `d` `h` `m` `s` `ms`. Sinais `+`/`-` por unidade.

ISO 8601 (`PT5S`) **não** entra. `fromDate` / timestamp de instante **não** entram — isso não é duração.

---

## Como comparar e somar

`plus`, `minus`, `times`, `dividedBy` devolvem um `TimeSpan` novo. `dividedBy(0)` lança `RangeError`. `equals`, `isLongerThan`, `isShorterThan` comparam milissegundos.

```ts
const sum = TimeSpan.parse('1m').plus(TimeSpan.parse('30s'));
sum.equals(TimeSpan.parse('90s'));
// true
```

```ts
TimeSpan.parse('1m').dividedBy(0);
// lança RangeError
```

---

## O resto da superfície

Fábricas `fromSeconds`, `fromHours`, `fromDays`, `fromWeeks`, `zero`. Constantes `MS_PER_SECOND` … `MS_PER_WEEK`. Tipo `TimeInput` = `string | number`. `valueOf` / `toJSON` serializam o total em ms. `toString` emite `w` quando houver semanas (`1w 1d`, não `8d`) e inclui `ms` quando houver milissegundos restantes (`1s 500ms`). `isZero` / `isNegative`.
