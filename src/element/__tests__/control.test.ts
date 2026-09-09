import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from '../../index';
import { $mount, $when, $match, $switch, $else, $useSignal } from '../../index';
import { preact } from '../../adapters/preact';

$useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('when — ramo else', () => {
  it('false monta o else, true monta o then', () => {
    const open = signal(false);
    const App = () =>
      $.div(
        {},
        $when(
          open,
          () => $.p({ id: 'yes' }, 'sim'),
          () => $.p({ id: 'no' }, 'não'),
        ),
      );
    $mount(document.body, App);

    // condição false → else
    expect(document.getElementById('yes')).toBeNull();
    expect(document.getElementById('no')?.textContent).toBe('não');

    // true → then
    open.value = true;
    expect(document.getElementById('no')).toBeNull();
    expect(document.getElementById('yes')?.textContent).toBe('sim');

    // volta a false → else de novo
    open.value = false;
    expect(document.getElementById('yes')).toBeNull();
    expect(document.getElementById('no')).not.toBeNull();
  });
});

describe('when (açúcar de match)', () => {
  it('sem else → nada quando false, then quando true', () => {
    const open = signal(false);
    const App = () => $.div({}, $when(open, () => $.p({ id: 'y' }, 'sim')));
    $mount(document.body, App);

    expect(document.getElementById('y')).toBeNull();
    open.value = true;
    expect(document.getElementById('y')?.textContent).toBe('sim');
    open.value = false;
    expect(document.getElementById('y')).toBeNull();
  });
});

describe('when — estado fresco por design (sem cache de ramo)', () => {
  it('alternar recria o ramo: signal do closure reseta (preservação é $show)', () => {
    const open = signal(true);
    const App = () =>
      $.div(
        {},
        $when(open, () => {
          const local = signal(0);
          return $.button(
            { id: 'fresh', on: { click: () => local.value++ } },
            () => `n=${local.value}`,
          );
        }),
      );
    $mount(document.body, App);

    const btn = document.getElementById('fresh') as HTMLButtonElement;
    btn.click();
    btn.click();
    expect(btn.textContent).toBe('n=2');

    open.value = false;
    expect(document.getElementById('fresh')).toBeNull();
    open.value = true;

    const btn2 = document.getElementById('fresh') as HTMLButtonElement;
    expect(btn2).not.toBeNull();
    expect(btn2.textContent).toBe('n=0'); // recriado do zero — estado fresco
  });
});

describe('match', () => {
  it('a 1ª condição truthy vence (ordem importa)', () => {
    const a = signal(true);
    const b = signal(true);
    const App = () =>
      $.div(
        {},
        $match(
          [a, () => $.p({ id: 'a' }, 'A')],
          [b, () => $.p({ id: 'b' }, 'B')],
        ),
      );
    $mount(document.body, App);

    // ambas truthy → a 1ª vence
    expect(document.getElementById('a')).not.toBeNull();
    expect(document.getElementById('b')).toBeNull();

    // a cai → a 2ª passa a valer
    a.value = false;
    expect(document.getElementById('a')).toBeNull();
    expect(document.getElementById('b')).not.toBeNull();
  });

  it('nenhuma condição truthy e sem fallback → nada', () => {
    const a = signal(false);
    const b = signal(false);
    const App = () =>
      $.div(
        {},
        $match(
          [a, () => $.p({ id: 'a' }, 'A')],
          [b, () => $.p({ id: 'b' }, 'B')],
        ),
      );
    $mount(document.body, App);

    expect(document.getElementById('a')).toBeNull();
    expect(document.getElementById('b')).toBeNull();
  });

  it('fallback builder solto monta quando nada casa', () => {
    const a = signal(false);
    const App = () =>
      $.div(
        {},
        $match([a, () => $.p({ id: 'a' }, 'A')], () => $.p({ id: 'fb' }, 'FB')),
      );
    $mount(document.body, App);

    expect(document.getElementById('fb')?.textContent).toBe('FB');
    a.value = true;
    expect(document.getElementById('fb')).toBeNull();
    expect(document.getElementById('a')).not.toBeNull();
  });

  it('[$else, view] é catch-all', () => {
    const a = signal(false);
    const App = () =>
      $.div(
        {},
        $match(
          [a, () => $.p({ id: 'a' }, 'A')],
          [$else, () => $.p({ id: 'else' }, 'ELSE')],
        ),
      );
    $mount(document.body, App);

    expect(document.getElementById('else')?.textContent).toBe('ELSE');
    a.value = true;
    expect(document.getElementById('else')).toBeNull();
    expect(document.getElementById('a')).not.toBeNull();
  });

  it('troca reativa entre 3 vias', () => {
    const step = signal(0);
    const App = () =>
      $.div(
        {},
        $match(
          [() => step.value === 0, () => $.p({ id: 's0' }, '0')],
          [() => step.value === 1, () => $.p({ id: 's1' }, '1')],
          [$else, () => $.p({ id: 's2' }, '2')],
        ),
      );
    $mount(document.body, App);

    expect(document.getElementById('s0')).not.toBeNull();
    step.value = 1;
    expect(document.getElementById('s0')).toBeNull();
    expect(document.getElementById('s1')).not.toBeNull();
    step.value = 2;
    expect(document.getElementById('s1')).toBeNull();
    expect(document.getElementById('s2')).not.toBeNull();
    step.value = 0; // volta ao 1º
    expect(document.getElementById('s2')).toBeNull();
    expect(document.getElementById('s0')).not.toBeNull();
  });

  it('só as conds até a vencedora viram dependência', () => {
    const a = signal(true);
    const b = signal(true);
    let builds = 0;
    const App = () =>
      $.div(
        {},
        $match(
          [a, () => $.p({ id: 'a' }, 'A')],
          [
            b,
            () => {
              builds++;
              return $.p({ id: 'b' }, 'B');
            },
          ],
        ),
      );
    $mount(document.body, App);

    // a=true venceu; o ramo b nunca foi construído
    expect(builds).toBe(0);
    // mudar b (2ª cond, nunca avaliada além da vencedora) não deve reconciliar
    b.value = false;
    expect(builds).toBe(0);
    expect(document.getElementById('a')).not.toBeNull();
  });
});

