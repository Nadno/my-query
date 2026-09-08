import { describe, it, expect, vi, afterEach } from 'vitest';
import { on } from '../apply';
import { handle } from '../handle';
import {
  registerCustomEvent,
  getCustomEvent,
  type EventSource,
} from '../custom';
import { createScope, runInScope, disposeScope, type Scope } from '../../lifecycle';
import type { MQ } from '../../types';

/** Roda `on` num escopo real e devolve o cleanup retornado + o disposeScope. */
function bind<E extends Element>(
  el: E,
  run: (ctx: MQ<E>) => (() => void) | void,
): { ctx: MQ<E>; ret?: () => void; dispose: () => void } {
  const scope: Scope = createScope(null);
  const ctx = { element: el } as MQ<E>;
  let ret: (() => void) | void = undefined;
  runInScope(scope, () => {
    ret = run(ctx);
  });
  return { ctx, ret: ret ?? undefined, dispose: () => disposeScope(scope) };
}

describe('on — evento nativo', () => {
  it('liga o listener e chama o handler com (event, ctx)', () => {
    const el = document.createElement('button');
    const fn = vi.fn();
    const { ctx } = bind(el, (c) => on(c, 'click', fn));
    el.click();
    expect(fn).toHaveBeenCalledOnce();
    const [event, passedCtx] = fn.mock.calls[0]!;
    expect(event).toBeInstanceOf(Event);
    expect(passedCtx).toBe(ctx);
  });

  it('aceita tupla [handler, ...modificadores, options]', () => {
    const input = document.createElement('input');
    const add = vi.spyOn(input, 'addEventListener');
    const fn = vi.fn();
    bind(input, (c) =>
      on(c, 'keydown', [fn, handle.keys('Enter'), { capture: true }]),
    );

    // options da tupla chegam ao addEventListener
    expect(add).toHaveBeenCalledWith('keydown', expect.any(Function), {
      capture: true,
    });
    // modificador `keys('Enter')` filtra
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(fn).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('on — roteamento de custom event', () => {
  const registered: string[] = [];
  afterEach(() => {
    // não há unregister público; sobrescreve por no-op p/ não vazar entre testes
    for (const name of registered.splice(0)) {
      registerCustomEvent(name, () => () => {});
    }
  });

  it('usa a EventSource registrada em vez de addEventListener', () => {
    const el = document.createElement('div');
    const cleanupSpy = vi.fn();
    let emit!: (e: Event) => void;
    const source: EventSource = (_target, e) => {
      emit = e;
      return cleanupSpy;
    };
    registerCustomEvent('fakeEvent', source);
    registered.push('fakeEvent');
    expect(getCustomEvent('fakeEvent')).toBe(source);

    const add = vi.spyOn(el, 'addEventListener');
    const fn = vi.fn();
    const { ctx, dispose } = bind(el, (c) => on(c, 'fakeEvent', fn));

    expect(add).not.toHaveBeenCalled();
    const ev = new Event('fakeEvent');
    emit(ev);
    expect(fn).toHaveBeenCalledWith(ev, ctx);

    dispose();
    expect(cleanupSpy).toHaveBeenCalledOnce();
  });
});

describe('on — cleanup', () => {
  it('auto-registra: disposeScope remove o listener', () => {
    const el = document.createElement('button');
    const fn = vi.fn();
    const { dispose } = bind(el, (c) => on(c, 'click', fn));
    el.click();
    expect(fn).toHaveBeenCalledOnce();
    dispose();
    el.click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retorna cleanup que desliga na hora, antes do teardown do escopo', () => {
    const el = document.createElement('button');
    const fn = vi.fn();
    const { ret } = bind(el, (c) => on(c, 'click', fn));
    el.click();
    expect(fn).toHaveBeenCalledOnce();
    ret!();
    el.click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('cleanup é idempotente: chamar manual + disposeScope não remove duas vezes', () => {
    const el = document.createElement('button');
    const remove = vi.spyOn(el, 'removeEventListener');
    const { ret, dispose } = bind(el, (c) => on(c, 'click', vi.fn()));
    ret!();
    expect(remove).toHaveBeenCalledOnce();
    ret!(); // 2ª chamada manual = no-op
    dispose(); // teardown do escopo = no-op (já removido)
    expect(remove).toHaveBeenCalledOnce();
  });

  it('fora de escopo degrada em silêncio (sem throw) e ainda liga', () => {
    const el = document.createElement('button');
    const fn = vi.fn();
    const ctx = { element: el } as MQ;
    expect(() => on(ctx, 'click', fn)).not.toThrow();
    el.click();
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('on — inferência de tipo do evento pelo nome', () => {
  it('infere nativo e custom (smoke de compilação)', () => {
    const ctx = { element: document.createElement('button') } as MQ;
    // nativo → MouseEvent (e.button existe)
    on(ctx, 'click', (e) => void e.button);
    // custom registrado → PointerEvent (e.pointerId existe)
    on(ctx, 'clickOutside', (e) => void e.pointerId);
    // custom arbitrário → fallback Event, sem erro de tipo
    on(ctx, 'whatever', (e) => void e.type);
    expect(true).toBe(true);
  });
});
