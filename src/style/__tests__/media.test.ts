import { describe, it, expect, beforeEach, vi } from 'vitest';
import $ from '../../index';
import { $mount, $useSignal } from '../../index';
import { preact } from '../../adapters/preact';
import { config, media } from '../index';
import { resolveMedia } from '../config';

$useSignal(preact);

describe('media — sinal de breakpoint', () => {
  beforeEach(() => {
    config({ breakpoints: { md: 768, lg: '1024px' } });
  });

  it('sinal reflete matchMedia e limpa o listener no unmount', () => {
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
      md = media('md');
      return $.div({ $class: () => (md.value ? 'wide' : 'narrow') });
    };
    const unmount = $mount(document.body, App);

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

describe('media — resolveMedia / toQuery', () => {
  it('nome registrado, número, string numérica e query crua', () => {
    config({ breakpoints: { md: 768, lg: '1024px' } });
    expect(resolveMedia('md')).toBe('(min-width: 768px)');
    expect(resolveMedia('lg')).toBe('(min-width: 1024px)');
    expect(resolveMedia('768')).toBe('(min-width: 768px)');
    expect(resolveMedia('768px')).toBe('(min-width: 768px)');
    expect(resolveMedia('(min-width: 900px)')).toBe('(min-width: 900px)');
    expect(resolveMedia('screen and (color)')).toBe('screen and (color)');
  });
});

describe('media — sem matchMedia (SSR)', () => {
  it('devolve signal estático false sem lançar', () => {
    const original = (globalThis as Record<string, unknown>).matchMedia;
    (globalThis as Record<string, unknown>).matchMedia = undefined;
    try {
      const sig = media('md');
      expect(sig.value).toBe(false);
    } finally {
      (globalThis as Record<string, unknown>).matchMedia = original;
    }
  });
});
