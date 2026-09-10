import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

/** PointerEvent de touch (jsdom não expõe `PointerEvent` global). */
const touchPointer = (type: string) =>
  Object.assign(new Event(type), { pointerType: 'touch' });

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

describe('hover (enter↔leave pareado, Pointer Events)', () => {
  afterEach(() => vi.useRealTimers());

  it('pointerenter devolve o cleanup do un-hover; pointerleave o roda', () => {
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('pointerenter'));
    expect(emit).toHaveBeenCalledOnce();
    expect(leave).not.toHaveBeenCalled();

    target.dispatchEvent(new Event('pointerleave'));
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

    target.dispatchEvent(new Event('pointerenter'));
    target.dispatchEvent(new Event('pointerenter')); // re-enter sem leave
    expect(leave1).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledTimes(2);

    target.dispatchEvent(new Event('pointerleave'));
    expect(leave2).toHaveBeenCalledOnce();

    cleanup();
  });

  it('cleanup da fonte remove listeners e roda o leave pendente', () => {
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const remove = vi.spyOn(target, 'removeEventListener');
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(new Event('pointerenter'));
    cleanup();
    expect(remove).toHaveBeenCalledWith('pointerenter', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('pointerleave', expect.any(Function));
    expect(leave).toHaveBeenCalledOnce();

    target.dispatchEvent(new Event('pointerenter'));
    expect(emit).toHaveBeenCalledOnce();
  });

  it('delayIn atrasa o enter; pointerleave antes cancela', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, { delayIn: 100 });

    target.dispatchEvent(new Event('pointerenter'));
    expect(emit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(emit).toHaveBeenCalledOnce();

    cleanup();
  });

  it('delayIn pendente + pointerleave cancela o enter (não emite depois)', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, { delayIn: 100 });

    target.dispatchEvent(new Event('pointerenter'));
    target.dispatchEvent(new Event('pointerleave')); // cancela o enterTimer
    vi.advanceTimersByTime(200);
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });

  it('delayOut atrasa o leave', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit, { delayOut: 100 });

    target.dispatchEvent(new Event('pointerenter'));
    target.dispatchEvent(new Event('pointerleave'));
    expect(leave).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('delayOut pendente + pointerenter cancela o timer e roda o leave pendente (defensivo)', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit, { delayOut: 100 });

    target.dispatchEvent(new Event('pointerenter'));
    target.dispatchEvent(new Event('pointerleave'));
    target.dispatchEvent(new Event('pointerenter')); // cancela o leaveTimer
    expect(leave).toHaveBeenCalledOnce(); // re-enter roda o leave pendente
    vi.advanceTimersByTime(200);
    expect(leave).toHaveBeenCalledOnce(); // timer cancelado: não roda de novo

    cleanup();
  });

  it('touchable: segurar o dedo (holdDelay) vira hover; soltar sai', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit, {
      touchable: true,
      holdDelay: 500,
    });

    target.dispatchEvent(touchPointer('pointerdown'));
    expect(emit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(emit).toHaveBeenCalledOnce();

    target.dispatchEvent(touchPointer('pointerup'));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('touchable: soltar antes do holdDelay não vira hover', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, {
      touchable: true,
      holdDelay: 500,
    });

    target.dispatchEvent(touchPointer('pointerdown'));
    target.dispatchEvent(touchPointer('pointerup'));
    vi.advanceTimersByTime(500);
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });

  it('touchable: scroll cancela o hold', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, {
      touchable: true,
      holdDelay: 500,
    });

    target.dispatchEvent(touchPointer('pointerdown'));
    document.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(500);
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });

  it('touchable: scroll com leave pendente roda o leave', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit, { touchable: true });

    target.dispatchEvent(touchPointer('pointerdown'));
    vi.advanceTimersByTime(500); // hold → hover
    expect(emit).toHaveBeenCalledOnce();
    document.dispatchEvent(new Event('scroll'));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('touchable: pointercancel cancela o hold sem virar hover', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, {
      touchable: true,
      holdDelay: 500,
    });

    target.dispatchEvent(touchPointer('pointerdown'));
    target.dispatchEvent(touchPointer('pointercancel'));
    vi.advanceTimersByTime(500);
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });

  it('touchable: pointercancel com hover ativo roda o leave', () => {
    vi.useFakeTimers();
    const { target } = scene();
    const leave = vi.fn();
    const emit = vi.fn(() => leave);
    const cleanup = getCustomEvent('hover')!(target, emit, { touchable: true });

    target.dispatchEvent(touchPointer('pointerdown'));
    vi.advanceTimersByTime(500);
    expect(emit).toHaveBeenCalledOnce();
    target.dispatchEvent(touchPointer('pointercancel'));
    expect(leave).toHaveBeenCalledOnce();

    cleanup();
  });

  it('touchable: contextmenu durante o hold é suprimido', () => {
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, { touchable: true });

    const prevented = vi.fn();
    target.dispatchEvent(touchPointer('pointerdown'));
    target.dispatchEvent(
      Object.assign(new Event('contextmenu'), { preventDefault: prevented }),
    );
    expect(prevented).toHaveBeenCalledOnce();

    cleanup();
  });

  it('touchable: selectstart durante o hold é suprimido', () => {
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, { touchable: true });

    const prevented = vi.fn();
    target.dispatchEvent(touchPointer('pointerdown'));
    target.dispatchEvent(
      Object.assign(new Event('selectstart'), { preventDefault: prevented }),
    );
    expect(prevented).toHaveBeenCalledOnce();

    cleanup();
  });

  it('touchable: pointerenter/pointerleave de touch não disparam (hold-to-hover)', () => {
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit, { touchable: true });

    target.dispatchEvent(touchPointer('pointerenter'));
    target.dispatchEvent(touchPointer('pointerleave'));
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });

  it('sem touchable, touch não vira hover', () => {
    const { target } = scene();
    const emit = vi.fn();
    const cleanup = getCustomEvent('hover')!(target, emit);

    target.dispatchEvent(touchPointer('pointerdown'));
    expect(emit).not.toHaveBeenCalled();

    cleanup();
  });
});
