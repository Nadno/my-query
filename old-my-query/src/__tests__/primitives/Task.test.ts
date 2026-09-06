import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '@/mini-stack/primitives/task';

// Limpa o registry antes de cada teste para isolamento
beforeEach(() => Task.cancelAll());

// ========== TASK.WAIT ==========

describe('Task.wait básico', () => {
  it('handler chamado após tick', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let called = false;
    Task.wait('100ms', () => { called = true; });
    assert.equal(called, false);
    t.mock.timers.tick(100);
    assert.equal(called, true);
  });

  it('isActive true antes, false depois', (t) => {
    t.mock.timers.enable(['setTimeout']);
    const job = Task.wait('100ms', () => {});
    assert.equal(job.isActive, true);
    t.mock.timers.tick(100);
    assert.equal(job.isActive, false);
  });

  it('auto-cleanup: não está mais no registry após disparar', (t) => {
    t.mock.timers.enable(['setTimeout']);
    const job = Task.wait('100ms', () => {});
    t.mock.timers.tick(100);
    assert.equal(Task.get(job.id), null);
  });

  it('aceita número (ms)', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let called = false;
    Task.wait(50, () => { called = true; });
    t.mock.timers.tick(50);
    assert.equal(called, true);
  });
});

describe('Task.wait com ID (singleton)', () => {
  it('segunda chamada com mesmo ID cancela a primeira', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    Task.wait('debounce-test', '100ms', () => { count++; });
    Task.wait('debounce-test', '100ms', () => { count++; });
    t.mock.timers.tick(100);
    assert.equal(count, 1); // só o segundo dispara
  });

  it('strings multi-unidade ("2d 5h") não são tratadas como ID', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let called = false;
    // se "2d 5h" fosse tratado como ID, quebraria
    const job = Task.wait('2d 5h', () => { called = true; });
    assert.equal(typeof job.id, 'string');
    // a string virou TimeInput, não ID
    t.mock.timers.tick(2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
    assert.equal(called, true);
  });
});

// ========== TASK.EVERY ==========

describe('Task.every básico', () => {
  it('handler chamado a cada intervalo', (t) => {
    t.mock.timers.enable(['setInterval']);
    let count = 0;
    Task.every('100ms', () => { count++; });
    t.mock.timers.tick(350); // 3 disparos: 100, 200, 300
    assert.equal(count, 3);
  });

  it('isActive permanece true enquanto ativo', (t) => {
    t.mock.timers.enable(['setInterval']);
    const job = Task.every('100ms', () => {});
    t.mock.timers.tick(300);
    assert.equal(job.isActive, true);
  });
});

describe('Task.every com ID (singleton)', () => {
  it('segundo every com mesmo ID cancela o anterior', (t) => {
    t.mock.timers.enable(['setInterval']);
    let countA = 0, countB = 0;
    Task.every('poll', '100ms', () => { countA++; });
    Task.every('poll', '100ms', () => { countB++; });
    t.mock.timers.tick(200);
    assert.equal(countA, 0); // cancelado
    assert.equal(countB, 2);
  });
});

// ========== TASK.DEBOUNCE ==========

describe('Task.debounce', () => {
  it('dispara após delay sem novas chamadas', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const save = Task.debounce(() => { count++; }, '100ms');
    save();
    assert.equal(count, 0);      // ainda não disparou
    t.mock.timers.tick(100);
    assert.equal(count, 1);
  });

  it('múltiplas chamadas resultam em único disparo', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const save = Task.debounce(() => { count++; }, '100ms');
    save(); save(); save();
    t.mock.timers.tick(100);
    assert.equal(count, 1);
  });

  it('cada chamada reinicia o timer', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const save = Task.debounce(() => { count++; }, '100ms');
    save();
    t.mock.timers.tick(50);  // não disparou ainda
    save();                  // reinicia timer
    t.mock.timers.tick(50);  // ainda não (100ms do segundo call não passou)
    assert.equal(count, 0);
    t.mock.timers.tick(50);  // agora sim
    assert.equal(count, 1);
  });

  it('.cancel() impede disparo pendente', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const save = Task.debounce(() => { count++; }, '100ms');
    save();
    save.cancel();
    t.mock.timers.tick(200);
    assert.equal(count, 0);
  });

  it('.flush() dispara imediatamente', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const save = Task.debounce(() => { count++; }, '100ms');
    save();
    save.flush();
    assert.equal(count, 1);
    t.mock.timers.tick(100); // timer cancelado pelo flush, não dispara de novo
    assert.equal(count, 1);
  });

  it('.isPending reflete estado correto', (t) => {
    t.mock.timers.enable(['setTimeout']);
    const save = Task.debounce(() => {}, '100ms');
    assert.equal(save.isPending, false);
    save();
    assert.equal(save.isPending, true);
    t.mock.timers.tick(100);
    assert.equal(save.isPending, false);
  });
});

// ========== TASK.THROTTLE ==========

