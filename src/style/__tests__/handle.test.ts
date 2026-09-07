import { describe, it, expect } from 'vitest';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

// Nomes de bloco únicos por caso: a slice mantém registries de módulo
// (registered/injected/warnedDup) que persistem por toda a suíte. Sem um reset
// no source, nomes distintos evitam colisão de regras e warns cruzados.

describe('$.style — handle: partes promovidas e nomes', () => {
  it('self do bloco, partes promovidas (nome completo do bloco), flags --is-*, keyframes escopado', () => {
    const card = $.style('h-category-card', {
      padding: 16,
      flags: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      parts: {
        title: { fontWeight: 700 },
        content: {
          color: '#333',
          parts: { description: { opacity: 0.8 } },
        },
      },
    });

    expect(card.self).toBe('h-category-card');
    // partes promovidas ao próprio objeto:
    expect(card.title.self).toBe('-h-category-card-title');
    expect(card.content.self).toBe('-h-category-card-content');
    expect(card.content.description.self).toBe('-h-category-card-description'); // neto: mesmo prefixo
    // chamar a parte devolve a própria classe:
    expect(card.title()).toBe('-h-category-card-title');
    expect(card.flags.featured).toBe('--is-featured');
    expect(card.keyframes.pulse).toBe('h-category-card-pulse');
  });

  it('bloco simples é StyleHandle callable (self + call)', () => {
    const input = $.style('h-text-input', { padding: 8 });
    expect(input.self).toBe('h-text-input');
    expect(input()).toBe('h-text-input');
  });
});

describe('$.style — class/cx aceitam o handle', () => {
  it('cx chama o handle (bloco → self+defaults, parte → classe da parte)', () => {
    const box = $.style('h-cx-box', {
      variants: { tone: { warn: {}, ok: {} } },
      defaults: { tone: 'ok' },
      parts: { head: {} },
    });
    expect($.cx(box)).toBe('h-cx-box --tone-ok');
    expect($.cx(box.head)).toBe('-h-cx-box-head');
    expect($.cx('x', box.head, false)).toBe('x -h-cx-box-head');
  });

  it('class: handle aplica a classe no elemento montado', () => {
    document.body.innerHTML = '';
    const badge = $.style('h-cx-badge', { color: 'red' });
    const unmount = $.mount(document.body, () => $.span({ class: badge }));
    expect(document.body.querySelector('span')!.className).toBe('h-cx-badge');
    unmount();
  });
});
