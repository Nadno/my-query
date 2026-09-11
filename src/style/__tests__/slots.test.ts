import { describe, it, expect, vi } from 'vitest';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';
import { style } from '../index';

$useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('style — hosts (composição de bloco estrangeiro)', () => {
  it('flag mira o host por descendente até a classe do bloco hospedado (host por handle)', () => {
    const control = style('slot-input', { padding: 8 });
    const field = style('slot-field', {
      $: { hosts: { control } },
      flags: { invalid: { hosts: { control: { borderColor: 'crimson' } } } },
    });

    expect(field.hosts.control).toBe('slot-input');
    expect(sheet()).toContain('.slot-field.--is-invalid .slot-input { border-color: crimson; }');
  });

  it('host declarado como classe crua (string) também resolve', () => {
    const field = style('slot-raw-field', {
      $: { hosts: { control: 'external-control' } },
      flags: { invalid: { hosts: { control: { borderColor: 'red' } } } },
    });

    expect(field.hosts.control).toBe('external-control');
    expect(sheet()).toContain('.slot-raw-field.--is-invalid .external-control { border-color: red; }');
  });

  it('override de host não declarado avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    style('slot-warn', { flags: { on: { hosts: { ghost: { color: 'red' } } } } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('host "ghost"'));
    warn.mockRestore();
  });
});
