# Proposal — `$model` adequado (paridade Vue via `options`)

Status: **proposto** (2026-09-08). Sucede a 1ª versão de `$model` (auto-detecção de modo,
commit `aed5872`). Objetivo: fechar a API num contrato único `$model(signal, options?)` em vez de
acretar heurística, trazendo as peças boas do `v-model` do Vue que ainda faltam.

## Motivação

A v1 do `$model` já tem **paridade Vue no núcleo** — inclusive o critério de "grupo vs booleano" é o
mesmo do Vue (`Array.isArray(modelValue)` em runtime). Faltam duas coisas do Vue, ambas pequenas:

1. **`true-value` / `false-value`**: um checkbox único fazer two-way com **valores de domínio**
   (`'ativo'`/`'inativo'`, `1`/`0`) em vez de só boolean.
2. **Modificadores** `.lazy` / `.number` / `.trim`: sincronizar no `change`, castar pra número, aparar
   espaços.

Sem ponto de extensão, cada um vira um `if` novo no meio da detecção. Um `options` fecha isso.

## Modo (auto-detectado — **inalterado**)

O modo continua sendo inferido do elemento + tipo do valor. `options` só ajusta conversão/evento,
nunca o modo.

| Elemento                          | Valor do signal | Modo             | DOM←signal                         | DOM→signal (no evento)                |
|-----------------------------------|-----------------|------------------|------------------------------------|---------------------------------------|
| `input[type=checkbox]`            | array           | **grupo**        | `checked = arr.includes(el.value)` | alterna `el.value` no array           |
| `input[type=checkbox]`            | (demais)        | **booleano**     | `checked = value === trueValue`\*  | `checked ? trueValue : falseValue`    |
| `input[type=radio]`               | —               | **radio**        | `checked = el.value === value`     | `el.value` (se `checked`)             |
| `select[multiple]`                | array           | **multi**        | opções `selected` ∈ array          | array dos `selectedOptions.value`     |
| text/number/textarea/`select`     | —               | **string**       | `el.value = String(value)`         | `el.value`                            |

\* No modo booleano, **sem** `trueValue`/`falseValue` explícitos mantém o comportamento v1
(`checked = !!value` / escreve boolean). A comparação por igualdade só entra quando eles são dados.

## `options`

```ts
interface ModelOptions {
  /** Valor escrito quando um checkbox único está marcado. Default: `true`. */
  trueValue?: unknown;
  /** Valor escrito quando desmarcado. Default: `false`. */
  falseValue?: unknown;
  /** Sincroniza DOM→signal no `change` em vez de `input` (só afeta o modo string). */
  lazy?: boolean;
  /** Casta o `value` string → número ao escrever (`looseToNumber`: falha → mantém string). */
  number?: boolean;
  /** Apara espaços do `value` string ao escrever. */
  trim?: boolean;
}
```

- **`trueValue`/`falseValue`** só valem no **checkbox booleano** (ignorados nos outros modos, como no Vue).
- **`lazy`** só muda o modo **string** (checkbox/radio/select já ouvem `change`).
- **`number`/`trim`** aplicam-se a todo `value` string produzido: modo string, `el.value` do radio, e
  cada item de grupo/select-multiple. Ordem: **trim → number** (igual Vue).
- `looseToNumber(s)`: `const n = parseFloat(s); return isNaN(n) ? s : n` — não força número inválido.

## Tipos

Assinatura pragmática, sem explodir overloads:

```ts
export function model(
  signal: WritableSignal<ModelValue>,
  options?: ModelOptions,
): Behavior<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
```

`ModelValue = string | number | boolean | string[]` (o `number` cobre `.number` e `true/false-value`
numéricos). Mantém os overloads atuais (`string`/`boolean`/`string[]`) por cima, para inferência boa no
caso comum; o overload com `options` cai no `ModelValue` amplo. **Zero breaking**: `$model(signal)` intacto.

## Não-objetivos

- **Valores-objeto por identidade/`looseEqual`** (Vue suporta em `:value`). mini-q compara por `value`
  **string** — mais simples e previsível. Fica de fora.
- `.number`/`.trim` como *modificadores de token* no nome do evento (estilo `v-model.number`) — não temos
  compilador/template; vivem no `options`.

## Exemplos

```ts
// checkbox com valores de domínio
$.input({ type: 'checkbox', use: $model(status, { trueValue: 'ativo', falseValue: 'inativo' }) });

// input numérico que grava número, sincronizando só ao sair (lazy)
$.input({ type: 'number', use: $model(qty, { number: true, lazy: true }) });

// busca aparada
$.input({ use: $model(query, { trim: true }) });
```

## Verificação

Estender `src/behaviors.test.ts`: `trueValue`/`falseValue` (marca/desmarca grava o valor certo; reflete
de volta); `lazy` (não grava no `input`, grava no `change`); `number` (`'3.5'` → `3.5`; `'x'` → `'x'`);
`trim`; e **regressão**: `$model(signal)` sem options = comportamento v1. Typecheck + build + exemplo.
