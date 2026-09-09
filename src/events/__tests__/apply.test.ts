import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyEvents } from '../apply';
import { handle } from '../handle';
import {
  registerCustomEvent,
  getCustomEvent,
  type EventSource,
} from '../custom';
import { createScope, runInScope, disposeScope, type Scope } from '../../lifecycle';
import type { MQ } from '../../types';

/** Roda `applyEvents` num escopo real e devolve o disposeScope + o ctx. */
function mountEvents(
  el: Element,
  onMap: Record<string, unknown>,
): { ctx: MQ; dispose: () => void } {
  const scope: Scope = createScope(null);
  const ctx = { element: el } as MQ;
  runInScope(scope, () => applyEvents(ctx, onMap as never));
  return { ctx, dispose: () => disposeScope(scope) };
}

describe('applyEvents — roteamento nativo', () => {
  it('registra listener nativo e passa options da tupla', () => {
    const el = document.createElement('button');
    const add = vi.spyOn(el, 'addEventListener');
    const fn = vi.fn();
    mountEvents(el, { click: [fn, { once: true, capture: true }] });

    expect(add).toHaveBeenCalledWith('click', expect.any(Function), {
      once: true,
      capture: true,
    });
    el.click();
    expect(fn).toHaveBeenCalledOnce();
    // `once` → segundo clique não dispara
    el.click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('aplica os modificadores da tupla ao handler', () => {
    const input = document.createElement('input');
    const fn = vi.fn();
    mountEvents(input, { keydown: [fn, handle.keys('Enter')] });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(fn).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('cleanup remove o listener no dispose (liga com E1)', () => {
    const el = document.createElement('button');
    const fn = vi.fn();
    const { dispose } = mountEvents(el, { click: fn });
    el.click();
    expect(fn).toHaveBeenCalledOnce();
    dispose();
    el.click();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('valor nullish é ignorado (sem listener)', () => {
    const el = document.createElement('button');
    const add = vi.spyOn(el, 'addEventListener');
    mountEvents(el, { click: undefined });
    expect(add).not.toHaveBeenCalled();
  });
});

describe('applyEvents — roteamento custom', () => {
  const NAME = 'mqTestCustom';
  let cleanup: ReturnType<typeof vi.fn>;
  let source: ReturnType<typeof vi.fn>;

  afterEach(() => vi.restoreAllMocks());

  it('usa a EventSource (não o addEventListener nativo) e limpa a fonte no dispose', () => {
    cleanup = vi.fn();
    let emit!: (e: Event) => void;
    source = vi.fn<EventSource>((_target, e) => {
      emit = e;
      return cleanup;
    });
    registerCustomEvent(NAME, source as unknown as EventSource);
    expect(getCustomEvent(NAME)).toBe(source);

    const el = document.createElement('div');
    const add = vi.spyOn(el, 'addEventListener');
    const fn = vi.fn();
    const { ctx, dispose } = mountEvents(el, { [NAME]: fn });

    expect(source).toHaveBeenCalledWith(el, expect.any(Function), undefined);
    expect(add).not.toHaveBeenCalled();

    const ev = new Event(NAME);
    emit(ev);
    expect(fn).toHaveBeenCalledWith(ev, ctx);

    dispose();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('opções da tupla chegam à EventSource (canal de opções)', () => {
    let received: unknown;
    const optsSource = vi.fn<EventSource>((_target, _emit, opts) => {
      received = opts;
      return () => {};
    });
    registerCustomEvent(NAME, optsSource as unknown as EventSource);
    expect(getCustomEvent(NAME)).toBe(optsSource);

    const el = document.createElement('div');
    mountEvents(el, { [NAME]: [vi.fn(), { touchable: true, delayIn: 100 }] });
    expect(received).toEqual({ touchable: true, delayIn: 100 });
  });
});

describe('applyEvents — fluxo pareado via on: {}', () => {
  it('on: { hover: handler } — handler devolve cleanup; pointerleave o roda', () => {
    const el = document.createElement('div');
    const leave = vi.fn();
    const fn = vi.fn(() => leave);
    const { dispose } = mountEvents(el, { hover: fn });

    el.dispatchEvent(new Event('pointerenter'));
    expect(fn).toHaveBeenCalledOnce();
    expect(leave).not.toHaveBeenCalled();

    el.dispatchEvent(new Event('pointerleave'));
    expect(leave).toHaveBeenCalledOnce();

    dispose();
  });
});
