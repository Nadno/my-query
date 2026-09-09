// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';

import { TimeSpan } from '@/$stdlib/time-span';

import { Storage } from './Storage';

function clearCookies() {
  const raw = document.cookie;
  if (!raw) return;
  for (const pair of raw.split(';')) {
    const name = pair.split('=')[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
}

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  clearCookies();
});

describe('Storage.local namespace', () => {
  it('does not write on create; storageState is defaults on miss', () => {
    const prefs = Storage.local.create('neolude::prefs', { done: false });
    expect(prefs.storageState()).toBe('defaults');
    expect(prefs.get('done')).toBe(false);
    expect(localStorage.getItem('neolude::prefs')).toBeNull();
  });

  it('persists on the first set and reloads as persisted', () => {
    const prefs = Storage.local.create('neolude::prefs', { done: false });
    prefs.set('done', true);
    expect(prefs.storageState()).toBe('persisted');
    expect(localStorage.getItem('neolude::prefs')).toBe('{"done":true}');

    const again = Storage.local.create('neolude::prefs', { done: false });
    expect(again.storageState()).toBe('persisted');
    expect(again.get('done')).toBe(true);
  });

  it('treats invalid JSON as defaults and removes the key', () => {
    localStorage.setItem('neolude::prefs', '{not json');
    const prefs = Storage.local.create('neolude::prefs', { done: false });
    expect(prefs.storageState()).toBe('defaults');
    expect(prefs.get('done')).toBe(false);
    expect(localStorage.getItem('neolude::prefs')).toBeNull();
  });

  it('treats a non-object document as defaults and removes the key', () => {
    localStorage.setItem('neolude::prefs', 'true');
    const prefs = Storage.local.create('neolude::prefs', { done: false });
    expect(prefs.storageState()).toBe('defaults');
    expect(localStorage.getItem('neolude::prefs')).toBeNull();
  });

  it('fills new schema fields from defaults when the document already exists', () => {
    localStorage.setItem('neolude::prefs', JSON.stringify({ done: true }));
    const prefs = Storage.local.create('neolude::prefs', {
      done: false,
      extra: 'x',
    });
    expect(prefs.storageState()).toBe('persisted');
    expect(prefs.get('done')).toBe(true);
    expect(prefs.get('extra')).toBe('x');
  });

  it('returns a copy so mutating get() does not change the storage or the default', () => {
    const defaults = { bar: { snooze: 0 } };
    const poll = Storage.local.create('neolude::poll', defaults);
    poll.get('bar').snooze = 9;
    expect(poll.get('bar').snooze).toBe(0);
    expect(defaults.bar.snooze).toBe(0);

    poll.set('bar', { snooze: 1 });
    const held = poll.get('bar');
    held.snooze = 4;
    expect(poll.get('bar').snooze).toBe(1);
  });

  it('patch writes only schema keys and clear restores defaults without persisting them', () => {
    const poll = Storage.local.create('neolude::poll', {
      foo: false,
      bar: { snooze: 0 },
    });
    poll.patch({ foo: true, unknown: 1 } as { foo: boolean; unknown?: number });
    expect(poll.get('foo')).toBe(true);
    expect(JSON.parse(localStorage.getItem('neolude::poll')!)).toEqual({
      foo: true,
      bar: { snooze: 0 },
    });

    poll.clear();
    expect(poll.storageState()).toBe('defaults');
    expect(poll.get('foo')).toBe(false);
    expect(localStorage.getItem('neolude::poll')).toBeNull();
  });

  it('clones inbound values so mutating after set or patch does not change storage', () => {
    const poll = Storage.local.create('neolude::poll', {
      bar: { snooze: 0, timestamp: 0 } as {
        snooze: number;
        timestamp?: number;
      },
    });
    const inbound = { snooze: 1, timestamp: 0 };
    poll.set('bar', inbound);
    inbound.snooze = 9;
    expect(poll.get('bar').snooze).toBe(1);

    const patchIn = { snooze: 2 };
    poll.patch({ bar: patchIn });
    patchIn.snooze = 8;
    expect(poll.get('bar')).toEqual({ snooze: 2, timestamp: 0 });
  });

  it('does not share in-memory state between two create() instances of the same namespace', () => {
    const first = Storage.local.create('neolude::prefs', { n: 0 });
    first.set('n', 1);

    const second = Storage.local.create('neolude::prefs', { n: 0 });
    expect(second.get('n')).toBe(1);

    second.set('n', 2);
    expect(first.get('n')).toBe(1);
    expect(Storage.local.create('neolude::prefs', { n: 0 }).get('n')).toBe(2);
  });

  it('treats an array document as junk, like a non-object', () => {
    localStorage.setItem('neolude::prefs', '[]');
    const prefs = Storage.local.create('neolude::prefs', { done: false });
    expect(prefs.storageState()).toBe('defaults');
    expect(prefs.get('done')).toBe(false);
    expect(localStorage.getItem('neolude::prefs')).toBeNull();
  });

  it('patch of one field among many does not reset the others; set of one field does not erase the rest', () => {
    const wide = Storage.local.create('neolude::wide', {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
    });
    wide.patch({ c: 30 });
    expect(wide.get('a')).toBe(1);
    expect(wide.get('b')).toBe(2);
    expect(wide.get('c')).toBe(30);
    expect(wide.get('d')).toBe(4);
    expect(wide.get('e')).toBe(5);
    expect(wide.get('f')).toBe(6);

    wide.set('a', 10);
    expect(wide.get('b')).toBe(2);
    expect(wide.get('c')).toBe(30);

    const again = Storage.local.create('neolude::wide', {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
    });
    expect(again.storageState()).toBe('persisted');
    expect(again.get('a')).toBe(10);
    expect(again.get('c')).toBe(30);
    expect(again.get('f')).toBe(6);
  });

  it('patch merges nested objects and keeps siblings; set replaces the field', () => {
    const poll = Storage.local.create('neolude::poll', {
      bar: { snooze: 0, timestamp: 0 } as {
        snooze: number;
        timestamp?: number;
      },
    });
    poll.patch({ bar: { snooze: 1 } });
    expect(poll.get('bar')).toEqual({ snooze: 1, timestamp: 0 });

    poll.set('bar', { snooze: 9 });
    expect(poll.get('bar')).toEqual({ snooze: 9 });
  });

  it('patch merges a Record map; set replaces the whole map', () => {
    const poll = Storage.local.create('neolude::poll', {
      byPollId: { '1': 0 } as Record<string, number>,
    });
    poll.patch({ byPollId: { '2': 1 } });
    expect(poll.get('byPollId')).toEqual({ '1': 0, '2': 1 });

    poll.set('byPollId', { '9': 1 });
    expect(poll.get('byPollId')).toEqual({ '9': 1 });
  });

  it('patch replaces array fields instead of concatenating', () => {
    const list = Storage.local.create('neolude::list', { items: [1, 2] });
    list.patch({ items: [3] });
    expect(list.get('items')).toEqual([3]);
  });

  it('patch skips undefined keys', () => {
    const prefs = Storage.local.create('neolude::prefs', { foo: true, bar: 1 });
    prefs.patch({ foo: undefined, bar: 2 });
    expect(prefs.get('foo')).toBe(true);
    expect(prefs.get('bar')).toBe(2);
  });
});

