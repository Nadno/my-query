import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('bug 1: $.when não rastreia a construção do ramo', () => {
  it('mudar signal lido DENTRO do ramo não remonta o ramo', () => {
    const open = signal(true);
    const user = signal({ name: 'a' });
    let builds = 0;

    const Panel = () => {
      builds++;
      const current = user.value; // lido durante a construção — NÃO deve virar dep da região
      return $.div({ id: 'panel' }, () => `hi ${current.name}`);
    };

    const App = () => $.div({}, $.when(open, () => Panel()));
    $.mount(document.body, App);

    expect(builds).toBe(1);
    // alterar user NÃO deve reconstruir o Panel (bug antigo: ia pra 2)
    user.value = { name: 'b' };
    expect(builds).toBe(1);
    // alterar a condição SIM controla a montagem
    open.value = false;
    expect(document.getElementById('panel')).toBeNull();
    open.value = true;
    expect(builds).toBe(2);
  });
});

describe('bug 1b: região de lista não rastreia construção dos itens', () => {
  it('signal lido ao construir item não vira dependência da lista', () => {
    const items = signal([{ id: 1 }, { id: 2 }]);
    const extern = signal('x');
    let builds = 0;

    const Row = (p: { id: number }) => {
      builds++;
      const snap = extern.value; // lido na construção
      return $.li({ id: `r${p.id}` }, snap);
    };

    const App = () =>
      $.ul({}, () => items.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]));
    $.mount(document.body, App);

    expect(builds).toBe(2);
    extern.value = 'y'; // não deve reconstruir nada
    expect(builds).toBe(2);
  });
});

describe('bug 2: reconcile só move nós fora de posição (preserva foco)', () => {
  it('adicionar item no fim não tira o foco de um input existente', () => {
    const rows = signal([{ id: 1 }, { id: 2 }]);

    const Row = (p: { id: number }) =>
      $.li({}, $.input({ id: `inp-${p.id}` }));

    const App = () =>
      $.ul({}, () => rows.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]));
    $.mount(document.body, App);

    const first = document.getElementById('inp-1') as HTMLInputElement;
    first.focus();
    expect(document.activeElement).toBe(first);

    // adiciona uma linha no fim — nós existentes já estão em ordem, não devem ser movidos
    rows.value = [...rows.value, { id: 3 }];
    expect(document.getElementById('inp-3')).not.toBeNull();
    expect(document.activeElement).toBe(first); // foco preservado
  });

  it('reordenar move só o necessário e mantém foco no nó reusado', () => {
    const rows = signal([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const Row = (p: { id: number }) => $.li({}, $.input({ id: `inp-${p.id}` }));
    const App = () =>
      $.ul({}, () => rows.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]));
    $.mount(document.body, App);

    const n2 = document.getElementById('inp-2') as HTMLInputElement;
    n2.focus();
    // move o 3 pro início; o 2 continua no mesmo lugar relativo ao 1
    rows.value = [{ id: 3 }, { id: 1 }, { id: 2 }];
    expect([...document.querySelectorAll('li input')].map((n) => n.id)).toEqual([
      'inp-3',
      'inp-1',
      'inp-2',
    ]);
    expect(document.activeElement).toBe(n2); // nó reusado manteve o foco
  });
});

describe('escopos aninhados: cleanup dispara ao remover item da região', () => {
  it('effect de um binding dentro do item para quando o item é removido', () => {
    const tick = signal(0);
    const runs: Record<number, number> = {};
    const items = signal([{ id: 1 }, { id: 2 }]);

    const Row = (p: { id: number }) =>
      $.div({
        id: `d${p.id}`,
        $class: () => {
          runs[p.id] = (runs[p.id] ?? 0) + 1; // conta as execuções do effect deste item
          return `c${tick.value}`;
        },
      });

    const App = () =>
      $.div({}, () => items.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]));
    $.mount(document.body, App);

    expect(runs[1]).toBe(1);
    expect(runs[2]).toBe(1);

    tick.value = 1; // ambos os effects vivos re-rodam
    expect(runs[1]).toBe(2);
    expect(runs[2]).toBe(2);

    items.value = [{ id: 1 }]; // remove o item 2 → disposeScope do sub-escopo dele
    tick.value = 2;
    expect(runs[1]).toBe(3); // item vivo segue reagindo
    expect(runs[2]).toBe(2); // effect do item removido foi descartado (congelou)
  });

  it('cleanup de um behavior use dispara ao remover o item', () => {
    const spies: Record<number, ReturnType<typeof vi.fn>> = { 1: vi.fn(), 2: vi.fn() };
    const items = signal([{ id: 1 }, { id: 2 }]);

    const Row = (p: { id: number }) => $.div({ id: `u${p.id}`, use: () => spies[p.id] });

    const App = () =>
      $.div({}, () => items.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]));
    $.mount(document.body, App);

    expect(spies[1]).not.toHaveBeenCalled();
    expect(spies[2]).not.toHaveBeenCalled();

    items.value = [{ id: 1 }]; // remove item 2 → seu cleanup de use roda uma vez
    expect(spies[2]).toHaveBeenCalledTimes(1);
    expect(spies[1]).not.toHaveBeenCalled(); // item 1 continua montado
  });
});
