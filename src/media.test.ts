import { describe, it, expect, beforeEach, vi } from 'vitest';
import $ from './index';
import { preact } from './adapters/preact';

$.useSignal(preact);

describe('$.media — sinal de breakpoint', () => {
  beforeEach(() => {
    $.config({ breakpoints: { md: 768, lg: '1024px' } });
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