describe('Storage.session vs local', () => {
  it('does not share keys across adapters', () => {
    Storage.local.create('ns', { n: 1 }).set('n', 2);
    Storage.session.create('ns', { n: 1 }).set('n', 3);
    expect(Storage.local.create('ns', { n: 0 }).get('n')).toBe(2);
    expect(Storage.session.create('ns', { n: 0 }).get('n')).toBe(3);
  });
});

describe('Storage bag', () => {
  it('set/get/delete/storageState on local; fallback does not write', () => {
    expect(Storage.local.storageState('flag')).toBe('defaults');
    expect(Storage.local.get<boolean>('flag')).toBeUndefined();
    expect(Storage.local.get('flag', false)).toBe(false);
    expect(localStorage.getItem('flag')).toBeNull();
    expect(Storage.local.storageState('flag')).toBe('defaults');

    Storage.local.set('flag', true);
    expect(Storage.local.storageState('flag')).toBe('persisted');
    expect(Storage.local.get<boolean>('flag')).toBe(true);

    Storage.local.delete('flag');
    expect(Storage.local.storageState('flag')).toBe('defaults');
    expect(Storage.local.get<boolean>('flag')).toBeUndefined();
  });

  it('returns a copy of bag objects', () => {
    Storage.local.set('box', { n: 1 });
    const box = Storage.local.get<{ n: number }>('box')!;
    box.n = 8;
    expect(Storage.local.get<{ n: number }>('box')).toEqual({ n: 1 });
  });

  it('treats invalid bag JSON as miss and removes the key', () => {
    localStorage.setItem('flag', 'nope');
    expect(Storage.local.get('flag', 1)).toBe(1);
    expect(localStorage.getItem('flag')).toBeNull();
  });

  it('last write wins when the same key is used as bag and as namespace', () => {
    Storage.local.create('same', { a: 1 }).set('a', 2);
    Storage.local.set('same', true);
    expect(Storage.local.get<boolean>('same')).toBe(true);

    const ns = Storage.local.create('same', { a: 0 });
    expect(ns.storageState()).toBe('defaults');
    expect(ns.get('a')).toBe(0);
  });

  it('set/get/delete on cookie with maxAge override', () => {
    Storage.cookie.set('flag', true, { maxAge: 86400 });
    expect(Storage.cookie.storageState('flag')).toBe('persisted');
    expect(Storage.cookie.get<boolean>('flag')).toBe(true);
    Storage.cookie.delete('flag');
    expect(Storage.cookie.storageState('flag')).toBe('defaults');
  });

  it('treats JSON null as persisted with value null; a miss is undefined', () => {
    Storage.local.set('flag', null);
    expect(Storage.local.storageState('flag')).toBe('persisted');
    expect(Storage.local.get('flag')).toBeNull();
    expect(Storage.local.get('missing')).toBeUndefined();
  });

  it('set/get on session bag does not write to local', () => {
    Storage.session.set('flag', 1);
    expect(Storage.session.get('flag')).toBe(1);
    expect(Storage.local.get('flag')).toBeUndefined();
  });

  it('returns a deep copy of nested bag objects and arrays', () => {
    Storage.local.set('box', { a: { b: 1 }, list: [1, { c: 2 }] });
    const box = Storage.local.get<{
      a: { b: number };
      list: Array<number | { c: number }>;
    }>('box')!;
    box.a.b = 9;
    (box.list[1] as { c: number }).c = 8;
    expect(Storage.local.get('box')).toEqual({
      a: { b: 1 },
      list: [1, { c: 2 }],
    });
  });

  it('JSON clone drops undefined properties and turns Date into ISO', () => {
    Storage.local.set('obj', { a: 1, skip: undefined });
    expect(Storage.local.get('obj')).toEqual({ a: 1 });

    Storage.local.set('when', new Date('2020-01-15T00:00:00.000Z'));
    expect(Storage.local.get('when')).toBe('2020-01-15T00:00:00.000Z');
  });
});

