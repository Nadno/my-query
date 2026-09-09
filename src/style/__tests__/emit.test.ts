import { describe, it, expect } from 'vitest';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';
import { style, config } from '../index';

$useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('style — CSS gerado', () => {
  it('descendente, pseudo via &, flag --is composta, override de parte em flag, keyframes', () => {
    style('emit-category-card', {
      padding: 16,
      '&:hover': { boxShadow: '0 0 0' },
      flags: { featured: { borderColor: 'gold' } },
      keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      parts: {
        title: { fontWeight: 700 },
        content: { parts: { description: { opacity: 0.8 } } },
      },
    });
    style('emit-field', {
      parts: { input: {} },
      flags: { invalid: { parts: { input: { borderColor: 'red' } } } },
    });

    const css = sheet();
    expect(css).toContain('.emit-category-card { padding: 16px; }');
    expect(css).toContain('.emit-category-card:hover { box-shadow: 0 0 0; }');
    expect(css).toContain('.emit-category-card.--is-featured { border-color: gold; }');
    expect(css).toContain('.emit-category-card .-emit-category-card-title { font-weight: 700; }');
    expect(css).toContain(
      '.emit-category-card .-emit-category-card-content .-emit-category-card-description { opacity: 0.8; }',
    );
    expect(css).toMatch(/@keyframes emit-category-card-pulse \{ from \{ opacity: 0\.6; \} to \{ opacity: 1; \} \}/);
    // override de parte dentro de flag
    expect(css).toContain('.emit-field.--is-invalid .-emit-field-input { border-color: red; }');
  });

  it('números viram px, exceto propriedades unitless', () => {
    style('emit-units', {
      padding: 8, // dimensional → px
      opacity: 0.5, // unitless
      zIndex: 10, // unitless
      lineHeight: 1.5, // unitless
      fontWeight: 700, // unitless
    });
    const css = sheet();
    expect(css).toContain('.emit-units { padding: 8px; opacity: 0.5; z-index: 10; line-height: 1.5; font-weight: 700; }');
  });

  it('at-rule cru (com espaço) é preservada; @nome resolve via breakpoint', () => {
    config({ breakpoints: { md: 768 } });
    style('emit-atrule', {
      color: 'black',
      '@media (min-width: 900px)': { color: 'blue' },
      '@supports (display: grid)': { display: 'grid' },
      '@md': { color: 'green' },
    });
    const css = sheet();
    expect(css).toContain('@media (min-width: 900px) { .emit-atrule { color: blue; } }');
    expect(css).toContain('@supports (display: grid) { .emit-atrule { display: grid; } }');
    expect(css).toContain('@media (min-width: 768px) { .emit-atrule { color: green; } }');
  });

  it('@md/@lg resolvem para @media (min-width) (número e string com unidade)', () => {
    config({ breakpoints: { md: 768, lg: '1024px' } });
    style('emit-bp', { padding: 8, '@md': { padding: 16 }, '@lg': { padding: 24 } });
    const css = sheet();
    expect(css).toContain('@media (min-width: 768px) { .emit-bp { padding: 16px; } }');
    expect(css).toContain('@media (min-width: 1024px) { .emit-bp { padding: 24px; } }');
  });

  it('custom property é preservada (sem camel→kebab); boolean é descartado', () => {
    style('emit-custom', { '--gap-x': '4px', color: 'red', hidden: false });
    const css = sheet();
    expect(css).toContain('.emit-custom { --gap-x: 4px; color: red; }');
    expect(css).not.toContain('hidden');
  });

  it('style.css injeta seletor cru (escape hatch global)', () => {
    style.css('.emit-global-hatch', { margin: 0, boxSizing: 'border-box' });
    expect(sheet()).toContain('.emit-global-hatch { margin: 0px; box-sizing: border-box; }');
  });

  it('regra idêntica não é injetada duas vezes (dedup por string)', () => {
    style.css('.emit-idem', { color: 'red' });
    style.css('.emit-idem', { color: 'red' });
    const occurrences = sheet().split('.emit-idem { color: red; }').length - 1;
    expect(occurrences).toBe(1);
  });

  it('atalho \u003eparte declara partes descendentes de forma plana', () => {
    const card = style('emit-card-shortcut', {
      display: 'block',
      '>title': { fontWeight: 700 },
      '>content': {
        padding: 16,
        '>description': { color: '#666' },
      },
    });

    const css = sheet();
    expect(css).toContain('.emit-card-shortcut { display: block; }');
    expect(css).toContain('.emit-card-shortcut .-emit-card-shortcut-title { font-weight: 700; }');
    expect(css).toContain('.emit-card-shortcut .-emit-card-shortcut-content { padding: 16px; }');
    expect(css).toContain(
      '.emit-card-shortcut .-emit-card-shortcut-content .-emit-card-shortcut-description { color: #666; }',
    );
    expect(card.title.self).toBe('-emit-card-shortcut-title');
    expect(card.content.description.self).toBe('-emit-card-shortcut-description');
  });

  it('atalho \u003eparte mistura com parts explícito e shortcut prevalece em conflito', () => {
    const card = style('emit-card-mixed', {
      parts: {
        header: { color: 'blue' },
      },
      '>header': { background: 'white' },
      '>footer': { color: 'gray' },
    });

    const css = sheet();
    expect(css).toContain('.emit-card-mixed .-emit-card-mixed-header { color: blue; background: white; }');
    expect(css).toContain('.emit-card-mixed .-emit-card-mixed-footer { color: gray; }');
    expect(card.header.self).toBe('-emit-card-mixed-header');
    expect(card.footer.self).toBe('-emit-card-mixed-footer');
  });
});
