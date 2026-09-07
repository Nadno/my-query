import { describe, it, expect, beforeEach } from 'vitest';
import { signal, computed } from '@preact/signals-core';
import $ from '../index';
import { preact } from '../adapters/preact';

$.useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('elemento + props', () => {
  it('cria elemento estático com atributos e children', () => {
    const el = $.div({ id: 'x', class: 'a b' }, 'hello', $.span({}, 'world'));
    expect(el.id).toBe('x');
    expect(el.className).toBe('a b');
    expect(el.textContent).toBe('helloworld');
    expect(el.querySelector('span')?.textContent).toBe('world');
  });

  it('atributo reativo $prop atualiza', () => {
    const disabled = signal(false);
    const btn = $.button({ $disabled: disabled }, 'ok');
    expect(btn.disabled).toBe(false);
    disabled.value = true;
    expect(btn.disabled).toBe(true);
  });

  it('$class e $data reativos', () => {
    const active = signal(false);
    const count = signal(1);
    const el = $.div({
      $class: () => (active.value ? 'on' : 'off'),
      $data: { count },
    });
    expect(el.className).toBe('off');
    expect(el.dataset.count).toBe('1');
    active.value = true;
    count.value = 5;
    expect(el.className).toBe('on');
    expect(el.dataset.count).toBe('5');
  });

  it('texto reativo via função child', () => {
    const n = signal(0);
    const el = $.span({}, () => `n=${n.value}`);
    expect(el.textContent).toBe('n=0');
    n.value = 42;
    expect(el.textContent).toBe('n=42');
  });
});

describe('eventos', () => {
  it('handler simples', () => {
    let clicks = 0;
    const btn = $.button({ on: { click: () => clicks++ } }, 'c');
    btn.click();
    btn.click();
    expect(clicks).toBe(2);
  });

  it('modificadores via array [handler, ...mods]', () => {
    const { keys, prevent } = $.handle;
    let entered = 0;
    const input = $.input({
      on: { keydown: [() => entered++, keys('Enter'), prevent] },
    });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(entered).toBe(0);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(entered).toBe(1);
  });
});

describe('componentes', () => {
  it('forma setup: $.tag(setup) → componente', () => {
    const Counter = $.div<{ count: import('@preact/signals-core').Signal<number> }>(
      ({ count }) => [
        $.span({}, () => `count: ${count.value}`),
        $.button({ on: { click: () => (count.value += 1) } }, '+'),
      ],
    );
    const count = signal(0);
    const el = Counter({ count });
    expect(el.querySelector('span')?.textContent).toBe('count: 0');
    el.querySelector('button')?.click();
    expect(el.querySelector('span')?.textContent).toBe('count: 1');
  });

  it('forma closure', () => {
    const Row = (t: { title: string }) => $.li({}, t.title);
    const el = Row({ title: 'abc' });
    expect(el.tagName).toBe('LI');
    expect(el.textContent).toBe('abc');
  });
});

describe('lista keyed', () => {
  it('reordena preservando nós por key e limpa removidos', () => {
    const items = signal([
      { id: 1, title: 'a' },
      { id: 2, title: 'b' },
      { id: 3, title: 'c' },
    ]);
    let created = 0;
    const Row = (t: { id: number; title: string }) => {
      created++;
      return $.li({ id: `row-${t.id}` }, t.title);
    };
    const ul = $.ul({}, () =>
      items.value.map((t) => [Row, { ...t, key: t.id }] as [typeof Row, any]),
    );
    $.mount(document.body, ul);

    const rowsInitial = [...document.querySelectorAll('li')];
    expect(rowsInitial.map((r) => r.id)).toEqual(['row-1', 'row-2', 'row-3']);
    expect(created).toBe(3);
    const node1 = document.getElementById('row-1');

    // reordena + remove o id 2
    items.value = [
      { id: 3, title: 'c' },
      { id: 1, title: 'a' },
    ];
    const rowsAfter = [...document.querySelectorAll('li')];
    expect(rowsAfter.map((r) => r.id)).toEqual(['row-3', 'row-1']);
    // nó do id 1 foi reutilizado (mesma referência), não recriado
    expect(document.getElementById('row-1')).toBe(node1);
    expect(created).toBe(3);
  });
});

