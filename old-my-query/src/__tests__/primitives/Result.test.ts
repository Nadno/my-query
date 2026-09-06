import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Result } from '@/mini-stack/primitives/result';

// ========== RESULT.OK ==========

describe('Result.ok', () => {
  it('retorna [value, null]', () => {
    const [value, error] = Result.ok(42);
    assert.equal(value, 42);
    assert.equal(error, null);
  });

  it('aceita qualquer tipo', () => {
    const [user, err] = Result.ok({ name: 'Ana' });
    assert.deepEqual(user, { name: 'Ana' });
    assert.equal(err, null);
  });
});

// ========== RESULT.FAIL ==========

describe('Result.fail', () => {
  it('retorna [null, error]', () => {
    const err = new Error('ops');
    const [value, error] = Result.fail(err);
    assert.equal(value, null);
    assert.equal(error, err);
  });

  it('aceita erro customizado', () => {
    const [value, error] = Result.fail('string error');
    assert.equal(value, null);
    assert.equal(error, 'string error');
  });
});

// ========== RESULT.TRY ==========

describe('Result.try', () => {
  it('captura valor em sucesso', () => {
    const [value, error] = Result.try(() => JSON.parse('{"n":1}'));
    assert.deepEqual(value, { n: 1 });
    assert.equal(error, null);
  });

  it('captura exceção em falha', () => {
    const [value, error] = Result.try(() => JSON.parse('INVALID'));
    assert.equal(value, null);
    assert.ok(error instanceof SyntaxError);
  });
});

// ========== RESULT.TRYASYNC ==========

describe('Result.tryAsync', () => {
  it('captura valor de promise resolvida', async () => {
    const [value, error] = await Result.tryAsync(Promise.resolve(99));
    assert.equal(value, 99);
    assert.equal(error, null);
  });

  it('captura rejeição de promise', async () => {
    const [value, error] = await Result.tryAsync(Promise.reject(new Error('boom')));
    assert.equal(value, null);
    assert.ok(error instanceof Error);
    assert.equal((error as Error).message, 'boom');
  });
});

// ========== RESULT.UNWRAP ==========

describe('Result.unwrap', () => {
  it('retorna value em sucesso', () => {
    assert.equal(Result.unwrap(Result.ok(7)), 7);
  });

  it('lança error em falha', () => {
    const err = new Error('fatal');
    assert.throws(() => Result.unwrap(Result.fail(err)), err);
  });
});

// ========== RESULT.OR ==========

describe('Result.or', () => {
  it('retorna value em sucesso', () => {
    assert.equal(Result.or(Result.ok(5), 0), 5);
  });

  it('retorna fallback em falha', () => {
    assert.equal(Result.or(Result.fail(new Error()), 42), 42);
  });
});
