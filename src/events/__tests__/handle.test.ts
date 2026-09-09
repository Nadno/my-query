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

describe('propagação de retorno', () => {
  it('modificadores propagam o retorno do handler (cleanup do un-enter)', () => {
    const cleanup = vi.fn();
    const composed = compose(() => cleanup, [handle.prevent]);
    const ret = composed(new Event('x'), ctxFor());
    expect(ret).toBe(cleanup);
  });

  it('self filtrado devolve undefined (sem chamar o handler)', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    const composed = compose(() => vi.fn(), [handle.self]);
    const ret = composed({ target: child } as unknown as Event, ctxFor(el));
    expect(ret).toBeUndefined();
  });
});

describe('debounce / throttle', () => {
  afterEach(() => vi.useRealTimers());

  it('debounce só dispara a última chamada após ms (trailing default)', () => {
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

  it('debounce com leading dispara a 1ª imediatamente e a última após ms', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000); // base não-zero: leading precisa de lastInvoke no passado
    const fn = vi.fn();
    const d = compose(fn, [handle.debounce(100, { leading: true })]);
    d(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce(); // leading
    d(new Event('x'), ctxFor());
    d(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce(); // trailing ainda não
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // trailing
  });

  it('debounce com leading e sem trailing só dispara a 1ª', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const fn = vi.fn();
    const d = compose(fn, [handle.debounce(100, { leading: true, trailing: false })]);
    d(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
    d(new Event('x'), ctxFor());
    d(new Event('x'), ctxFor());
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('debounce com maxWait dispara no máximo a cada maxWait', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const fn = vi.fn();
    const d = compose(fn, [handle.debounce(200, { maxWait: 100 })]);
    d(new Event('x'), ctxFor());
    d(new Event('x'), ctxFor());
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce(); // maxWait
    d(new Event('x'), ctxFor());
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // maxWait de novo
  });

  it('debounce com leading propaga o retorno do handler (síncrono)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const cleanup = vi.fn();
    const d = compose(() => cleanup, [handle.debounce(100, { leading: true })]);
    const ret = d(new Event('x'), ctxFor());
    expect(ret).toBe(cleanup);
  });

  it('throttle default: leading imediato + trailing no fim da janela', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const fn = vi.fn();
    const t = compose(fn, [handle.throttle(100)]);
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce(); // leading
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce(); // trailing ainda não
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2); // trailing disparou
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledTimes(2); // nova janela, sem leading ainda
  });

  it('throttle com trailing:false só dispara a 1ª da janela (comportamento antigo)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const fn = vi.fn();
    const t = compose(fn, [handle.throttle(100, { trailing: false })]);
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    t(new Event('x'), ctxFor());
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throttle propaga o retorno do handler na invocação leading', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const cleanup = vi.fn();
    const t = compose(() => cleanup, [handle.throttle(100)]);
    const ret = t(new Event('x'), ctxFor());
    expect(ret).toBe(cleanup);
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
