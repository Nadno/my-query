import { describe, it, expect, vi } from 'vitest';
import {
  createScope,
  runInScope,
  registerCleanup,
  disposeScope,
  currentScope,
  onMounted,
  onUnmounted,
} from './lifecycle';

describe('lifecycle — contrato de escopo e cleanup', () => {
  it('disposeScope roda os cleanups em ordem inversa do registro', () => {
    const order: number[] = [];
    const scope = createScope(null);
    runInScope(scope, () => {
      registerCleanup(() => order.push(1));
      registerCleanup(() => order.push(2));
      registerCleanup(() => order.push(3));
    });

    disposeScope(scope);
    expect(order).toEqual([3, 2, 1]);
  });

  it('um cleanup que lança não aborta os irmãos (isolamento via try/catch)', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ran: string[] = [];
    const scope = createScope(null);
    runInScope(scope, () => {
      registerCleanup(() => ran.push('a'));
      registerCleanup(() => {
        throw new Error('boom');
      });
      registerCleanup(() => ran.push('c'));
    });

    expect(() => disposeScope(scope)).not.toThrow();
    // ordem inversa: 'c' (topo), depois o que lança, depois 'a' — ambos os não-lançantes rodam
    expect(ran).toEqual(['c', 'a']);
    expect(err).toHaveBeenCalledWith('[mini-q] cleanup error', expect.any(Error));
    err.mockRestore();
  });

  it('registerCleanup fora de escopo é no-op (não lança, não chama) e currentScope é null', () => {
    expect(currentScope()).toBeNull();
    const fn = vi.fn();
    expect(() => registerCleanup(fn)).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
    expect(currentScope()).toBeNull();
  });

  it('disposeScope esvazia o escopo: chamar de novo não re-roda cleanups', () => {
    const fn = vi.fn();
    const scope = createScope(null);
    runInScope(scope, () => registerCleanup(fn));

    disposeScope(scope);
    expect(fn).toHaveBeenCalledTimes(1);
    disposeScope(scope); // segunda passada: nada a rodar
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runInScope restaura o escopo anterior ao terminar (aninhamento)', () => {
    const outer = createScope(null);
    const inner = createScope(outer);
    expect(currentScope()).toBeNull();
    runInScope(outer, () => {
      expect(currentScope()).toBe(outer);
      runInScope(inner, () => {
        expect(currentScope()).toBe(inner);
      });
      expect(currentScope()).toBe(outer);
    });
    expect(currentScope()).toBeNull();
  });
});

describe('lifecycle — onMounted / onUnmounted (hooks públicos)', () => {
  it('onMounted roda fn imediatamente (síncrono) dentro do escopo', () => {
    const scope = createScope(null);
    const fn = vi.fn();
    runInScope(scope, () => {
      onMounted(fn);
      expect(fn).toHaveBeenCalledTimes(1); // já rodou, sem esperar dispose
    });
  });

  it('onMounted cujo fn retorna função → o retorno vira teardown no disposeScope', () => {
    const order: string[] = [];
    const scope = createScope(null);
    runInScope(scope, () => {
      registerCleanup(() => order.push('a'));
      onMounted(() => {
        order.push('mount');
        return () => order.push('teardown');
      });
    });

    expect(order).toEqual(['mount']); // só o mount rodou até aqui
    disposeScope(scope);
    // ordem inversa de registro: teardown do onMounted (topo) antes de 'a'
    expect(order).toEqual(['mount', 'teardown', 'a']);
  });

  it('onMounted cujo fn não retorna função → disposeScope não quebra', () => {
    const scope = createScope(null);
    runInScope(scope, () => {
      onMounted(() => {
        /* efeito sem teardown */
      });
    });
    expect(() => disposeScope(scope)).not.toThrow();
  });

  it('onUnmounted registra o teardown no escopo ativo (roda no dispose)', () => {
    const fn = vi.fn();
    const scope = createScope(null);
    runInScope(scope, () => onUnmounted(fn));

    expect(fn).not.toHaveBeenCalled();
    disposeScope(scope);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('fora de escopo: onMounted roda fn uma vez + warn, não registra teardown', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(currentScope()).toBeNull();
    const teardown = vi.fn();
    const fn = vi.fn(() => teardown);

    onMounted(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onMounted fora de escopo'));
    // não havia escopo → o teardown retornado não roda nunca
    expect(teardown).not.toHaveBeenCalled();
    expect(currentScope()).toBeNull();
    warn.mockRestore();
  });

  it('fora de escopo: onUnmounted é no-op + warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fn = vi.fn();

    expect(() => onUnmounted(fn)).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('onUnmounted fora de escopo'));
    warn.mockRestore();
  });
});
