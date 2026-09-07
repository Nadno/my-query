import { describe, it, expect } from 'vitest';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('$.style — flags e variants coexistem; callable', () => {
  it('bloco com partes E variantes E flags; tokens no call-site', () => {
    const btn = $.style('var-btn', {
      border: 'none',
      parts: { icon: { width: 16 } },
      variants: { size: { sm: { padding: 4 }, md: { padding: 8 } } },
      flags: { block: { display: 'block' } },
      defaults: { size: 'md' },
    });

    expect(btn.icon.self).toBe('-var-btn-icon'); // parte não descartada com variants
    expect(btn.variants.size.sm).toBe('--size-sm');
    expect(btn.flags.block).toBe('--is-block');

    expect(btn()).toBe('var-btn --size-md'); // default de variante
    expect(btn({ size: 'sm' })).toBe('var-btn --size-sm');
    expect(btn({ size: 'sm', block: true })).toBe('var-btn --size-sm --is-block');

    const css = sheet();
    expect(css).toContain('.var-btn.--size-sm { padding: 4px; }');
    expect(css).toContain('.var-btn.--is-block { display: block; }');
    expect(css).toContain('.var-btn .-var-btn-icon { width: 16px; }');
  });

  it('variante pode sobrescrever uma parte descendente (variants → parts)', () => {
    $.style('var-parts', {
      parts: { label: {} },
      variants: { tone: { danger: { parts: { label: { color: 'red' } } } } },
    });
    expect(sheet()).toContain('.var-parts.--tone-danger .-var-parts-label { color: red; }');
  });

  it('variante pode sobrescrever um slot hospedado (variants → slots)', () => {
    const control = $.style('var-slot-input', { padding: 8 });
    $.style('var-slot-field', {
      slots: { control },
      variants: { tone: { danger: { slots: { control: { borderColor: 'crimson' } } } } },
    });
    expect(sheet()).toContain('.var-slot-field.--tone-danger .var-slot-input { border-color: crimson; }');
  });

  it('call-site: false desliga a default, valor inexistente é ignorado, flag só liga com true', () => {
    const btn = $.style('var-callsite', {
      variants: { size: { sm: {}, md: {} } },
      flags: { block: {} },
      defaults: { size: 'md' },
    });
    // Entradas defensivas que a assinatura tipada proíbe (false/valor fora do grupo,
    // truthy não-boolean): o runtime as trata, então miramos a call por baixo dos tipos.
    const loose = btn as (props?: Record<string, unknown>) => string;

    expect(btn()).toBe('var-callsite --size-md'); // default aplicada
    expect(loose({ size: false })).toBe('var-callsite'); // false desliga a default
    expect(loose({ size: 'xl' })).toBe('var-callsite'); // valor inexistente: nenhum token
    expect(btn({ block: false })).toBe('var-callsite --size-md'); // flag desligada
    expect(loose({ block: 1 })).toBe('var-callsite --size-md'); // truthy ≠ true
    expect(btn({ block: true })).toBe('var-callsite --size-md --is-block');
  });
});
