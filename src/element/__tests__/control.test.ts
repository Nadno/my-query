import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from '../../index';
import { preact } from '../../adapters/preact';

$.useSignal(preact);

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('when — ramo else', () => {
  it('false monta o else, true monta o then', () => {
    const open = signal(false);
    const App = () =>
      $.div(
        {},
        $.when(
          open,
          () => $.p({ id: 'yes' }, 'sim'),
          () => $.p({ id: 'no' }, 'não'),
        ),
      );
    $.mount(document.body, App);

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
