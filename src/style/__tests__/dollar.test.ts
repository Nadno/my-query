import { describe, it, expect, vi } from 'vitest';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';
import { style, css } from '../index';

$useSignal(preact);

// Nomes de bloco únicos por caso: ver nota em handle.test.ts (registries de módulo).
// Prefixo `d` (dollar) evita colisão com os demais testes.
const sheet = () => document.getElementById('mq-styles')?.textContent ?? '';

describe('style — $ como idioma de parte (spec style-part-refs)', () => {
  it('$nome no topo emite filho direto (& > .-bloco-nome)', () => {
    style('d-box', {
      display: 'flex',
      $label: { padding: 4 },
    });
    expect(sheet()).toContain('.d-box { display: flex; }');
    expect(sheet()).toContain('.d-box > .-d-box-label { padding: 4px; }');
  });

  it('parte aninhada ($nome dentro de $nome) desce também por filho direto', () => {
    style('d-card2', {
      $body: {
        padding: 8,
        $lead: { color: '#333' },
      },
    });
    expect(sheet()).toContain('.d-card2 > .-d-card2-body { padding: 8px; }');
    expect(sheet()).toContain('.d-card2 > .-d-card2-body > .-d-card2-lead { color: #333; }');
  });

  it('refs $ em seletor composto resolvem de qualquer nível (global ao bloco)', () => {
    style('d-combo2', {
      $foo: {},
      $bar: {},
      $qux: {},
      // autor controla: '& >' ancora no self (filho direto); sem '&' seria descendente do self
      '& > $foo > $bar + $qux': { color: 'red' },
    });
    expect(sheet()).toContain(
      '.d-combo2 > .-d-combo2-foo > .-d-combo2-bar + .-d-combo2-qux { color: red; }',
    );
  });

  it('& $nome continua descendente explícito quando o autor quer', () => {
    style('d-desc2', {
      $muted: { opacity: 0.5 },
      $icon: { width: 8 },
      // `& $icon` = descendente do self (espaço); `& > $icon` = filho direto
      '& $icon': { float: 'right' },
    });
    expect(sheet()).toContain('.d-desc2 .-d-desc2-icon { float: right; }');
    expect(sheet()).toContain('.d-desc2 > .-d-desc2-muted { opacity: 0.5; }');
  });

  it('$ nome neto referenciado diretamente no root resolve (nivelamento)', () => {
    style('d-radio2', {
      $radio: {
        $dot: { width: 16 },
      },
      "&[aria-checked='true'] > $dot": { '&::after': { transform: 'scale(1)' } },
    });
    expect(sheet()).toContain(
      ".d-radio2[aria-checked='true'] > .-d-radio2-dot::after { transform: scale(1); }",
    );
  });

  it('meta $: com scope, hosts, defaults, flags, variants, keyframes', () => {
    const input = style('d-input-slot', { padding: 4 });
    const box = style('d-meta2', {
      $: {
        hosts: { control: input },
        defaults: { size: 'md' },
        flags: { invalid: { $error: { color: 'red' } } },
        variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
        keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
      },
      gap: 8,
      $error: { fontSize: '.85rem' },
    });

    expect(box.hosts.control).toBe('d-input-slot');
    expect(box.flags.invalid).toBe('--is-invalid');
    expect(box.variants.size.md).toBe('--size-md');
    expect(box.keyframes.pulse).toBe('d-meta2-pulse');
    expect(sheet()).toContain('.d-meta2 { gap: 8px; }');
    expect(sheet()).toContain('.d-meta2.--is-invalid > .-d-meta2-error { color: red; }');
    expect(sheet()).toContain('.d-meta2.--size-sm { gap: 4px; }');
    expect(sheet()).toContain('.d-meta2.--size-md { gap: 8px; }');
    expect(sheet()).toMatch(
      /@keyframes d-meta2-pulse \{ from \{ opacity: 0\.6; \} to \{ opacity: 1; \} \}/,
    );
  });

  it('override de host (bloco estrangeiro) em flag via hosts, descendente até o host', () => {
    const input = style('d-input-slot2', { padding: 4 });
    style('d-host2', {
      $: {
        hosts: { control: input },
        flags: { invalid: { hosts: { control: { borderColor: 'crimson' } } } },
      },
    });
    expect(sheet()).toContain('.d-host2.--is-invalid .d-input-slot2 { border-color: crimson; }');
  });

  it('colisão de nome de parte: refs globais flat — mesma classe, sem ambiguidade', () => {
    // Classes são depth-independent: `dot` em dois níveis vira AMBOS `-d-collide2-dot`;
    // a ref `$dot` resolve essa classe única (o autor evita duplicar no mesmo bloco).
    style('d-collide2', {
      $dot: { width: 10 },
      $group: { $dot: { width: 20 } },
      '$group > $dot': { opacity: 0.9 },
    });
    expect(sheet()).toContain('.d-collide2 > .-d-collide2-dot { width: 10px; }');
    expect(sheet()).toContain('.d-collide2 > .-d-collide2-group > .-d-collide2-dot { width: 20px; }');
    expect(sheet()).toContain(
      '.d-collide2 .-d-collide2-group > .-d-collide2-dot { opacity: 0.9; }',
    );
  });

  it('chave-objeto solta no topo (sem $ / & / @ / $:) avisa e não vira parte', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    style('d-warn2', { title: { fontWeight: 700 } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"title"'));
    warn.mockRestore();
  });

  it('nomes reservados do handle sob $nome avisam (self/flags/hosts…)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    style('d-res2', { $hosts: { color: 'red' } });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('reservado'));
    warn.mockRestore();
  });
});

describe('style — compat legacy (transição)', () => {
  it('parts:{} e >nome são legacy: mantêm descendente (compat até migrar)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    style('d-legacy2', {
      display: 'flex',
      parts: { label: { padding: 4 } }, // legacy → descendente
      '>icon': { width: 8 },            // legacy → descendente
    });
    expect(sheet()).toContain('.d-legacy2 .-d-legacy2-label { padding: 4px; }');
    expect(sheet()).toContain('.d-legacy2 .-d-legacy2-icon { width: 8px; }');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('$: scope strategy native emite @scope (.bloco)', () => {
    css('body', { margin: 0 });
    style('d-scope2', {
      $: { scope: { strategy: 'native' } },
      display: 'block',
    });
    expect(sheet()).toContain('@scope (.d-scope2)');
  });
});

describe('style — global css intacto', () => {
  it('css() global continua', () => {
    css('body', { margin: 0 });
    expect(sheet()).toContain('body { margin: 0px; }');
  });
});
