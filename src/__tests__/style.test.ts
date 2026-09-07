import { describe, it, expect, beforeEach, vi } from 'vitest';
import $ from '../index';
import { preact } from '../adapters/preact';

$.useSignal(preact);

const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('$.style — handle: partes promovidas e nomes', () => {
  it('self do bloco, partes promovidas (nome completo do bloco), flags --is-*, keyframes escopado', () => {
    const card = $.style('category-card', {
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

    expect(card.self).toBe('category-card');
    // partes promovidas ao próprio objeto:
    expect(card.title.self).toBe('-category-card-title');
    expect(card.content.self).toBe('-category-card-content');
    expect(card.content.description.self).toBe('-category-card-description'); // neto: mesmo prefixo
    // chamar a parte devolve a própria classe:
    expect(card.title()).toBe('-category-card-title');
    expect(card.flags.featured).toBe('--is-featured');
    expect(card.keyframes.pulse).toBe('category-card-pulse');
  });

  it('bloco simples é StyleHandle callable (self + call), decls no topo (sem base)', () => {
    const input = $.style('text-input', { padding: 8 });
    expect(input.self).toBe('text-input');
    expect(input()).toBe('text-input');
    expect(sheet()).toContain('.text-input { padding: 8px; }');
  });
});

describe('$.style — CSS gerado', () => {
  it('descendente, pseudo via &, flag --is composta, override de parte em flag, keyframes', () => {
    $.style('category-card', {
      padding: 16,
      '&:hover': { boxShadow: '0 0 0' },
      flags: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      parts: {
        title: { fontWeight: 700 },
        content: { parts: { description: { opacity: 0.8 } } },
      },
    });
    $.style('field', {
      parts: { input: {} },
      flags: { invalid: { parts: { input: { borderColor: 'red' } } } },
    });

    const css = sheet();
    expect(css).toContain('.category-card { padding: 16px; }');
    expect(css).toContain('.category-card:hover { box-shadow: 0 0 0; }');
    expect(css).toContain('.category-card.--is-featured { border-color: gold; }');
    expect(css).toContain('.category-card .-category-card-title { font-weight: 700; }');
    expect(css).toContain(
      '.category-card .-category-card-content .-category-card-description { opacity: 0.8; }',
    );
    expect(css).toMatch(/@keyframes category-card-pulse \{ from \{ opacity: 0\.6; \} to \{ opacity: 1; \} \}/);
    // override de parte dentro de flag
    expect(css).toContain('.field.--is-invalid .-field-input { border-color: red; }');
  });
});

describe('$.style — slots (composição de bloco estrangeiro)', () => {
  it('flag mira o slot por descendente até a classe do bloco hospedado', () => {
    const control = $.style('slot-input', { padding: 8 });
    const field = $.style('slot-field', {
      slots: { control },
      flags: { invalid: { slots: { control: { borderColor: 'crimson' } } } },
    });

    expect(field.slots.control).toBe('slot-input');
    expect(sheet()).toContain('.slot-field.--is-invalid .slot-input { border-color: crimson; }');
  });

  it('override de slot não declarado avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('slot-warn', { flags: { on: { slots: { ghost: { color: 'red' } } } } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('slot "ghost"'));
    warn.mockRestore();
  });
});

describe('$.style — flags e variants coexistem; callable', () => {
  it('bloco com partes E variantes E flags; tokens no call-site', () => {
    const btn = $.style('btn', {
      border: 'none',
      parts: { icon: { width: 16 } },
      variants: { size: { sm: { padding: 4 }, md: { padding: 8 } } },
      flags: { block: { display: 'block' } },
      defaults: { size: 'md' },
    });

    expect(btn.icon.self).toBe('-btn-icon'); // parte não descartada com variants
    expect(btn.variants.size.sm).toBe('--size-sm');
    expect(btn.flags.block).toBe('--is-block');

    expect(btn()).toBe('btn --size-md'); // default de variante
    expect(btn({ size: 'sm' })).toBe('btn --size-sm');
    expect(btn({ size: 'sm', block: true })).toBe('btn --size-sm --is-block');

    const css = sheet();
    expect(css).toContain('.btn.--size-sm { padding: 4px; }');
    expect(css).toContain('.btn.--is-block { display: block; }');
    expect(css).toContain('.btn .-btn-icon { width: 16px; }');
  });
});

describe('$.style — class/cx aceitam o handle', () => {
  it('cx chama o handle (bloco → self+defaults, parte → classe da parte)', () => {
    const box = $.style('cx-box', {
      variants: { tone: { warn: {}, ok: {} } },
      defaults: { tone: 'ok' },
      parts: { head: {} },
    });
    expect($.cx(box)).toBe('cx-box --tone-ok');
    expect($.cx(box.head)).toBe('-cx-box-head');
    expect($.cx('x', box.head, false)).toBe('x -cx-box-head');
  });

  it('class: handle aplica a classe no elemento montado', () => {
    document.body.innerHTML = '';
    const badge = $.style('cx-badge', { color: 'red' });
    const unmount = $.mount(document.body, () => $.span({ class: badge }));
    expect(document.body.querySelector('span')!.className).toBe('cx-badge');
    unmount();
  });
});

describe('$.style — warns', () => {
  it('avisa nome de bloco duplicado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('dup-block', {});
    $.style('dup-block', {});
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('avisa chave-objeto inesperada no topo (parte fora de parts)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('warn-block', { title: { fontWeight: 700 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"title"'));
    warn.mockRestore();
  });

  it('avisa parte com nome reservado do handle', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('reserved-block', { parts: { self: { color: 'red' } } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('reservado'));
    warn.mockRestore();
  });
});

describe('breakpoints', () => {
  beforeEach(() => {
    $.config({ breakpoints: { md: 768, lg: '1024px' } });
  });

  it('CSS: @md/@lg resolvem para @media (min-width)', () => {
    $.style('bp-box', { padding: 8, '@md': { padding: 16 }, '@lg': { padding: 24 } });
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
