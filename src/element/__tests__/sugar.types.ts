/**
 * Type-test do açúcar `$.tag(...children)` sem `{}` — compilado pelo `npm run typecheck`
 * (TS2578 falha se um `@ts-expect-error` não consumir erro). Não é teste de runtime.
 *
 * As promessas de tipo que isso trava:
 *  - Função **0-param** como 1º arg = **filho reativo** → devolve `TagElement` (não Component).
 *  - Função com **≥1 param** = **setup** → devolve `Component` (props/ctx tipados).
 *  - O filho reativo aceita qualquer retorno (string, número, Node, array).
 */
import { signal } from '@preact/signals-core';
import $ from '../../index';
import type { Component } from '../../types';

const count = signal(0);

/* ---- positivos ---- */

// A. função 0-param → elemento (filho reativo)
const a1: HTMLSpanElement = $.span(() => count.value);
const a2: HTMLDivElement = $.div(() => 'texto');
const a3: HTMLDivElement = $.div(() => [$.span('x')]);

// B. função com ≥1 param → Component (setup)
const b1: Component = $.div((props, ctx) => {
  void props;
  void ctx;
  return 'x';
});
const b2: Component = $.div((props) => {
  void props;
  return 'x';
});

/* ---- negativos (must-error) ---- */

// N1. função 0-param NÃO é Component — chamar o resultado como função erra
// @ts-expect-error função 0-param vira elemento (filho reativo), não componente
const n1 = $.div(() => 'x')();

void [a1, a2, a3, b1, b2, n1];
