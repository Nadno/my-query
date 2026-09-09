export class HttpError extends Error {
  readonly status: number;
  readonly response: Response;

  constructor(response: Response) {
    super(`HTTP ${response.status}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.response = response;
  }
}
