import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Pattern } from '@/mini-stack/primitives/pattern';

// ========== PATTERN.MATCH ==========

describe('Pattern.match', () => {
  it('matches exact string value', () => {
    const result = Pattern.match('active', {
      'active': 'Ativo',
      'inactive': 'Inativo',
      _: 'Desconhecido'
    });
    assert.equal(result, 'Ativo');
  });

  it('matches exact number value', () => {
    const result = Pattern.match(200, {
      200: 'OK',
      404: 'Not Found',
      _: 'Unknown'
    });
    assert.equal(result, 'OK');
  });

  it('returns default for unknown value', () => {
    const result = Pattern.match('unknown', {
      'active': 'Ativo',
      _: 'Desconhecido'
    });
    assert.equal(result, 'Desconhecido');
  });

  it('returns undefined without default', () => {
    const result = Pattern.match('unknown', {
      'active': 'Ativo'
    });
    assert.equal(result, undefined);
  });

  it('works with boolean values', () => {
    const result = Pattern.match(true, {
      true: 'Verdadeiro',
      false: 'Falso'
    });
    assert.equal(result, 'Verdadeiro');
  });

  it('uses default when value is not found', () => {
    const result = Pattern.match(500, {
      200: 'OK',
      404: 'Not Found',
      _: 'Error'
    });
    assert.equal(result, 'Error');
  });
});

// ========== PATTERN.WHEN ==========

describe('Pattern.when', () => {
  it('matches first predicate that is true', () => {
    const user = { score: 750 };
    const result = Pattern.when(user)
      .is(u => u.score >= 1000, 'expert')
      .is(u => u.score >= 500, 'advanced')
      .else('beginner');
    
    assert.equal(result, 'advanced');
  });

  it('returns else when no predicate matches', () => {
    const user = { score: 50 };
    const result = Pattern.when(user)
      .is(u => u.score >= 1000, 'expert')
      .else('beginner');
    
    assert.equal(result, 'beginner');
  });

  it('returns first match even if later predicates are true', () => {
    const user = { score: 1500 };
    const result = Pattern.when(user)
      .is(u => u.score >= 1000, 'expert')
      .is(u => u.score >= 500, 'advanced')
      .is(u => u.score >= 100, 'intermediate')
      .else('beginner');
    
    assert.equal(result, 'expert');
  });

  it('works with object predicates', () => {
    const item = { status: 'pending', approved: false };
    const result = Pattern.when(item)
      .is(i => i.status === 'approved' && i.approved, 'published')
      .is(i => i.status === 'pending', 'waiting')
      .else('draft');
    
    assert.equal(result, 'waiting');
  });

  it('uses else alias correctly', () => {
    const value = 10;
    const result = Pattern.when(value)
      .is(v => v > 100, 'high')
      .or('low');
    
    assert.equal(result, 'low');
  });

  it('uses default alias correctly', () => {
    const value = 5;
    const result = Pattern.when(value)
      .is(v => v > 100, 'high')
      .default('low');
    
    assert.equal(result, 'low');
  });
});

// ========== PATTERN.DEFINE (STATE MACHINES) ==========

