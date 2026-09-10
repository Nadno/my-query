import { describe, it, expect, beforeEach } from 'vitest';
import { isNode, isTeleported, resolveClass, cx, toNodes, getElement } from './nodes';
import { style } from '../style';
import { TELEPORTED } from '../types';
import type { ClassValue } from '../types';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('isNode', () => {
  it('reconhece Node e rejeita não-nós', () => {
    expect(isNode(document.createElement('div'))).toBe(true);
    expect(isNode(document.createTextNode('x'))).toBe(true);
    expect(isNode({})).toBe(false);
    expect(isNode('x')).toBe(false);
    expect(isNode(null)).toBe(false);
  });
});

describe('isTeleported', () => {
  it('true só para nó marcado com TELEPORTED', () => {
    const el = document.createElement('div');
    expect(isTeleported(el)).toBe(false);
    (el as Element & { [TELEPORTED]?: boolean })[TELEPORTED] = true;
    expect(isTeleported(el)).toBe(true);
  });
});

describe('resolveClass', () => {
  it('string e número', () => {
    expect(resolveClass('a b')).toBe('a b');
    expect(resolveClass(42)).toBe('42');
  });

  it('falsy → vazio', () => {
    expect(resolveClass('')).toBe('');
    expect(resolveClass(false)).toBe('');
    expect(resolveClass(null)).toBe('');
    expect(resolveClass(undefined)).toBe('');
  });

  it('StyleHandle (callable com brand) → classe com defaults', () => {
    const btn = style('nodes-btn', {
      variants: { size: { sm: {}, md: {} } },
      defaults: { size: 'md' },
    });
    expect(resolveClass(btn)).toBe('nodes-btn --size-md');
  });

  it('função sem brand é ignorada (não enumera props de função)', () => {
    expect(resolveClass((() => 'x') as unknown as ClassValue)).toBe('');
  });

  it('array recursivo achata e descarta falsy', () => {
    expect(resolveClass(['a', ['b', 'c'], false, null])).toBe('a b c');
  });

  it('record aplica só chaves truthy', () => {
    expect(resolveClass({ a: true, b: false, c: 1, d: null } as unknown as ClassValue)).toBe('a c');
  });
});

describe('cx', () => {
  it('compõe condicionais (clsx-like)', () => {
    expect(cx('a', false, 'b', ['c', null], { d: true })).toBe('a b c d');
  });
});

describe('toNodes', () => {
  it('nullish/boolean → lista vazia', () => {
    expect(toNodes(null)).toEqual([]);
    expect(toNodes(undefined)).toEqual([]);
    expect(toNodes(false)).toEqual([]);
    expect(toNodes(true)).toEqual([]);
  });

  it('array aninhado achata preservando nós e primitivos', () => {
    const a = document.createElement('span');
    const b = document.createTextNode('b');
    const nodes = toNodes(['x', [a, [b]], 1]);
    expect(nodes).toHaveLength(4);
    expect(nodes[0]).toBeInstanceOf(Text);
    expect(nodes[1]).toBe(a);
    expect(nodes[2]).toBe(b);
    expect(nodes[3]).toBeInstanceOf(Text);
  });

  it('Node → [node]', () => {
    const el = document.createElement('div');
    expect(toNodes(el)).toEqual([el]);
  });

  it('primitivo → text node', () => {
    const [n] = toNodes('oi');
    expect(n).toBeInstanceOf(Text);
    expect(n!.textContent).toBe('oi');
  });
});

describe('getElement', () => {
  it('seletor resolve para elemento', () => {
    const el = document.createElement('div');
    el.id = 'alvo';
    document.body.appendChild(el);
    expect(getElement('#alvo')).toBe(el);
  });

  it('elemento passa direto', () => {
    const el = document.createElement('div');
    expect(getElement(el)).toBe(el);
  });

  it('seletor sem match lança', () => {
    expect(() => getElement('#nao-existe')).toThrow(/Nenhum elemento/);
  });
});
