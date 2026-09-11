import { describe, expect, it } from 'vitest';

import { CheckGroup } from './CheckGroup';

describe('CheckGroup', () => {
  it('registra e consulta estados por nome', () => {
    const group = CheckGroup.of();
    group.register('a', false);
    group.register('b', true);
    expect(group.isChecked('a')).toBe(false);
    expect(group.isChecked('b')).toBe(true);
    expect(group.has('a')).toBe(true);
    expect(group.has('c')).toBe(false);
  });

  it('unregister remove o item', () => {
    const group = CheckGroup.of();
    group.register('a', true);
    group.unregister('a');
    expect(group.has('a')).toBe(false);
    expect(group.checked).toEqual([]);
  });

  it('defaultChecked: registra o nome default como checado', () => {
    const group = CheckGroup.of({ defaultChecked: 'a' });
    group.register('a', false);
    group.register('b', false);
    expect(group.isChecked('a')).toBe(true);
    expect(group.isChecked('b')).toBe(false);
  });

  it('multiple (default false): checar um novo desmarca o atual', () => {
    const group = CheckGroup.of();
    group.register('a', true);
    group.register('b', true);
    expect(group.isChecked('a')).toBe(false);
    expect(group.isChecked('b')).toBe(true);
  });

  it('multiple: true mantém vários checados', () => {
    const group = CheckGroup.of({ multiple: true });
    group.register('a', true);
    group.register('b', true);
    expect(group.isChecked('a')).toBe(true);
    expect(group.isChecked('b')).toBe(true);
  });

  it('allowAllUnchecked (default true): é possível desmarcar tudo', () => {
    const group = CheckGroup.of();
    group.register('a', true);
    group.set('a', false);
    expect(group.isChecked('a')).toBe(false);
    expect(group.checked).toEqual([]);
  });

  it('allowAllUnchecked: false mantém o último checado', () => {
    const group = CheckGroup.of({ allowAllUnchecked: false });
    group.register('a', true);
    group.set('a', false);
    expect(group.isChecked('a')).toBe(true);
  });

  it('set não cria itens não registrados', () => {
    const group = CheckGroup.of();
    group.set('x', true);
    expect(group.has('x')).toBe(false);
  });

  it('expoõe checked como lista dos nomes checados', () => {
    const group = CheckGroup.of({ multiple: true });
    group.register('a', true);
    group.register('b', false);
    group.register('c', true);
    expect(group.checked).toEqual(['a', 'c']);
  });

  it('multiple false + allowAllUnchecked false: trocar preserva um checado', () => {
    const group = CheckGroup.of({ multiple: false, allowAllUnchecked: false });
    group.register('a', true);
    group.set('a', false);
    expect(group.isChecked('a')).toBe(true);
    group.register('b', false);
    group.set('b', true);
    expect(group.isChecked('a')).toBe(false);
    expect(group.isChecked('b')).toBe(true);
  });

  it('allowAllUnchecked false: registrar dois itens desmarcados mantém o default', () => {
    const group = CheckGroup.of({ allowAllUnchecked: false, defaultChecked: 'a' });
    group.register('a', false);
    group.register('b', false);
    expect(group.checked).toEqual(['a']);
  });
});
