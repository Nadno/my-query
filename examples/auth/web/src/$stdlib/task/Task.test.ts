import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Task, TaskScheduler } from './Task';

describe('Task', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    Task.cancelAll();
    vi.useRealTimers();
  });

  it('wait runs the handler after the delay', async () => {
    const handler = vi.fn();
    Task.wait(100, handler);
    expect(handler).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('wait accepts a TimeSpan string', async () => {
    const handler = vi.fn();
    Task.wait('5s', handler);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(handler).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('wait cancel and cancelAll prevent the handler', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const job = Task.wait(100, first);
    Task.wait(100, second);
    job.cancel();
    await vi.advanceTimersByTimeAsync(100);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    const third = vi.fn();
    Task.wait(100, third);
    Task.cancelAll();
    await vi.advanceTimersByTimeAsync(100);
    expect(third).not.toHaveBeenCalled();
  });

  it('every repeats and a named id replaces the previous job', async () => {
    const first = vi.fn();
    const second = vi.fn();
    Task.every('tick', 100, first);
    await vi.advanceTimersByTimeAsync(100);
    expect(first).toHaveBeenCalledTimes(1);

    Task.every('tick', 100, second);
    await vi.advanceTimersByTimeAsync(200);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('debounce only runs the last call; flush, cancel and isPending work', async () => {
    const fn = vi.fn();
    const debounced = Task.debounce(fn, 100);
    debounced('a');
    debounced('b');
    expect(debounced.isPending).toBe(true);
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
    expect(debounced.isPending).toBe(false);

    debounced('c');
    debounced.flush();
    expect(fn).toHaveBeenCalledWith('c');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(debounced.isPending).toBe(false);

    debounced('d');
    debounced.cancel();
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retry attempts three times with delay and returns on the second success', async () => {
    const handler = vi
      .fn()
      .mockRejectedValueOnce(new Error('once'))
      .mockResolvedValueOnce('ok');

    const pending = Task.retry(handler, { attempts: 3, delays: [100] });
    await vi.advanceTimersByTimeAsync(0);
    expect(handler).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    await expect(pending).resolves.toBe('ok');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('retry throws the last error when attempts are exhausted', async () => {
    const last = new Error('last');
    const handler = vi
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(last);

    const pending = Task.retry(handler, { attempts: 2 });
    await expect(pending).rejects.toBe(last);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('retry does not run the handler when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const handler = vi.fn(async () => 'nope');
    await expect(
      Task.retry(handler, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('retry does not start the next attempt when aborted during the delay', async () => {
    const controller = new AbortController();
    const handler = vi.fn().mockRejectedValue(new Error('fail'));
    const pending = Task.retry(handler, {
      attempts: 3,
      delays: [100],
      signal: controller.signal,
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(handler).toHaveBeenCalledTimes(1);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(100);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('retry does not retry an AbortError when the signal is aborted', async () => {
    const controller = new AbortController();
    const handler = vi.fn(async () => {
      controller.abort();
      throw new DOMException('This operation was aborted.', 'AbortError');
    });
    await expect(
      Task.retry(handler, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('retry with delays waits each listed interval', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('fail'));
    const pending = Task.retry(handler, { delays: [100, 200] });
    const settled = expect(pending).rejects.toMatchObject({ message: 'fail' });
    await vi.advanceTimersByTimeAsync(0);
    expect(handler).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(handler).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(199);
    expect(handler).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    await settled;
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('retry shouldRetry false throws without the next attempt', async () => {
    const timeout = new DOMException('The operation timed out.', 'TimeoutError');
    const handler = vi.fn().mockRejectedValue(timeout);
    await expect(
      Task.retry(handler, {
        delays: [100],
        shouldRetry: (error) =>
          !(error instanceof Error && error.name === 'TimeoutError'),
      }),
    ).rejects.toBe(timeout);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('invalid delay throws', () => {
    expect(() => Task.wait('nope', () => undefined)).toThrow(
      /Invalid TimeSpan format/,
    );
  });

  describe('TaskScheduler', () => {
    it('isolates jobs from the default scheduler', async () => {
      const scheduler = new TaskScheduler();
      const handler = vi.fn();

      scheduler.wait(100, handler);
      await vi.advanceTimersByTimeAsync(100);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('cancelAll on a scheduler does not touch the default scheduler', async () => {
      const scheduler = new TaskScheduler();
      const isolated = vi.fn();
      const defaultJob = vi.fn();

      scheduler.wait(100, isolated);
      Task.wait(100, defaultJob);

      scheduler.cancelAll();
      await vi.advanceTimersByTimeAsync(100);
      expect(isolated).not.toHaveBeenCalled();
      expect(defaultJob).toHaveBeenCalledTimes(1);
    });

    it('ids from different schedulers do not collide', async () => {
      const a = new TaskScheduler();
      const b = new TaskScheduler();
      const first = vi.fn();
      const second = vi.fn();

      a.wait('job', 100, first);
      b.wait('job', 100, second);

      await vi.advanceTimersByTimeAsync(100);
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
    });
  });
});
