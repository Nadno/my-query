import { expand } from './expand';
import { HttpError } from './HttpError';

export type FetchUrl =
  | string
  | readonly [pattern: string, params: Record<string, string | number>];

export type FetcherCreateOptions = {
  credentials?: RequestCredentials;
  timeout?: number;
  headers?: Record<string, string>;
};

export type FetcherRequestOptions = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

export type FetcherSendOptions = FetcherRequestOptions & {
  method?: string;
  body?: unknown;
};

export type FetchContext = {
  request: Request;
  response?: Response;
  parse: boolean;
};

export type FetcherMiddleware = (
  ctx: FetchContext,
  next: () => Promise<void>,
) => void | Promise<void>;

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = globalThis.location?.href ?? 'http://localhost/';
  return new URL(url, base).href;
}

function appendQuery(
  url: string,
  params?: Record<string, unknown>,
): string {
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  if (!qs) return url;
  return url + (url.includes('?') ? '&' : '?') + qs;
}

function isPathTuple(
  url: FetchUrl,
): url is readonly [string, Record<string, string | number>] {
  return Array.isArray(url);
}

function resolveUrl(
  url: FetchUrl,
  query?: Record<string, unknown>,
): string {
  const path = isPathTuple(url) ? expand(url[0], url[1]) : url;
  return toAbsoluteUrl(appendQuery(path, query));
}

function isRawBody(
  data: unknown,
): data is FormData | Blob | URLSearchParams | ArrayBuffer | ArrayBufferView {
  return (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof URLSearchParams ||
    data instanceof ArrayBuffer ||
    ArrayBuffer.isView(data)
  );
}

function encodeBody(data: unknown): {
  body?: BodyInit;
  contentType?: string;
} {
  if (data == null) return {};
  if (typeof data === 'string') return { body: data };
  if (isRawBody(data)) return { body: data as BodyInit };
  return { body: JSON.stringify(data), contentType: 'application/json' };
}

function withTimeout(
  timeout: number | undefined,
  userSignal?: AbortSignal,
): AbortSignal | undefined {
  if (timeout == null || timeout <= 0) return userSignal;
  const timeoutSignal = AbortSignal.timeout(timeout);
  if (!userSignal) return timeoutSignal;

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }

  const controller = new AbortController();
  const abort = () => {
    if (!controller.signal.aborted) controller.abort();
  };

  for (const signal of [userSignal, timeoutSignal]) {
    if (signal.aborted) {
      abort();
      break;
    }
    signal.addEventListener('abort', abort, { once: true });
  }

  return controller.signal;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (text.trim() === '') return undefined;
  return JSON.parse(text);
}

export class Fetcher {
  private readonly credentials?: RequestCredentials;
  private readonly timeout?: number;
  private readonly headers: Record<string, string>;
  private readonly middlewares: FetcherMiddleware[] = [];

  private constructor(options: FetcherCreateOptions) {
    this.credentials = options.credentials;
    this.timeout = options.timeout;
    this.headers = options.headers ?? {};
  }

  static create(options: FetcherCreateOptions = {}): Fetcher {
    return new Fetcher(options);
  }

  use(middleware: FetcherMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  get<T = unknown>(
    url: FetchUrl,
    options?: FetcherRequestOptions,
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET', parse: true });
  }

  post<T = unknown>(
    url: FetchUrl,
    body?: unknown,
    options?: FetcherRequestOptions,
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body,
      parse: true,
    });
  }

  put<T = unknown>(
    url: FetchUrl,
    body?: unknown,
    options?: FetcherRequestOptions,
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body,
      parse: true,
    });
  }

  patch<T = unknown>(
    url: FetchUrl,
    body?: unknown,
    options?: FetcherRequestOptions,
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body,
      parse: true,
    });
  }

  delete<T = unknown>(
    url: FetchUrl,
    options?: FetcherRequestOptions,
  ): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE', parse: true });
  }

  send(url: FetchUrl, options?: FetcherSendOptions): Promise<Response> {
    return this.request<Response>(url, { ...options, parse: false });
  }

  private async request<T>(
    url: FetchUrl,
    options: FetcherSendOptions & { parse: boolean },
  ): Promise<T> {
    const href = resolveUrl(url, options.params);
    const method = (options.method ?? 'GET').toUpperCase();
    const { body, contentType } = encodeBody(options.body);

    const headers = new Headers(this.headers);
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        headers.set(key, value);
      }
    }
    if (contentType && !headers.has('Content-Type')) {
      headers.set('Content-Type', contentType);
    }

    const init: RequestInit = {
      method,
      headers,
      credentials: options.credentials ?? this.credentials,
      signal: withTimeout(this.timeout, options.signal),
    };
    if (body != null && method !== 'GET' && method !== 'HEAD') {
      init.body = body;
    }

    const ctx: FetchContext = {
      request: new Request(href, init),
      parse: options.parse,
    };

    await this.runMiddlewares(ctx);

    const response = ctx.response;
    if (!response) {
      throw new Error('Fetcher middleware finished without a response');
    }
    if (!response.ok) throw new HttpError(response);
    if (!ctx.parse) return response as T;
    return parseBody(response) as T;
  }

  private async runMiddlewares(ctx: FetchContext): Promise<void> {
    const dispatch = async (index: number): Promise<void> => {
      const middleware = this.middlewares[index];
      if (!middleware) {
        ctx.response = await fetch(ctx.request);
        return;
      }
      let called = false;
      await middleware(ctx, async () => {
        if (called) throw new Error('next() called multiple times');
        called = true;
        await dispatch(index + 1);
      });
    };

    await dispatch(0);
  }
}
