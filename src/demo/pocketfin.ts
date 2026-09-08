/**
 * PocketFin — verificação end-to-end do mini-q (CSS plano; engine de $.style é pós-MVP).
 * Exercita: reatividade granular, lista keyed, componentes (setup+closure),
 * custom event (:click-outside), behavior model, $disabled reativo, when.
 */

import { signal, computed, type Signal } from '@preact/signals-core';
import $ from '../index';
import { $when, $model } from '../index';

export type Kind = 'income' | 'expense';
export interface Tx {
  id: number;
  title: string;
  amount: number;
  type: Kind;
}

export const transactions = signal<Tx[]>([
  { id: 1, title: 'Salário', amount: 3500, type: 'income' },
  { id: 2, title: 'Mercado', amount: -120, type: 'expense' },
  { id: 3, title: 'Streaming', amount: -15.99, type: 'expense' },
  { id: 4, title: 'Freela', amount: 850, type: 'income' },
]);
export const balance = computed(() =>
  transactions.value.reduce((sum, t) => sum + t.amount, 0),
);
export const modalOpen = signal(false);
let nextId = 5;

const brl = (n: number) => `R$ ${n.toFixed(2)}`;

function BalanceCard() {
  return $.div(
    { class: 'balance' },
    $.p({ class: 'balance-label' }, 'Saldo total'),
    $.p(
      { $class: () => `balance-amount ${balance.value >= 0 ? 'income' : 'expense'}` },
      () => brl(balance.value),
    ),
  );
}

function TransactionItem(t: Tx) {
  const remove = () => {
    transactions.value = transactions.value.filter((x) => x.id !== t.id);
  };
  return $.li(
    { class: 'tx' },
    $.div(
      {},
      $.p({ class: 'tx-title' }, t.title),
      $.p({ class: 'tx-type' }, t.type === 'income' ? 'Entrada' : 'Saída'),
    ),
    $.div(
      { class: 'tx-row' },
      $.p(
        { class: `tx-amount ${t.amount >= 0 ? 'income' : 'expense'}` },
        `${t.amount >= 0 ? '+' : ''}${brl(t.amount)}`,
      ),
      $.button({ class: 'btn btn--danger btn--sm', on: { click: remove } }, 'Excluir'),
    ),
  );
}

function Modal() {
  const title = signal('');
  const amount = signal('');
  const type = signal<Kind>('income');
  const isValid = computed(() => {
    const value = parseFloat(amount.value);
    return title.value.trim() !== '' && !Number.isNaN(value) && value !== 0;
  });

  const close = () => {
    modalOpen.value = false;
  };
  const submit = (e: Event) => {
    e.preventDefault();
    if (!isValid.value) return;
    const value = Math.abs(parseFloat(amount.value));
    transactions.value = [
      ...transactions.value,
      {
        id: nextId++,
        title: title.value.trim(),
        amount: type.value === 'income' ? value : -value,
        type: type.value,
      },
    ];
    title.value = '';
    amount.value = '';
    type.value = 'income';
    close();
  };

  return $when(modalOpen, () =>
    $.div(
      { class: 'overlay' },
      $.div(
        { class: 'modal', on: { clickOutside: close } },
        $.div(
          { class: 'modal-header' },
          $.h2({ class: 'modal-title' }, 'Adicionar transação'),
          $.button({ class: 'btn btn--ghost btn--sm', on: { click: close } }, '×'),
        ),
        $.form(
          { class: 'form', on: { submit } },
          $.div(
            { class: 'field' },
            $.label({ class: 'field-label' }, 'Título'),
            $.input({ class: 'input', type: 'text', placeholder: 'Ex.: Salário', use: $model(title) }),
          ),
          $.div(
            { class: 'field' },
            $.label({ class: 'field-label' }, 'Valor'),
            $.input({ class: 'input', type: 'number', step: '0.01', placeholder: '0,00', use: $model(amount) }),
          ),
          $.div(
            { class: 'field' },
            $.label({ class: 'field-label' }, 'Tipo'),
            $.select(
              { class: 'input', use: $model(type as Signal<string>) },
              $.option({ value: 'income' }, 'Entrada'),
              $.option({ value: 'expense' }, 'Saída'),
            ),
          ),
          $.button({ class: 'btn', type: 'submit', $disabled: () => !isValid.value }, 'Adicionar'),
        ),
      ),
    ),
  );
}

export const App = () =>
  $.div(
    { class: 'container' },
    $.header(
      { class: 'header' },
      $.div(
        {},
        $.h1({ class: 'header-title' }, 'PocketFin'),
        $.p({ class: 'header-subtitle' }, 'mini-q demo'),
      ),
    ),
    BalanceCard(),
    $.section(
      { class: 'transactions' },
      $.h2({ class: 'transactions-title' }, 'Transações'),
      $.ul({ class: 'transactions-list' }, () =>
        transactions.value.map(
          (t) =>
            [TransactionItem, { ...t, key: t.id }] as [
              typeof TransactionItem,
              Tx & { key: number },
            ],
        ),
      ),
    ),
    $.button(
      {
        class: 'btn btn--round',
        on: {
          click: () => {
            modalOpen.value = true;
          },
        },
      },
      '+',
    ),
    Modal(),
  );
