import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $, { $mount, $onMounted, $useSignal } from './index';
import { preact } from './adapters/preact';
import { useSignal, type ReactiveAdapter } from './reactive';

// reactive.ts guarda o adapter em variável de módulo (sem reset público). O vitest
// isola o módulo por arquivo, então controlamos o adapter aqui; "sem adapter" = null.
const noAdapter = () => useSignal(null as unknown as ReactiveAdapter);

beforeEach(() => {
  noAdapter();
  document.body.innerHTML = '';
});

describe('SET.1.1 — montar sem adapter instalado', () => {
  it('lança com mensagem acionável quando há fonte reativa', () => {
    const n = signal(0);
    expect(() =>
      $mount(document.body, () => $.div({}, () => `n=${n.value}`)),
    ).toThrow(/Nenhum adapter/);
  });
});

describe('LIF.7.3 — $mount com árvore pronta (débito conhecido)', () => {
  it('renderiza, mas os effects vazam (não são limpos no unmount)', () => {
    $useSignal(preact);
    const n = signal(0);
    let effectRuns = 0;
    // árvore construída FORA do escopo do mount — os effects nascem órfãos
    const tree = $.div({}, () => {
      effectRuns++;
      return `n=${n.value}`;
    });

    const unmount = $mount(document.body, tree);
    expect(effectRuns).toBe(1);
    expect(document.body.textContent).toContain('n=0');

    n.value = 1;
    expect(effectRuns).toBe(2); // effect órfão segue vivo

    unmount();
    expect(document.body.childNodes.length).toBe(0);
    n.value = 2;
    expect(effectRuns).toBe(3); // vazou: o unmount não o parou
  });
});

describe('LIF.7.7 — timing do onMounted', () => {
  it('roda quando o nó já está conectado ao document (pós-mount)', () => {
    $useSignal(preact);
    let el: HTMLElement | null = null;
    let connectedAtMount: boolean | null = null;
    const App = () => {
      el = $.div({ id: 'x' }, 'x');
      $onMounted(() => {
        connectedAtMount = el!.isConnected;
      });
      return el;
    };
    const unmount = $mount(document.body, App);
    expect(connectedAtMount).toBe(true); // montado: nó já no document
    expect(document.getElementById('x')).toBe(el);
    unmount();
  });

  it('dentro do onMounted o elemento já é encontrável por document.getElementById', () => {
    $useSignal(preact);
    let found: HTMLElement | null = null;
    const App = () => {
      const el = $.div({ id: 'y' }, 'y');
      $onMounted(() => {
        found = document.getElementById('y');
      });
      return el;
    };
    const unmount = $mount(document.body, App);
    expect(found).not.toBeNull();
    unmount();
  });
});
