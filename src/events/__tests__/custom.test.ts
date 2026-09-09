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

describe('focusOutside (via relatedTarget)', () => {
  it('focusout com relatedTarget fora → emite; dentro → não', () => {
    const { target, inside, outside } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('focusOutside')!(target, emit);

    // foco foi para dentro do alvo → não emite
    target.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inside }));
    expect(emit).not.toHaveBeenCalled();

    // foco foi para fora → emite
    target.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside }));
    expect(emit).toHaveBeenCalledOnce();

    cleanup();
  });

  it('focusin de volta → roda o cleanup do un-focus', () => {
    const { target, outside } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('focusOutside')!(target, emit);

    target.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside }));
    expect(leave).not.toHaveBeenCalled();

    target.dispatchEvent(new FocusEvent('focusin'));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('cleanup da fonte remove listeners e roda o leave pendente', () => {
    const { target, outside } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const remove = vi.spyOn(target, 'removeEventListener');
    const cleanup = getCustomEvent('focusOutside')!(target, emit);

    target.dispatchEvent(new FocusEvent('focusout', { relatedTarget: outside }));
    cleanup();
    expect(remove).toHaveBeenCalledWith('focusout', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('focusin', expect.any(Function));
    expect(leave).toHaveBeenCalledOnce();
  });
});

describe('interactOutside', () => {
  it('pointerdown fora → emite; dentro → roda o cleanup', () => {
    const { target, inside, outside } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('interactOutside')!(target, emit);

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();
    expect(leave).not.toHaveBeenCalled();

    inside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('cleanup da fonte remove o listener e roda o leave pendente', () => {
    const { target, outside } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const remove = vi.spyOn(document, 'removeEventListener');
    const cleanup = getCustomEvent('interactOutside')!(target, emit);

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    cleanup();
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function), true);
    expect(leave).toHaveBeenCalledOnce();

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(emit).toHaveBeenCalledOnce();
  });
});

describe('hover (enter↔leave pareado)', () => {
  it('enter devolve o cleanup do un-hover; mouseleave o roda', () => {
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('mouseenter'));
    expect(emit).toHaveBeenCalledOnce();
    expect(leave).not.toHaveBeenCalled();

    target.dispatchEvent(new Event('mouseleave'));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('re-enter roda o leave pendente e devolve um novo cleanup', () => {
    const { target } = scene();
    const leave1 = vi.fn();
    const leave2 = vi.fn();
    const emit = vi
      .fn()
      .mockReturnValueOnce(leave1)
      .mockReturnValueOnce(leave2);
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('mouseenter'));
    target.dispatchEvent(new Event('mouseenter')); // re-enter sem leave
    expect(leave1).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledTimes(2);

    target.dispatchEvent(new Event('mouseleave'));
    expect(leave2).toHaveBeenCalledOnce();

    cleanup();
  });

  it('cleanup da fonte remove listeners e roda o leave pendente', () => {
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const remove = vi.spyOn(target, 'removeEventListener');
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('mouseenter'));
    cleanup();
    expect(remove).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(leave).toHaveBeenCalledOnce();

    target.dispatchEvent(new Event('mouseenter'));
    expect(emit).toHaveBeenCalledOnce();
  });
});
