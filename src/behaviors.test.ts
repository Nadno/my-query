import { describe, it, expect, beforeAll } from 'vitest';
import { signal } from '@preact/signals-core';
import $ from './index';
import { $model, $useSignal } from './index';
import { preact } from './adapters/preact';

beforeAll(() => $useSignal(preact));

/** Dispara um evento nativo simples no elemento. */
function fire(el: Element, type: string): void {
  el.dispatchEvent(new Event(type));
}

describe('$model — text/select simples (string)', () => {
  it('two-way em input de texto', () => {
    const text = signal('hi');
    const input = $.input({ use: $model(text) });
    expect(input.value).toBe('hi');
    input.value = 'yo';
    fire(input, 'input');
    expect(text.value).toBe('yo');
    text.value = 'zap';
    expect(input.value).toBe('zap');
  });

  it('two-way em <select> simples', () => {
    const choice = signal('b');
    const select = $.select(
      { use: $model(choice) },
      $.option({ value: 'a' }, 'A'),
      $.option({ value: 'b' }, 'B'),
      $.option({ value: 'c' }, 'C'),
    );
    expect(select.value).toBe('b');
    select.value = 'c';
    fire(select, 'input');
    expect(choice.value).toBe('c');
  });
});

describe('$model — checkbox booleano', () => {
  it('reflete e escreve .checked', () => {
    const on = signal(false);
    const box = $.input({ type: 'checkbox', use: $model(on) });
    expect(box.checked).toBe(false);
    on.value = true;
    expect(box.checked).toBe(true);
    box.checked = false;
    fire(box, 'change');
    expect(on.value).toBe(false);
  });
});

describe('$model — radio', () => {
  it('marca conforme o valor e escreve el.value ao selecionar', () => {
    const picked = signal('b');
    const a = $.input({ type: 'radio', name: 'g', value: 'a', use: $model(picked) });
    const b = $.input({ type: 'radio', name: 'g', value: 'b', use: $model(picked) });
    expect(a.checked).toBe(false);
    expect(b.checked).toBe(true);

    // selecionar 'a' escreve o signal e o effect desmarca 'b'
    a.checked = true;
    fire(a, 'change');
    expect(picked.value).toBe('a');
    expect(b.checked).toBe(false);

    // escrever no signal reflete de volta
    picked.value = 'b';
    expect(a.checked).toBe(false);
    expect(b.checked).toBe(true);
  });
});

describe('$model — checkbox-group (array)', () => {
  it('alterna a presença de el.value no array', () => {
    const tags = signal<string[]>(['x']);
    const x = $.input({ type: 'checkbox', value: 'x', use: $model(tags) });
    const y = $.input({ type: 'checkbox', value: 'y', use: $model(tags) });
    expect(x.checked).toBe(true);
    expect(y.checked).toBe(false);

    // marcar 'y' → adiciona
    y.checked = true;
    fire(y, 'change');
    expect(tags.value).toEqual(['x', 'y']);

    // desmarcar 'x' → remove
    x.checked = false;
    fire(x, 'change');
    expect(tags.value).toEqual(['y']);

    // escrever no signal reflete nos dois
    tags.value = ['x'];
    expect(x.checked).toBe(true);
    expect(y.checked).toBe(false);
  });
});

describe('$model — <select multiple> (array)', () => {
  it('sincroniza as opções selecionadas com o array', () => {
    const sel = signal<string[]>(['b']);
    const select = $.select(
      { multiple: true, use: $model(sel) },
      $.option({ value: 'a' }, 'A'),
      $.option({ value: 'b' }, 'B'),
      $.option({ value: 'c' }, 'C'),
    );
    const [a, b, c] = Array.from(select.options);
    expect(a!.selected).toBe(false);
    expect(b!.selected).toBe(true);

    // seleção do usuário → array
    a!.selected = true;
    c!.selected = true;
    b!.selected = false;
    fire(select, 'change');
    expect(sel.value).toEqual(['a', 'c']);

    // signal → seleção
    sel.value = ['b'];
    expect(a!.selected).toBe(false);
    expect(b!.selected).toBe(true);
    expect(c!.selected).toBe(false);
  });
});
