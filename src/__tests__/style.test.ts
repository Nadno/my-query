import { describe, it, expect, beforeEach, vi } from 'vitest';
import $ from '../index';
import { preact } from '../adapters/preact';

$.useSignal(preact);

const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('$.style — entidade: nomes e retorno', () => {
  it('filho 2 palavras (elemento), filho já-2-palavras preservado, neto 1 palavra', () => {
    const card = $.style('category-card', {
      base: { padding: 16 },
      modifiers: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      title: { base: { fontWeight: 700 } },
      cardContent: { base: {} },
      content: {
        base: { color: '#333' },
        description: { base: { opacity: 0.8 } },
      },
    });

    expect(card.self).toBe('category-card');
    expect(card.title).toBe('-card-title'); // 1 palavra → prefixa elemento
    expect(card.cardContent).toBe('-card-content'); // já 2 palavras → só prefixo
    expect(card.content.self).toBe('-card-content');
    expect(card.content.description).toBe('-description'); // neto → 1 palavra
    expect(card.mods.featured).toBe('--featured');
    expect(card.keyframes.pulse).toBe('category-card-pulse');
  });

  it('folha sem filhos/mods/keyframes = string', () => {
    const input = $.style('text-input', { base: { padding: 8 } });
    expect(input).toBe('text-input');
  });
});

describe('$.style — CSS gerado', () => {
  it('caminho descendente, pseudo via &, modificador composto, override de filho, keyframes', () => {
    $.style('category-card', {
      base: { padding: 16, '&:hover': { boxShadow: '0 0 0' } },
      modifiers: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      title: { base: { fontWeight: 700 } },
      content: { base: {}, description: { base: { opacity: 0.8 } } },
    });
    $.style('field', {
      base: {},
      input: { base: {} },
      modifiers: { invalid: { input: { borderColor: 'red' } } },
    });

    const css = sheet();
    expect(css).toContain('.category-card { padding: 16px; }');
    expect(css).toContain('.category-card:hover { box-shadow: 0 0 0; }');
    expect(css).toContain('.category-card.--featured { border-color: gold; }');
    expect(css).toContain('.category-card .-card-title { font-weight: 700; }');
    expect(css).toContain('.category-card .-card-content .-description { opacity: 0.8; }');
    expect(css).toMatch(/@keyframes category-card-pulse \{ from \{ opacity: 0\.6; \} to \{ opacity: 1; \} \}/);
    // override de filho dentro de modificador
    expect(css).toContain('.field.--invalid .-field-input { border-color: red; }');
  });
});

describe('$.style — variants (cva) preservado', () => {
  it('config com `variants` retorna função de classes', () => {
    const btn = $.style('btn', {
      base: { border: 'none' },
      variants: { size: { sm: { padding: 4 }, md: { padding: 8 } } },
      defaultVariants: { size: 'md' },
    });
    expect(typeof btn).toBe('function');
    expect(btn()).toBe('btn btn--md');
    expect(btn({ size: 'sm' })).toBe('btn btn--sm');
  });
});

describe('$.style — warn de nome duplicado', () => {
  it('avisa quando o mesmo bloco é registrado 2×', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('dup-block', { base: {} });
    $.style('dup-block', { base: {} });
    expect(warn).toHaveBeenCalledOnce();
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
