import { TimeSpan, type TimeInput } from '../time-span';

export type TaskHandler = () => void | Promise<void>;

export interface Job {
  readonly id: string;
  readonly type: 'timeout' | 'interval';
  readonly isActive: boolean;
  cancel(): void;
  run(): void;
}

export type DebouncedFn<T extends (...args: never[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  readonly isPending: boolean;
};

export type RetryOptions = {
  attempts?: number;
  delays?: TimeInput[];
  signal?: AbortSignal;
  shouldRetry?: (error: unknown) => boolean;
};

type RegistryEntry = {
  timer: ReturnType<typeof setTimeout>;
  type: 'timeout' | 'interval';
  handler: TaskHandler;
};

function abortError(signal: AbortSignal): Error {
  if (signal.reason instanceof Error) return signal.reason;
  return new DOMException('This operation was aborted.', 'AbortError');
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function toMs(time: TimeInput): number {
  if (typeof time === 'string' && /^\d+$/.test(time)) return Number(time);
  return TimeSpan.from(time).totalMilliseconds;
}

function isTimeLike(str: string): boolean {
  return /^\d+$/.test(str) || TimeSpan.isValid(str);
}

function parseArgs(
  a1: string | TimeInput,
  a2: TimeInput | TaskHandler,
  a3: TaskHandler | undefined,
): { id: string; time: TimeInput; handler: TaskHandler } {
  if (typeof a1 === 'string' && !isTimeLike(a1) && a3 !== undefined) {
    return { id: a1, time: a2 as TimeInput, handler: a3 };
  }
  return { id: '', time: a1 as TimeInput, handler: a2 as TaskHandler };
}

function sleepOrAbort(time: TimeInput, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(abortError(signal));
  if (!signal) return Task.sleep(time);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, toMs(time));

    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal));
    };

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function runRetry<T>(
  handler: () => Promise<T>,
  {
    attempts,
    delays,
    signal,
    shouldRetry,
  }: {
    attempts: number;
    delays: TimeInput[];
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
  },
): Promise<T> {
  if (signal?.aborted) throw abortError(signal);

  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    if (signal?.aborted) throw abortError(signal);
    try {
      return await handler();
    } catch (error) {
      if (signal?.aborted && isAbortError(error)) throw error;
      if (shouldRetry && !shouldRetry(error)) throw error;
      lastError = error;
    }
    const gap = delays[i];
    if (gap !== undefined && i < attempts - 1) {
      await sleepOrAbort(gap, signal);
    }
  }
  throw lastError;
}

export class TaskScheduler {
  private readonly registry = new Map<string, RegistryEntry>();
  private seq = 0;

  private autoId(): string {
    return `task_${++this.seq}`;
  }

  private createJob(
    id: string,
    type: 'timeout' | 'interval',
    handler: TaskHandler,
  ): Job {
    const registry = this.registry;
    return {
      id,
      type,
      get isActive() {
        return registry.has(id);
      },
      cancel: () => {
        this.cancel(id);
      },
      run: () => {
        handler();
      },
    };
  }

  wait(time: TimeInput, handler: TaskHandler): Job;
  wait(id: string, time: TimeInput, handler: TaskHandler): Job;
  wait(
    a1: string | TimeInput,
    a2: TimeInput | TaskHandler,
    a3?: TaskHandler,
  ): Job {
    const { id: requestedId, time, handler } = parseArgs(a1, a2, a3);
    const id = requestedId || this.autoId();
    const delay = toMs(time);

    if (this.registry.has(id)) this.cancel(id);

    const timer = setTimeout(() => {
      handler();
      this.registry.delete(id);
    }, delay);

    this.registry.set(id, { timer, type: 'timeout', handler });
    return this.createJob(id, 'timeout', handler);
  }

  every(time: TimeInput, handler: TaskHandler): Job;
  every(id: string, time: TimeInput, handler: TaskHandler): Job;
  every(
    a1: string | TimeInput,
    a2: TimeInput | TaskHandler,
    a3?: TaskHandler,
  ): Job {
    const { id: requestedId, time, handler } = parseArgs(a1, a2, a3);
    const id = requestedId || this.autoId();
    const interval = toMs(time);

    if (this.registry.has(id)) this.cancel(id);

    const timer = setInterval(handler, interval);
    this.registry.set(id, { timer, type: 'interval', handler });
    return this.createJob(id, 'interval', handler);
  }

  cancel(id: string): boolean {
    const entry = this.registry.get(id);
    if (!entry) return false;
    if (entry.type === 'timeout') clearTimeout(entry.timer);
    else clearInterval(entry.timer);
    this.registry.delete(id);
    return true;
  }

  cancelAll(): void {
    for (const id of [...this.registry.keys()]) this.cancel(id);
  }

  get(id: string): Job | null {
    const entry = this.registry.get(id);
    if (!entry) return null;
    return this.createJob(id, entry.type, entry.handler);
  }
}

export class Task {
  private constructor() {}

  private static readonly defaultScheduler = new TaskScheduler();

  static createScheduler(): TaskScheduler {
    return new TaskScheduler();
  }

  static wait(time: TimeInput, handler: TaskHandler): Job;
  static wait(id: string, time: TimeInput, handler: TaskHandler): Job;
  static wait(...args: [TimeInput, TaskHandler] | [string, TimeInput, TaskHandler]): Job {
    return (Task.defaultScheduler.wait as (...args: unknown[]) => Job)(...args);
  }

  static every(time: TimeInput, handler: TaskHandler): Job;
  static every(id: string, time: TimeInput, handler: TaskHandler): Job;
  static every(...args: [TimeInput, TaskHandler] | [string, TimeInput, TaskHandler]): Job {
    return (Task.defaultScheduler.every as (...args: unknown[]) => Job)(...args);
  }

  static debounce<T extends (...args: never[]) => unknown>(
    fn: T,
    delay: TimeInput,
  ): DebouncedFn<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    const debounced = ((...args: Parameters<T>): void => {
      lastArgs = args;
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        fn(...(lastArgs as Parameters<T>));
        lastArgs = undefined;
      }, toMs(delay));
    }) as DebouncedFn<T>;

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

    return debounced;
  }

  static sleep(time: TimeInput): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, toMs(time)));
  }

  static retry<T>(
    handler: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const delays = options.delays ?? [];
    const attempts =
      options.attempts ?? (delays.length > 0 ? delays.length + 1 : 1);

    return runRetry(handler, {
      attempts,
      delays,
      signal: options.signal,
      shouldRetry: options.shouldRetry,
    });
  }

  static cancel(id: string): boolean {
    return Task.defaultScheduler.cancel(id);
  }

  static cancelAll(): void {
    Task.defaultScheduler.cancelAll();
  }

  static get(id: string): Job | null {
    return Task.defaultScheduler.get(id);
  }
}
