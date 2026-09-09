import { afterEach, describe, expect, it, vi } from 'vitest';

import { Fetcher } from './Fetcher';
import { HttpError } from './HttpError';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

function lastRequest(): Request {
  const input = vi.mocked(fetch).mock.calls.at(-1)?.[0];
  expect(input).toBeInstanceOf(Request);
  return input as Request;
}

describe('Fetcher', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('parses JSON when the response is ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 1 })));
    const api = Fetcher.create();
    await expect(api.get('/api/item')).resolves.toEqual({ id: 1 });
  });

  it('returns undefined for 204 and empty 2xx bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    const api = Fetcher.create();
    await expect(api.post('/api/side')).resolves.toBeUndefined();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(textResponse('')));
    await expect(api.get('/api/empty')).resolves.toBeUndefined();
  });

  it('throws HttpError with the response when not ok', async () => {
    const response = jsonResponse({ error: 'nope' }, 500);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    const api = Fetcher.create();

    const error = await api.get('/api/item').then(
      () => {
        throw new Error('expected HttpError');
      },
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ name: 'HttpError', status: 500, message: 'HTTP 500' });
    expect((error as HttpError).response).toBe(response);
  });

  it('JSON-stringifies plain objects and sets Content-Type', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: true })));
    const api = Fetcher.create();
    await api.post('/api/item', { name: 'n' });

    const request = lastRequest();
    expect(request.method).toBe('POST');
    expect(request.headers.get('Content-Type')).toBe('application/json');
    await expect(request.clone().json()).resolves.toEqual({ name: 'n' });
  });

  it('passes FormData through without JSON Content-Type', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: true })));
    const api = Fetcher.create();
    const body = new FormData();
    body.set('Name', 'n');
    await api.post('/Admin/Category/New/', body);

    const request = lastRequest();
    expect(request.headers.get('Content-Type')).not.toBe('application/json');
    const sent = await request.clone().formData();
    expect(sent.get('Name')).toBe('n');
  });

  it('expands path tuples and encodes values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));
    const api = Fetcher.create();
    await api.get(['/api/User/:userId', { userId: 'a/b' }]);

    expect(new URL(lastRequest().url).pathname).toBe('/api/User/a%2Fb');
  });

  it('throws when a path param is missing or leftover', async () => {
    const api = Fetcher.create();
    await expect(api.get(['/api/User/:userId', {}])).rejects.toThrow(
      'Missing path param "userId"',
    );
    await expect(
      api.get(['/api/User/:userId', { userId: 9, extra: 1 }]),
    ).rejects.toThrow('Unexpected path param "extra"');
  });

  it('serializes query params and skips nullish', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])));
    const api = Fetcher.create();
    await api.get('/api/Course', {
      params: { page: 1, empty: undefined, gone: null },
    });

    expect(new URL(lastRequest().url).search).toBe('?page=1');
  });

  it('send returns the Response without parsing', async () => {
    const response = new Response('ok', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    const api = Fetcher.create();
    await expect(api.send('/api/health')).resolves.toBe(response);
    await expect(api.send('/api/health').then((res) => res.text())).resolves.toBe(
      'ok',
    );
  });

  it('send still throws HttpError when not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(textResponse('nope', 404)));
    const api = Fetcher.create();
    await expect(api.send('/api/missing')).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
    });
  });

  it('runs middleware around fetch without consuming the body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 2 })));
    const api = Fetcher.create();
    const seen: number[] = [];

    api.use(async (ctx, next) => {
      ctx.request.headers.set('X-Req', '1');
      await next();
      seen.push(ctx.response?.status ?? 0);
      const peeked = await ctx.response?.clone().json();
      expect(peeked).toEqual({ id: 2 });
    });

    await expect(api.get('/api/item')).resolves.toEqual({ id: 2 });
    expect(seen).toEqual([200]);
    expect(lastRequest().headers.get('X-Req')).toBe('1');
  });

  it('applies timeout via AbortSignal.timeout', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));
    const api = Fetcher.create({ timeout: 30_000 });
    await api.get('/api/ping');
    expect(timeout).toHaveBeenCalledWith(30_000);
  });

  it('forwards a combined signal when the caller passes one', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));
    const user = new AbortController();
    const api = Fetcher.create({ timeout: 30_000 });
    await api.get('/api/ping', { signal: user.signal });

    const forwarded = lastRequest().signal;
    expect(forwarded).toBeInstanceOf(AbortSignal);
    expect(forwarded).not.toBe(user.signal);
    expect(forwarded?.aborted).toBe(false);
    user.abort();
    expect(forwarded?.aborted).toBe(true);
  });
});