describe('Storage.cookie namespace', () => {
  it('round-trips a document and expires on clear', () => {
    const prefs = Storage.cookie.create('prefs', { done: false });
    expect(prefs.storageState()).toBe('defaults');
    prefs.set('done', true);
    expect(Storage.cookie.create('prefs', { done: false }).get('done')).toBe(
      true,
    );

    prefs.clear();
    expect(prefs.storageState()).toBe('defaults');
    expect(Storage.cookie.create('prefs', { done: false }).storageState()).toBe(
      'defaults',
    );
  });

  it('throws when the cookie payload is too large', () => {
    expect(() => Storage.cookie.set('k', 'x'.repeat(4000))).toThrow(RangeError);
  });

  it('throws when a namespaced cookie document is too large', () => {
    const prefs = Storage.cookie.create('ns', { blob: '' });
    expect(() => prefs.set('blob', 'x'.repeat(4000))).toThrow(RangeError);
  });

  it('round-trips a namespace whose name contains ::', () => {
    const prefs = Storage.cookie.create('neolude::prefs', { done: false });
    prefs.set('done', true);
    expect(
      Storage.cookie.create('neolude::prefs', { done: false }).get('done'),
    ).toBe(true);
  });

  it('overrides maxAge on namespaced set', () => {
    const prefs = Storage.cookie.create('prefs', { done: false }, { maxAge: 10 });
    expect(() => prefs.set('done', true, { maxAge: 20 })).not.toThrow();
    expect(Storage.cookie.get<{ done: boolean }>('prefs')?.done).toBe(true);
  });

  it('accepts maxAge from TimeSpan.totalSeconds', () => {
    const prefs = Storage.cookie.create(
      'prefs',
      { done: false },
      { maxAge: TimeSpan.parse('1d').totalSeconds },
    );
    prefs.set('done', true, { maxAge: TimeSpan.parse('1m').totalSeconds });
    expect(Storage.cookie.create('prefs', { done: false }).get('done')).toBe(
      true,
    );
  });
});
