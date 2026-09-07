import { describe, it, expect, vi } from 'vitest';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).

describe('$.style — warns', () => {
  it('avisa nome de bloco duplicado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('warn-dup-block', {});
    $.style('warn-dup-block', {});
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('avisa chave-objeto inesperada no topo (parte fora de parts)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('warn-loose-part', { title: { fontWeight: 700 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"title"'));
    warn.mockRestore();
  });

  it('avisa parte com nome reservado do handle', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    $.style('warn-reserved', { parts: { self: { color: 'red' } } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('reservado'));
    warn.mockRestore();
  });
});
