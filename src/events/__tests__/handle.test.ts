import { describe, it, expect, vi, afterEach } from 'vitest';
import { handle, compose } from '../handle';
import type { Handler, Modifier } from '../types';
import type { MQ } from '../../types';

/** ctx mínimo: os modificadores só leem `ctx.element` (o `self`). */
const ctxFor = (element: Element = document.createElement('div')): MQ =>
  ({ element }) as MQ;

describe('compose — ordem', () => {
  it('o 1º modificador é o mais externo (roda primeiro)', () => {
    const order: string[] = [];
    const a: Modifier = (next) => (e, ctx) => {
      order.push('a');
      next(e, ctx);
    };
    const b: Modifier = (next) => (e, ctx) => {
      order.push('b');
      next(e, ctx);
    };
    const composed = compose<Event>(() => order.push('handler'), [a, b]);
    composed(new Event('x'), ctxFor());
    expect(order).toEqual(['a', 'b', 'handler']);
  });

  it('sem modificadores devolve o handler intacto', () => {
    const fn: Handler = () => {};
    expect(compose(fn, [])).toBe(fn);
  });
});

describe('handle callable', () => {
  it('handle(fn, ...mods) equivale à forma array de on:', () => {
    let entered = 0;
    const h = handle<KeyboardEvent>(
      () => entered++,
      handle.keys('Enter'),
      handle.prevent as unknown as Modifier<KeyboardEvent>,
    );
    const prevented = vi.fn();
    h(
      Object.assign(new KeyboardEvent('keydown', { key: 'a' }), {
        preventDefault: prevented,
      }),
      ctxFor(),
    );
    expect(entered).toBe(0);
    expect(prevented).not.toHaveBeenCalled();

    h(
      Object.assign(new KeyboardEvent('keydown', { key: 'Enter' }), {
        preventDefault: prevented,
      }),
      ctxFor(),
    );
    expect(entered).toBe(1);
    expect(prevented).toHaveBeenCalledOnce();
  });
});

describe('modificadores', () => {
  it('prevent chama preventDefault e prossegue', () => {
    const fn = vi.fn();
    const e = { preventDefault: vi.fn() } as unknown as Event;
    compose(fn, [handle.prevent])(e, ctxFor());
    expect(e.preventDefault).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('stop chama stopPropagation e prossegue', () => {
    const fn = vi.fn();
    const e = { stopPropagation: vi.fn() } as unknown as Event;
    compose(fn, [handle.stop])(e, ctxFor());
    expect(e.stopPropagation).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('self só passa quando e.target === ctx.element', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    const fn = vi.fn();
    const guarded = compose(fn, [handle.self]);

    guarded({ target: child } as unknown as Event, ctxFor(el));
    expect(fn).not.toHaveBeenCalled();

    guarded({ target: el } as unknown as Event, ctxFor(el));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('keys filtra por e.key', () => {
    const fn = vi.fn();
    const guarded = compose<KeyboardEvent>(fn, [handle.keys('Enter', 'Escape')]);
    guarded(new KeyboardEvent('keydown', { key: 'a' }), ctxFor());
    expect(fn).not.toHaveBeenCalled();
    guarded(new KeyboardEvent('keydown', { key: 'Escape' }), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
  });

  it('alt/ctrl/shift/meta filtram pela flag correspondente', () => {
    const cases = [
      ['alt', 'altKey'],
      ['ctrl', 'ctrlKey'],
      ['shift', 'shiftKey'],
      ['meta', 'metaKey'],
    ] as const;
    for (const [mod, flag] of cases) {
      const fn = vi.fn();
      const guarded = compose(fn, [handle[mod] as unknown as Modifier]);
      guarded({ [flag]: false } as unknown as Event, ctxFor());
      expect(fn, `${mod} barra sem a flag`).not.toHaveBeenCalled();
      guarded({ [flag]: true } as unknown as Event, ctxFor());
      expect(fn, `${mod} passa com a flag`).toHaveBeenCalledOnce();
    }
  });
});

describe('debounce / throttle', () => {
  afterEach(() => vi.useRealTimers());

  it('debounce só dispara a última chamada após ms', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = compose(fn, [handle.debounce(100)]);
    d(new Event('x'), ctxFor());
    d(new Event('x'), ctxFor());
    d(new Event('x'), ctxFor());
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('throttle passa a 1ª e barra dentro da janela', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000); // base não-zero: throttle inicia com last=0
    const fn = vi.fn();
    const t = compose(fn, [handle.throttle(100)]);
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('handle.handlers', () => {
  it('aceita spec função e [handler, ...mods], compondo cada uma', () => {
    let saved = 0;
    const prevented = vi.fn();
    const map = handle.handlers({
      save: () => saved++,
      submit: [() => saved++, handle.prevent],
    });

    map.save(new Event('click'), ctxFor());
    expect(saved).toBe(1);

    map.submit(
      Object.assign(new Event('submit'), { preventDefault: prevented }),
      ctxFor(),
    );
    expect(saved).toBe(2);
    expect(prevented).toHaveBeenCalledOnce();
  });
});
