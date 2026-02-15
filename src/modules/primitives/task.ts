/**
 * Task — Agendador de tarefas com suporte a strings de tempo, ID (Singleton),
 * debounce, throttle, retry e utilitários assíncronos.
 */
import { TimeSpan, type TimeInput } from './time-span';

// ========== TIPOS EXPORTADOS ==========

export type { TimeInput };
export type TaskHandler = () => void | Promise<void>;

export interface Job {
  readonly id: string;
  readonly type: 'timeout' | 'interval';
  readonly isActive: boolean;
  cancel(): void;
  run(): void;
}

export interface DebouncedFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  readonly isPending: boolean;
}

export interface ThrottledFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

// ========== REGISTRY ==========

type RegistryEntry = {
  timer: ReturnType<typeof setTimeout>;
  type: 'timeout' | 'interval';
  handler: TaskHandler;
};

const _registry = new Map<string, RegistryEntry>();

// ========== HELPERS INTERNOS ==========

let _seq = 0;
const _autoId = () => `task_${++_seq}`;

function _ms(time: TimeInput): number {
  return TimeSpan.from(time).totalMilliseconds;
}

function _createJob(
  id: string,
  type: 'timeout' | 'interval',
  handler: TaskHandler,
): Job {
  return {
    id,
    type,
    get isActive() {
      return _registry.has(id);
    },
    cancel() {
      Task.cancel(id);
    },
    run() {
      handler();
    },
  };
}

function _isTimeLike(str: string): boolean {
  return /^\d+$/.test(str) || TimeSpan.isValid(str);
}

function _parseArgs(
  a1: string | TimeInput,
  a2: TimeInput | TaskHandler,
  a3: TaskHandler | undefined,
): { id: string; time: TimeInput; handler: TaskHandler } {
  if (typeof a1 === 'string' && !_isTimeLike(a1) && a3 !== undefined) {
    return { id: a1, time: a2 as TimeInput, handler: a3 };
  }
  return { id: _autoId(), time: a1 as TimeInput, handler: a2 as TaskHandler };
}

// ========== CLASSE ==========

export class Task {
  private constructor() {}

  // ---------- TIMEOUT (WAIT) ----------

  static wait(time: TimeInput, handler: TaskHandler): Job;
  static wait(id: string, time: TimeInput, handler: TaskHandler): Job;
  static wait(
    a1: string | TimeInput,
    a2: TimeInput | TaskHandler,
    a3?: TaskHandler,
  ): Job {
    const { id, time, handler } = _parseArgs(a1, a2, a3);
    const delay = _ms(time);

    if (_registry.has(id)) Task.cancel(id);

    const timer = setTimeout(() => {
      handler();
      _registry.delete(id);
    }, delay);

    _registry.set(id, { timer, type: 'timeout', handler });
    return _createJob(id, 'timeout', handler);
  }

  // ---------- INTERVAL (EVERY) ----------

  static every(time: TimeInput, handler: TaskHandler): Job;
  static every(id: string, time: TimeInput, handler: TaskHandler): Job;
  static every(
    a1: string | TimeInput,
    a2: TimeInput | TaskHandler,
    a3?: TaskHandler,
  ): Job {
    const { id, time, handler } = _parseArgs(a1, a2, a3);
    const interval = _ms(time);

    if (_registry.has(id)) Task.cancel(id);

    const timer = setInterval(handler, interval);
    _registry.set(id, { timer, type: 'interval', handler });
    return _createJob(id, 'interval', handler);
  }

  // ---------- DEBOUNCE (factory, estilo lodash) ----------

  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: TimeInput,
  ): DebouncedFn<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    const debounced = (...args: Parameters<T>): void => {
      lastArgs = args;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        fn(...lastArgs!);
        lastArgs = undefined;
      }, _ms(delay));
    };

    debounced.cancel = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      lastArgs = undefined;
    };

    debounced.flush = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (lastArgs !== undefined) {
        fn(...lastArgs);
        lastArgs = undefined;
      }
    };

    Object.defineProperty(debounced, 'isPending', {
      get: () => timer !== undefined,
    });

    return debounced as unknown as DebouncedFn<T>;
  }

  // ---------- THROTTLE (factory, leading + trailing, estilo lodash) ----------
  // Não usa Date.now() — compatível com mock timers do node:test.
  // Lógica: leading na primeira chamada (timer livre), trailing ao fim da janela.

  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    delay: TimeInput,
  ): ThrottledFn<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    const throttled = (...args: Parameters<T>): void => {
      lastArgs = args;
      if (timer === undefined) {
        // Leading: janela livre — dispara imediatamente e abre a janela
        fn(...args);
        lastArgs = undefined;
        timer = setTimeout(() => {
          timer = undefined;
          if (lastArgs !== undefined) {
            // Trailing: houve chamadas durante a janela
            fn(...lastArgs);
            lastArgs = undefined;
          }
        }, _ms(delay));
      }
      // Janela ativa: lastArgs acumula, trailing será disparado no fim
    };

    throttled.cancel = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      lastArgs = undefined;
    };

    throttled.flush = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      if (lastArgs !== undefined) {
        fn(...lastArgs);
        lastArgs = undefined;
      }
    };

    return throttled as unknown as ThrottledFn<T>;
  }

  // ---------- SLEEP ----------

  static sleep(time: TimeInput): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, _ms(time)));
  }

  // ---------- DEFER / MICROTASK ----------

  static defer(handler: TaskHandler): void {
    setTimeout(handler, 0);
  }

  static microtask(handler: TaskHandler): void {
    queueMicrotask(handler as () => void);
  }

  // ---------- RETRY ----------

  static retry(times: number, handler: () => Promise<void>): Promise<void>;
  static retry(
    times: number,
    delay: TimeInput,
    handler: () => Promise<void>,
  ): Promise<void>;
  static async retry(
    times: number,
    delayOrHandler: TimeInput | (() => Promise<void>),
    handlerOrUndefined?: () => Promise<void>,
  ): Promise<void> {
    const delay =
      typeof delayOrHandler !== 'function' ? delayOrHandler : undefined;
    const handler =
      typeof delayOrHandler === 'function'
        ? delayOrHandler
        : handlerOrUndefined!;
    let lastError: unknown;
    for (let i = 0; i < times; i++) {
      try {
        return await handler();
      } catch (e) {
        lastError = e;
      }
      if (delay !== undefined && i < times - 1) await Task.sleep(delay);
    }
    throw lastError;
  }

  // ---------- CONTROLE ----------

  static cancel(id: string): boolean {
    const entry = _registry.get(id);
    if (!entry) return false;
    if (entry.type === 'timeout') clearTimeout(entry.timer);
    else clearInterval(entry.timer);
    _registry.delete(id);
    return true;
  }

  static cancelAll(): void {
    for (const id of _registry.keys()) Task.cancel(id);
  }

  static get(id: string): Job | null {
    const entry = _registry.get(id);
    if (!entry) return null;
    return _createJob(id, entry.type, entry.handler);
  }
}
