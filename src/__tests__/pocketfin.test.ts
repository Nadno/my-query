import { describe, it, expect, beforeEach } from 'vitest';
import $ from '../index';
import { preact } from '../adapters/preact';
import { App, transactions, balance, modalOpen } from '../demo/pocketfin';

$.useSignal(preact);

describe('PocketFin (aceite end-to-end)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    transactions.value = [
      { id: 1, title: 'Salário', amount: 3500, type: 'income' },
      { id: 2, title: 'Mercado', amount: -120, type: 'expense' },
    ];
    modalOpen.value = false;
  });

  it('renderiza saldo e lista', () => {
    $.mount('#app', App);
    expect(balance.value).toBe(3380);
    expect(document.body.textContent).toContain('R$ 3380.00');
    expect(document.querySelectorAll('.tx').length).toBe(2);
  });

  it('excluir transação atualiza lista e saldo', () => {
    $.mount('#app', App);
    const deleteBtns = document.querySelectorAll<HTMLButtonElement>('.tx .btn--danger');
    deleteBtns[1]!.click(); // remove "Mercado" (-120)
    expect(document.querySelectorAll('.tx').length).toBe(1);
    expect(balance.value).toBe(3500);
    expect(document.body.textContent).toContain('R$ 3500.00');
  });

  it('modal (when) monta/desmonta e adiciona transação', () => {
    $.mount('#app', App);
    expect(document.querySelector('.modal')).toBeNull();

    // abre pelo FAB
    document.querySelector<HTMLButtonElement>('.btn--round')!.click();
    expect(document.querySelector('.modal')).not.toBeNull();

    // preenche via model
    const [titleInput, amountInput] =
      document.querySelectorAll<HTMLInputElement>('.modal .input');
    titleInput!.value = 'Bônus';
    titleInput!.dispatchEvent(new Event('input'));
    amountInput!.value = '500';
    amountInput!.dispatchEvent(new Event('input'));

    // submit
    document.querySelector<HTMLFormElement>('.modal .form')!.dispatchEvent(
      new Event('submit', { cancelable: true }),
    );

    expect(modalOpen.value).toBe(false);
    expect(document.querySelector('.modal')).toBeNull();
    expect(transactions.value.some((t) => t.title === 'Bônus' && t.amount === 500)).toBe(true);
    expect(balance.value).toBe(3880);
  });

  it('$disabled reativo no botão de submit', () => {
    $.mount('#app', App);
    document.querySelector<HTMLButtonElement>('.btn--round')!.click();
    const submit = document.querySelector<HTMLButtonElement>('.modal .btn[type="submit"]')!;
    expect(submit.disabled).toBe(true); // vazio → inválido
    const titleInput = document.querySelector<HTMLInputElement>('.modal .input')!;
    titleInput.value = 'X';
    titleInput.dispatchEvent(new Event('input'));
    const amountInput = document.querySelectorAll<HTMLInputElement>('.modal .input')[1]!;
    amountInput.value = '10';
    amountInput.dispatchEvent(new Event('input'));
    expect(submit.disabled).toBe(false);
  });
});