describe('Pattern.define', () => {
  it('creates a state machine with handlers', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest',
      pending: 'pending'
    })
      .handler('loggedIn', () => 'dashboard')
      .handler('guest', () => 'login')
      .handler('pending', () => 'spinner')
      .default('guest')
      .build();

    assert.equal(auth.handle('loggedIn'), 'dashboard');
    assert.equal(auth.handle('guest'), 'login');
    assert.equal(auth.handle('pending'), 'spinner');
  });

  it('uses default handler when type not found', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest'
    })
      .handler('loggedIn', () => 'dashboard')
      .handler('guest', () => 'login')
      .default('guest')
      .build();

    assert.equal(auth.handle('unknown'), 'login');
  });

  it('throws when no handler found and no default', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest'
    })
      .handler('loggedIn', () => 'dashboard')
      .handler('guest', () => 'login')
      .build();

    assert.throws(() => auth.handle('unknown'), /No handler for/);
  });

  it('has() returns correct boolean', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest'
    })
      .handler('loggedIn', () => 'dashboard')
      .handler('guest', () => 'login')
      .default('guest')
      .build();

    assert.equal(auth.has('loggedIn'), true);
    assert.equal(auth.has('guest'), true);
    assert.equal(auth.has('unknown'), false);
  });

  it('default() method works correctly', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest'
    })
      .handler('loggedIn', () => 'dashboard')
      .handler('guest', () => 'login')
      .default('guest')
      .build();

    assert.equal(auth.default(), 'login');
  });

  it('throws when default() called without default handler', () => {
    const auth = Pattern.define('auth', {
      loggedIn: 'logged-in',
      guest: 'guest'
    })
      .handler('loggedIn', () => 'dashboard')
      .build();

    assert.throws(() => auth.default(), /No default handler/);
  });

  it('passes arguments to handler', () => {
    const router = Pattern.define('router', {
      home: 'home',
      about: 'about'
    })
      .handler('home', (name: string, age: number) => `Welcome ${name}, age ${age}`)
      .handler('about', () => 'About page')
      .default('home')
      .build();

    assert.equal(router.handle('home', 'John', 30), 'Welcome John, age 30');
  });
});

// ========== PATTERN.ENUM ==========

describe('Pattern.enum', () => {
  const Colors = Pattern.enum({
    RED: '#ff0000',
    GREEN: '#00ff00',
    BLUE: '#0000ff'
  });

  it('gets keys', () => {
    const keys = Colors.keys();
    assert.deepEqual(keys.sort(), ['BLUE', 'GREEN', 'RED']);
  });

  it('gets values', () => {
    const values = Colors.values();
    assert.deepEqual(values.sort(), ['#0000ff', '#00ff00', '#ff0000']);
  });

  it('resolves key to value', () => {
    assert.equal(Colors.from('RED'), '#ff0000');
    assert.equal(Colors.from('GREEN'), '#00ff00');
    assert.equal(Colors.from('BLUE'), '#0000ff');
  });

  it('resolves value to key', () => {
    assert.equal(Colors.from('#ff0000'), 'RED');
    assert.equal(Colors.from('#00ff00'), 'GREEN');
    assert.equal(Colors.from('#0000ff'), 'BLUE');
  });

  it('returns undefined for unknown key or value', () => {
    assert.equal(Colors.from('UNKNOWN'), undefined);
    assert.equal(Colors.from('#ffffff'), undefined);
  });

  it('has() returns true for existing keys', () => {
    assert.equal(Colors.has('RED'), true);
    assert.equal(Colors.has('GREEN'), true);
    assert.equal(Colors.has('#ff0000'), true);
    assert.equal(Colors.has('#00ff00'), true);
  });

  it('has() returns false for unknown', () => {
    assert.equal(Colors.has('UNKNOWN'), false);
    assert.equal(Colors.has('#ffffff'), false);
  });
});

// ========== PATTERN.ENUM WITH NUMBERS ==========

describe('Pattern.enum with number values', () => {
  const Status = Pattern.enum({
    PENDING: 0,
    ACTIVE: 1,
    INACTIVE: 2
  });

  it('resolves key to number value', () => {
    assert.equal(Status.from('PENDING'), 0);
    assert.equal(Status.from('ACTIVE'), 1);
    assert.equal(Status.from('INACTIVE'), 2);
  });

  it('resolves number value to key', () => {
    assert.equal(Status.from(String(0)), 'PENDING');
    assert.equal(Status.from(String(1)), 'ACTIVE');
    assert.equal(Status.from(String(2)), 'INACTIVE');
  });

  it('has() works with numbers', () => {
    assert.equal(Status.has('PENDING'), true);
    assert.equal(Status.has(String(0)), true);
    assert.equal(Status.has(String(99)), false);
  });
});
