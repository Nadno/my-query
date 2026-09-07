import { describe, it, expect, beforeEach, vi } from 'vitest';
import $ from '../index';
import { preact } from '../adapters/preact';

$.useSignal(preact);

const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('$.style — namespace: nomes e retorno', () => {
  it('self do bloco, partes com nome completo do bloco em toda profundidade, keyframes escopado', () => {
    const card = $.style('category-card', {
      base: { padding: 16 },
      flags: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      parts: {
        title: { base: { fontWeight: 700 } },
        content: {
          base: { color: '#333' },
          parts: { description: { base: { opacity: 0.8 } } },
        },
      },
    });

    expect(card.self).toBe('category-card');
    expect(card.parts.title.self).toBe('-category-card-title'); // nome completo do bloco
    expect(card.parts.content.self).toBe('-category-card-content');
    expect(card.parts.content.parts.description.self).toBe('-category-card-description'); // neto: mesmo prefixo
    expect(card.flags.featured).toBe('--featured');
    expect(card.keyframes.pulse).toBe('category-card-pulse');
  });

  it('bloco simples devolve StyleHandle callable (self + call)', () => {
    const input = $.style('text-input', { base: { padding: 8 } });
    expect(input.self).toBe('text-input');
    expect(input()).toBe('text-input');
  });

  it('só o nome (sem config) apenas reserva a string', () => {
    expect($.style('bare-name')).toBe('bare-name');
  });
});

describe('$.style — CSS gerado', () => {
  it('caminho descendente, pseudo via &, flag composta, override de parte em flag, keyframes', () => {
    $.style('category-card', {
      base: { padding: 16, '&:hover': { boxShadow: '0 0 0' } },
      flags: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      parts: {
        title: { base: { fontWeight: 700 } },
        content: { parts: { description: { base: { opacity: 0.8 } } } },
      },
    });
    $.style('field', {
      parts: { input: { base: {} } },
      flags: { invalid: { parts: { input: { borderColor: 'red' } } } },
    });

    const css = sheet();
    expect(css).toContain('.category-card { padding: 16px; }');
    expect(css).toContain('.category-card:hover { box-shadow: 0 0 0; }');
    expect(css).toContain('.category-card.--featured { border-color: gold; }');
    expect(css).toContain('.category-card .-category-card-title { font-weight: 700; }');
    expect(css).toContain(
      '.category-card .-category-card-content .-category-card-description { opacity: 0.8; }',
    );
    expect(css).toMatch(/@keyframes category-card-pulse \{ from \{ opacity: 0\.6; \} to \{ opacity: 1; \} \}/);
    // override de parte dentro de flag
    expect(css).toContain('.field.--invalid .-field-input { border-color: red; }');
  });
});

describe('$.style — flags e variants coexistem', () => {
  it('bloco com partes E variantes E flags no mesmo config', () => {
    const btn = $.style('btn', {
      base: { border: 'none' },
      parts: { icon: { base: { width: 16 } } },
      variants: { size: { sm: { padding: 4 }, md: { padding: 8 } } },
      flags: { block: { display: 'block' } },
      defaults: { size: 'md' },
    });

    // partes NÃO são descartadas quando há variants (defeito antigo)
    expect(btn.parts.icon.self).toBe('-btn-icon');
    expect(btn.variants.size.sm).toBe('--size-sm');
    expect(btn.flags.block).toBe('--block');

    expect(btn()).toBe('btn --size-md'); // default aplicado
    expect(btn({ size: 'sm' })).toBe('btn --size-sm');
    expect(btn({ size: 'sm', block: true })).toBe('btn --size-sm --block');

    const css = sheet();
    expect(css).toContain('.btn.--size-sm { padding: 4px; }');
    expect(css).toContain('.btn.--block { display: block; }');
    expect(css).toContain('.btn .-btn-icon { width: 16px; }');
  });
});

describe('$.style — warn de nome duplicado e chave inesperada', () => {
  it('avisa quando o mesmo bloco é registrado 2×', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('dup-block', { base: {} });
    $.style('dup-block', { base: {} });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('avisa (não descarta em silêncio) chave-objeto inesperada no topo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // `title` deveria estar sob `parts` — antes virava parte silenciosa
    $.style('warn-block', { title: { fontWeight: 700 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"title"'));
    warn.mockRestore();
  });
});

describe('breakpoints', () => {
  beforeEach(() => {
    $.config({ breakpoints: { md: 768, lg: '1024px' } });
  });

  it('CSS: @md/@lg resolvem para @media (min-width)', () => {
    $.style('bp-box', { base: { padding: 8, '@md': { padding: 16 }, '@lg': { padding: 24 } } });
    const css = sheet();
    expect(css).toContain('@media (min-width: 768px) { .bp-box { padding: 16px; } }');
    expect(css).toContain('@media (min-width: 1024px) { .bp-box { padding: 24px; } }');
  });

  it('$.media: signal reflete matchMedia e limpa no unmount', () => {
    const listeners = new Set<(e: { matches: boolean }) => void>();
    const mql = {
      matches: false,
      media: '',
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
      dispatchEvent: () => true,
    };
    const trigger = (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    };
    vi.stubGlobal('matchMedia', () => mql);

    document.body.innerHTML = '';
    let md!: { readonly value: boolean };
    const App = () => {
      md = $.media('md');
      return $.div({ $class: () => (md.value ? 'wide' : 'narrow') });
    };
    const unmount = $.mount(document.body, App);

    const el = document.body.querySelector('div')!;
    expect(el.className).toBe('narrow');
    expect(listeners.size).toBe(1);

    trigger(true);
    expect(md.value).toBe(true);
    expect(el.className).toBe('wide');

    unmount();
    expect(listeners.size).toBe(0); // cleanup removeu o listener

    vi.unstubAllGlobals();
  });
});
