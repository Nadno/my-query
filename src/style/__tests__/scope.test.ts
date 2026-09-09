import { describe, it, expect } from 'vitest';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';
import { style } from '../index';
import { hashScope } from '../scope';

$useSignal(preact);

// Nomes de bloco únicos por caso: registries de módulo persistem por toda a suíte.
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('style — motor native (@scope)', () => {
  it('emite dentro de @scope (.bloco), self como :scope', () => {
    style('scp-card', {
      scope: { strategy: 'native' },
      display: 'flex',
      parts: { title: { fontWeight: 700 } },
      flags: { featured: { borderColor: 'gold' } },
    });
    const css = sheet();
    expect(css).toContain('@scope (.scp-card) { :scope { display: flex; } }');
    expect(css).toContain('@scope (.scp-card) { :scope.--is-featured { border-color: gold; } }');
    expect(css).toContain('@scope (.scp-card) { :scope .-scp-card-title { font-weight: 700; } }');
  });

  it('cláusula to emite @scope (.bloco) to (sel)', () => {
    style('scp-to', {
      scope: { strategy: 'native', to: '.modal' },
      color: 'red',
    });
    expect(sheet()).toContain('@scope (.scp-to) to (.modal) { :scope { color: red; } }');
  });

  it('name: hashed gera classe de root estável e parte prefixada pelo hash', () => {
    const hashed = style('scp-hash', {
      scope: { strategy: 'native', name: 'hashed' },
      parts: { icon: { width: 8 } },
    });
    const hash = hashScope('scp-hash');
    expect(hashed.self).toBe('scp-hash');
    expect(hashed.icon().includes(hash)).toBe(true);
  });

  it('aninhamento de partes: sub-partes descem de :scope sem repetir a classe do root', () => {
    style('scp-nested', {
      scope: { strategy: 'native' },
      parts: {
        card: {
          parts: {
            heading: { fontWeight: 700 },
          },
          '& > $heading': { color: '#333' },
        },
      },
    });
    const css = sheet();
    expect(css).toContain('@scope (.scp-nested) { :scope .-scp-nested-card .-scp-nested-heading { font-weight: 700; } }');
    // resolver $nome dentro do nó: filho-direto
    expect(css).toContain('@scope (.scp-nested) { :scope .-scp-nested-card > .-scp-nested-heading { color: #333; } }');
  });

  it('variante emite :scope.--grupo-valor dentro do @scope', () => {
    style('scp-var', {
      scope: { strategy: 'native' },
      variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
      defaults: { size: 'md' },
    });
    const css = sheet();
    expect(css).toContain('@scope (.scp-var) { :scope.--size-sm { gap: 4px; } }');
    expect(css).toContain('@scope (.scp-var) { :scope.--size-md { gap: 8px; } }');
  });

  it('@media dentro do bloco é embrulhado junto (regra fica dentro do @scope)', () => {
    style('scp-media', {
      scope: { strategy: 'native' },
      '@media (min-width: 900px)': { color: 'blue' },
    });
    expect(sheet()).toContain('@scope (.scp-media) { @media (min-width: 900px) { :scope { color: blue; } } }');
  });

  it('nome global do config é herdado, override local adiciona limite to', () => {
    // usa blocos únicos; herança global é coberta via config em outro arquivo
    style('scp-herit', {
      scope: { strategy: 'native', to: '.outside' },
      color: 'black',
    });
    expect(sheet()).toContain('@scope (.scp-herit) to (.outside) { :scope { color: black; } }');
  });
});