describe('Task.throttle', () => {
  it('primeira chamada dispara imediatamente (leading)', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const scroll = Task.throttle(() => { count++; }, '100ms');
    scroll();
    assert.equal(count, 1);
  });

  it('chamada durante wait agenda trailing (não dispara imediatamente)', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const scroll = Task.throttle(() => { count++; }, '100ms');
    scroll(); // count = 1 (leading)
    scroll(); // não dispara imediatamente, agenda trailing
    assert.equal(count, 1);
    t.mock.timers.tick(100); // trailing dispara
    assert.equal(count, 2);
  });

  it('trailing usa os args da última chamada', (t) => {
    t.mock.timers.enable(['setTimeout']);
    const calls: number[] = [];
    const scroll = Task.throttle((n: number) => { calls.push(n); }, '100ms');
    scroll(1); // leading: dispara com 1
    scroll(2); // trailing agendado com 2
    scroll(3); // trailing reagendado com 3 (overwrite)
    t.mock.timers.tick(100);
    assert.deepEqual(calls, [1, 3]);
  });

  it('.cancel() impede trailing pendente', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const scroll = Task.throttle(() => { count++; }, '100ms');
    scroll(); // leading
    scroll(); // trailing agendado
    scroll.cancel();
    t.mock.timers.tick(100);
    assert.equal(count, 1); // só o leading
  });

  it('.flush() executa trailing imediatamente', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let count = 0;
    const scroll = Task.throttle(() => { count++; }, '100ms');
    scroll(); // leading
    scroll(); // trailing agendado
    scroll.flush();
    assert.equal(count, 2);
    t.mock.timers.tick(100); // timer cancelado pelo flush
    assert.equal(count, 2);
  });
});

// ========== TASK.SLEEP ==========

describe('Task.sleep', () => {
  it('retorna Promise que resolve após tick', async (t) => {
    t.mock.timers.enable(['setTimeout']);
    let resolved = false;
    const p = Task.sleep('100ms').then(() => { resolved = true; });
    assert.equal(resolved, false);
    t.mock.timers.tick(100);
    await p;
    assert.equal(resolved, true);
  });

  it('aceita número como ms', async (t) => {
    t.mock.timers.enable(['setTimeout']);
    const p = Task.sleep(50);
    t.mock.timers.tick(50);
    await p; // não deve travar
  });
});

// ========== TASK.DEFER ==========

describe('Task.defer', () => {
  it('não executa antes do tick', (t) => {
    t.mock.timers.enable(['setTimeout']);
    let ran = false;
    Task.defer(() => { ran = true; });
    assert.equal(ran, false);
    t.mock.timers.tick(0);
    assert.equal(ran, true);
  });
});

// ========== TASK.MICROTASK ==========

describe('Task.microtask', () => {
  it('executa após o código síncrono atual', async () => {
    const order: string[] = [];
    Task.microtask(() => { order.push('micro'); });
    order.push('sync');
    await Promise.resolve(); // cede para a fila de microtasks
    assert.deepEqual(order, ['sync', 'micro']);
  });
});

// ========== TASK.RETRY ==========

describe('Task.retry sem delay', () => {
  it('sucesso na primeira tentativa', async () => {
    let attempts = 0;
    await Task.retry(3, async () => { attempts++; });
    assert.equal(attempts, 1);
  });

  it('retenta e sucede na 3ª tentativa', async () => {
    let attempts = 0;
    await Task.retry(3, async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
    });
    assert.equal(attempts, 3);
  });

  it('lança o último erro após esgotar tentativas', async () => {
    let attempts = 0;
    await assert.rejects(
      Task.retry(3, async () => { attempts++; throw new Error('boom'); }),
      /boom/,
    );
    assert.equal(attempts, 3);
  });
});

// Para retry com delay, usamos delays reais mínimos (1ms) — mock timers + async/await
// criam deadlock de microtasks. 1ms é negligível e mantém os testes confiáveis.
describe('Task.retry com delay', () => {
  it('aguarda entre tentativas e propaga erro final', async () => {
    let attempts = 0;
    await assert.rejects(
      Task.retry(3, 1, async () => { attempts++; throw new Error('always fails'); }),
      /always fails/,
    );
    assert.equal(attempts, 3);
  });

  it('sucede antes de esgotar tentativas com delay', async () => {
    let attempts = 0;
    await Task.retry(5, 1, async () => {
      attempts++;
      if (attempts < 3) throw new Error('not yet');
    });
    assert.equal(attempts, 3);
  });
});

// ========== TASK.CANCEL / CANCELALL ==========

describe('Task.cancel', () => {
  it('retorna true ao cancelar ID existente', (t) => {
    t.mock.timers.enable(['setTimeout']);
    Task.wait('to-cancel', '1s', () => {});
    assert.equal(Task.cancel('to-cancel'), true);
  });

  it('retorna false para ID inexistente', () => {
    assert.equal(Task.cancel('nope'), false);
  });

  it('isActive false após cancelar', (t) => {
    t.mock.timers.enable(['setTimeout']);
    const job = Task.wait('cancel-me', '1s', () => {});
    Task.cancel('cancel-me');
    assert.equal(job.isActive, false);
  });
});

describe('Task.cancelAll', () => {
  it('cancela todos os jobs ativos', (t) => {
    t.mock.timers.enable(['setTimeout', 'setInterval']);
    const j1 = Task.wait('t1', '1s', () => {});
    const j2 = Task.every('t2', '1s', () => {});
    Task.cancelAll();
    assert.equal(j1.isActive, false);
    assert.equal(j2.isActive, false);
  });
});

// ========== TASK.GET ==========

describe('Task.get', () => {
  it('retorna null para ID inexistente', () => {
    assert.equal(Task.get('none'), null);
  });

  it('retorna Job com run() funcional', (t) => {
    t.mock.timers.enable(['setInterval']);
    let count = 0;
    Task.every('my-poll', '1s', () => { count++; });
    const job = Task.get('my-poll');
    assert.notEqual(job, null);
    job!.run();
    assert.equal(count, 1); // run() executa o handler
  });

  it('Job.cancel() via handle remove do registry', (t) => {
    t.mock.timers.enable(['setTimeout']);
    Task.wait('cancel-via-job', '1s', () => {});
    const job = Task.get('cancel-via-job')!;
    job.cancel();
    assert.equal(job.isActive, false);
    assert.equal(Task.get('cancel-via-job'), null);
  });
});