describe('when', () => {
  it('monta/desmonta conforme condição', () => {
    const open = signal(false);
    const el = $.div({}, $.when(open, () => $.p({ id: 'panel' }, 'oi')));
    $.mount(document.body, el);
    expect(document.getElementById('panel')).toBeNull();
    open.value = true;
    expect(document.getElementById('panel')?.textContent).toBe('oi');
    open.value = false;
    expect(document.getElementById('panel')).toBeNull();
  });
});

describe('lifecycle / mount → unmount', () => {
  it('unmount roda cleanups e remove nós', () => {
    const n = signal(0);
    let effectRuns = 0;
    // idiomático: passar um builder p/ a árvore ser construída dentro do escopo
    const App = () =>
      $.div({}, () => {
        effectRuns++;
        return `n=${n.value}`;
      });
    const unmount = $.mount(document.body, App);
    expect(effectRuns).toBe(1);
    n.value = 1;
    expect(effectRuns).toBe(2);
    expect(document.body.textContent).toContain('n=1');

    unmount();
    expect(document.body.childNodes.length).toBe(0);
    // após unmount, o effect não roda mais
    n.value = 2;
    expect(effectRuns).toBe(2);
  });
});

describe('behaviors', () => {
  it('model faz two-way binding', () => {
    const text = signal('hi');
    const input = $.input({ use: $.model(text) });
    expect(input.value).toBe('hi');
    input.value = 'yo';
    input.dispatchEvent(new Event('input'));
    expect(text.value).toBe('yo');
    text.value = 'zap';
    expect(input.value).toBe('zap');
  });

  it('show alterna hidden', () => {
    const vis = signal(true);
    const el = $.div({ use: $.show(vis) });
    expect(el.hidden).toBe(false);
    vis.value = false;
    expect(el.hidden).toBe(true);
  });
});

describe('style / cx (DX)', () => {
  it('classes legíveis nomeadas', () => {
    const card = $.style('card', { parts: { title: {}, body: {} } });
    expect(card.self).toBe('card');
    expect(card.parts.title.self).toBe('-card-title');
    expect(card.parts.body.self).toBe('-card-body');
    const btn = $.style('btn', {
      base: {},
      variants: { size: { sm: {}, md: {} } },
      defaults: { size: 'md' },
    });
    expect(typeof btn).toBe('function');
    expect(btn({ size: 'sm' })).toBe('btn --size-sm');
    expect(btn()).toBe('btn --size-md');
  });

  it('cx compõe condicionais', () => {
    expect($.cx('a', false, 'b', ['c', null])).toBe('a b c');
    void computed;
  });

  it('injeta regras a partir de $.style / $.style.css', () => {
    const cls = $.style('mq-auth-card', {
      padding: 16,
      '&:hover': { color: 'red' },
    });
    expect(cls.self).toBe('mq-auth-card');
    const sheet = document.getElementById('mq-styles');
    expect(sheet?.textContent).toContain('.mq-auth-card { padding: 16px; }');
    expect(sheet?.textContent).toContain('.mq-auth-card:hover { color: red; }');

    const field = $.style('mq-auth-field', {
      display: 'flex',
      parts: { label: { base: { fontSize: 14 } } },
    });
    expect(field.self).toBe('mq-auth-field');
    expect(field.parts.label.self).toBe('-mq-auth-field-label');
    expect(sheet?.textContent).toContain('.mq-auth-field { display: flex; }');
    expect(sheet?.textContent).toContain(
      '.mq-auth-field .-mq-auth-field-label { font-size: 14px; }',
    );

    $.style.css('.mq-auth-global', { margin: 0 });
    expect(sheet?.textContent).toContain('.mq-auth-global { margin: 0px; }');
  });
});
