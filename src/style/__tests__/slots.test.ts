import { describe, it, expect, vi } from 'vitest';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('$.style — slots (composição de bloco estrangeiro)', () => {
  it('flag mira o slot por descendente até a classe do bloco hospedado (slot por handle)', () => {
    const control = $.style('slot-input', { padding: 8 });
    const field = $.style('slot-field', {
      slots: { control },
      flags: { invalid: { slots: { control: { borderColor: 'crimson' } } } },
    });

    expect(field.slots.control).toBe('slot-input');
    expect(sheet()).toContain('.slot-field.--is-invalid .slot-input { border-color: crimson; }');
  });

  it('slot declarado como classe crua (string) também resolve', () => {
    const field = $.style('slot-raw-field', {
      slots: { control: 'external-control' },
      flags: { invalid: { slots: { control: { borderColor: 'red' } } } },
    });

    expect(field.slots.control).toBe('external-control');
    expect(sheet()).toContain('.slot-raw-field.--is-invalid .external-control { border-color: red; }');
  });

  it('override de slot não declarado avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('slot-warn', { flags: { on: { slots: { ghost: { color: 'red' } } } } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('slot "ghost"'));
    warn.mockRestore();
  });
});