describe('switch', () => {
  it('despacha pela chave do seletor', () => {
    const screen = signal('login');
    const App = () =>
      $.div(
        {},
        $switch(() => screen.value, {
          login: () => $.p({ id: 'login' }, 'L'),
          register: () => $.p({ id: 'register' }, 'R'),
        }),
      );
    $mount(document.body, App);

    expect(document.getElementById('login')).not.toBeNull();
    screen.value = 'register';
    expect(document.getElementById('login')).toBeNull();
    expect(document.getElementById('register')).not.toBeNull();
  });

  it('fallback em chave desconhecida (e nada sem fallback)', () => {
    const screen = signal('x');
    const withFb = () =>
      $.div(
        {},
        $switch(
          () => screen.value,
          { login: () => $.p({ id: 'login' }, 'L') },
          () => $.p({ id: 'fb' }, 'FB'),
        ),
      );
    $mount(document.body, withFb);
    expect(document.getElementById('fb')?.textContent).toBe('FB');

    document.body.innerHTML = '';
    const screen2 = signal('x');
    const noFb = () =>
      $.div({}, $switch(() => screen2.value, { login: () => $.p({ id: 'login' }, 'L') }));
    $mount(document.body, noFb);
    expect(document.getElementById('login')).toBeNull();
    expect(document.getElementById('fb')).toBeNull();
  });

  it('String(selector) indexa (chave não-string)', () => {
    const n = signal(0);
    const App = () =>
      $.div(
        {},
        $switch(n, {
          '0': () => $.p({ id: 'zero' }, 'Z'),
          '1': () => $.p({ id: 'one' }, 'O'),
        }),
      );
    $mount(document.body, App);

    expect(document.getElementById('zero')).not.toBeNull();
    n.value = 1;
    expect(document.getElementById('zero')).toBeNull();
    expect(document.getElementById('one')).not.toBeNull();
  });
});

describe('garantia bug 1 (view de match/switch em untrack)', () => {
  it('signal lido dentro da view não vira dependência da região', () => {
    const cond = signal(true);
    const inner = signal('a');
    let builds = 0;

    const App = () =>
      $.div(
        {},
        $match([
          cond,
          () => {
            builds++;
            const snap = inner.value; // lido na construção — NÃO deve virar dep
            return $.p({ id: 'v' }, snap);
          },
        ]),
      );
    $mount(document.body, App);

    expect(builds).toBe(1);
    inner.value = 'b'; // não deve reconstruir
    expect(builds).toBe(1);
    // só mudar a cond controla a montagem
    cond.value = false;
    expect(document.getElementById('v')).toBeNull();
    cond.value = true;
    expect(builds).toBe(2);
  });
});
