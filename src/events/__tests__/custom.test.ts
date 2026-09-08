import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerCustomEvent,
  getCustomEvent,
  type EventSource,
} from '../custom';

beforeEach(() => {
  document.body.innerHTML = '';
});

/** Cria alvo + um nó-irmão fora dele, ambos no document. */
function scene() {
  const target = document.createElement('div');
  const inside = document.createElement('span');
  target.appendChild(inside);
  const outside = document.createElement('button');
  document.body.append(target, outside);
  return { target, inside, outside };
}

describe('registro', () => {
  it('registerCustomEvent / getCustomEvent guardam e recuperam a fonte', () => {
    const source: EventSource = () => () => {};
    registerCustomEvent('mqRegTest', source);
    expect(getCustomEvent('mqRegTest')).toBe(source);
    expect(getCustomEvent('naoExiste')).toBeUndefined();
  });
});

describe('clickOutside', () => {
  it('emite para clique fora, não para dentro; cleanup remove o listener', () => {
    const { target, inside, outside } = scene();
    const emit = vi.fn();
    const source = getCustomEvent('clickOutside')!;
    const remove = vi.spyOn(document, 'removeEventListener');
    const cleanup = source(target, emit);

    inside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(emit).not.toHaveBeenCalled();

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();

    cleanup();
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();
  });
});

describe('focusOutside', () => {
  it('emite para foco fora, não para dentro', () => {
    const { target, inside, outside } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('focusOutside')!(target, emit);

    inside.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(emit).not.toHaveBeenCalled();

    outside.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();

    cleanup();
    outside.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();
  });
});

describe('hover (enter-only, comportamento atual)', () => {
  it('emite no mouseenter do alvo; cleanup remove o listener', () => {
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('mouseenter'));
    expect(emit).toHaveBeenCalledOnce();

    cleanup();
    target.dispatchEvent(new Event('mouseenter'));
    expect(emit).toHaveBeenCalledOnce();
  });
});
