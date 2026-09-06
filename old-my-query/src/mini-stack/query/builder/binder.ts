import { MQAttributeKeys, MQPropertyMap } from '../core/types';
import { MQBuilderCleanup } from './cleanup';

/**
 * Tipagem flexível para os valores (pode ser o valor cru ou um Signal)
 */
export type BindableValue<T> = T | ((...args: any[]) => T) | { value: T };

export type SignalAdapter = {
  isSignal: (value: BindableValue<any>) => boolean;
  getValue: <TValue = any>(signalOrFn: BindableValue<TValue>) => TValue;
  effect: (callback: () => void) => () => void;
};

export type PropsHandler = {
  /**
   * Sobrecarga 1: Dicionário estático com valores reativos (Fine-grained)
   * Ex: { className: signal('btn'), disabled: false }
   */
  <TKey extends keyof MQPropertyMap>(
    el: Element,
    source: { [K in TKey]?: BindableValue<MQPropertyMap[K]> },
  ): void;

  /**
   * Sobrecarga 2: Objeto inteiro reativo (Coarse-grained)
   * Ex: signal({ className: 'btn', disabled: false })
   */
  <TKey extends keyof MQPropertyMap>(
    el: Element,
    source: BindableValue<{ [K in TKey]?: MQPropertyMap[K] }>,
  ): void;

  /**
   * Implementação Real (A que roda no JS)
   */
  (el: Element, source: any): void;
};

export type AttrsHandler = {
  // Sobrecarga 1: Dicionário estático
  (
    el: Element,
    source: Partial<
      Record<MQAttributeKeys, BindableValue<string | number | boolean | null>>
    >,
  ): void;

  // Sobrecarga 2: Objeto inteiro reativo
  (
    el: Element,
    source: BindableValue<
      Partial<Record<MQAttributeKeys, string | number | boolean | null>>
    >,
  ): void;

  // Implementação
  (el: Element, source: any): void;
};

export const MQSignalBinder = {
  adapter: null as SignalAdapter | null,

  // Método elegante para injetar o adapter na inicialização
  setup: (adapter: SignalAdapter) => {
    MQSignalBinder.adapter = adapter;
  },

  /**
   * Aplica múltiplos atributos.
   * Aceita um Objeto estático { id: 'x', class: signal }
   * OU um Signal contendo um Objeto inteiro.
   */
  data: ((
    el: Element,
    source: BindableValue<Partial<Record<MQAttributeKeys, BindableValue<any>>>>,
  ) => {
    console.log({el, source})
    const adapter = MQSignalBinder.adapter;
    if (!adapter) throw new Error('Adapter missing');

    // CENÁRIO 2: O objeto INTEIRO é um Signal ou Função
    if (adapter.isSignal(source) || typeof source === 'function') {
      MQSignalBinder.useAdapterEffect(el, 'data:dynamic', ({ getValue }) => {
        const obj = getValue(source);
        // Itera e aplica diretamente ( coarse-grained )
        for (const key in obj) {
          const val = getValue(obj[key]);
          if (val == null) el.removeAttribute(key);
          else el.setAttribute(key, String(val));
        }
      });
      return;
    }

    // CENÁRIO 1: É um dicionário comum. Itera e delega para o singular!
    // Reatividade "Fine-Grained" (Granular e super rápida)
    for (const key in source as Record<string, any>) {
      MQSignalBinder.attr(el, `data-${key}` as MQAttributeKeys, (source as any)[key]);
    }
  }) as AttrsHandler,

  /**
   * Aplica múltiplos atributos.
   * Aceita um Objeto estático { id: 'x', class: signal }
   * OU um Signal contendo um Objeto inteiro.
   */
  attrs: ((
    el: Element,
    source: BindableValue<Partial<Record<MQAttributeKeys, BindableValue<any>>>>,
  ) => {
    const adapter = MQSignalBinder.adapter;
    if (!adapter) throw new Error('Adapter missing');

    // CENÁRIO 2: O objeto INTEIRO é um Signal ou Função
    if (adapter.isSignal(source) || typeof source === 'function') {
      MQSignalBinder.useAdapterEffect(el, 'attrs:dynamic', ({ getValue }) => {
        const obj = getValue(source);
        // Itera e aplica diretamente ( coarse-grained )
        for (const key in obj) {
          const val = getValue(obj[key]);
          if (val == null) el.removeAttribute(key);
          else el.setAttribute(key, String(val));
        }
      });
      return;
    }

    // CENÁRIO 1: É um dicionário comum. Itera e delega para o singular!
    // Reatividade "Fine-Grained" (Granular e super rápida)
    for (const key in source as Record<string, any>) {
      MQSignalBinder.attr(el, key as MQAttributeKeys, (source as any)[key]);
    }
  }) as AttrsHandler,

  /**
   * Aplica múltiplas propriedades.
   */
  props: ((el: Element, source: any) => {
    const adapter = MQSignalBinder.adapter;
    if (!adapter) throw new Error('Adapter missing');

    // CENÁRIO 2: O objeto INTEIRO é um Signal
    if (adapter.isSignal(source) || typeof source === 'function') {
      MQSignalBinder.useAdapterEffect(el, 'props:dynamic', ({ getValue }) => {
        const obj = getValue(source);
        for (const key in obj) {
          (el as any)[key] = getValue(obj[key]);
        }
      });
      return;
    }

    // CENÁRIO 1: É um dicionário comum. Itera e delega!
    for (const key in source) {
      // Repassa a responsabilidade para a função `prop` que já construímos
      MQSignalBinder.prop(el, key as keyof MQPropertyMap, (source as any)[key]);
    }
  }) as PropsHandler,

  attr: (el: Element, key: MQAttributeKeys, signalOrFn: any) => {
    MQSignalBinder.useAdapterEffect(el, `attr:${key}`, ({ getValue }) => {
      const val = getValue(signalOrFn);

      if (val == null) el.removeAttribute(key);
      else el.setAttribute(key, String(val));
    });
  },

  prop: <TKey extends keyof MQPropertyMap>(
    el: Element,
    key: TKey,
    signalOrFn: BindableValue<MQPropertyMap[TKey]>,
  ) => {
    MQSignalBinder.useAdapterEffect(el, `prop:${key}`, ({ getValue }) => {
      (el as any)[key] = getValue(signalOrFn);
    });
  },

  text(el: Node, signalOrFn: BindableValue<any>) {
    MQSignalBinder.useAdapterEffect(el, 'children', ({ getValue }) => {
      el.textContent = String(getValue(signalOrFn));
    });
  },

  children<C extends Element>(el: Element, signalOrFn: BindableValue<C[]>) {
    MQSignalBinder.useAdapterEffect(el, 'children', ({ getValue }) => {
      const children = getValue(signalOrFn);
      if (!Array.isArray(children))
        throw new Error('Children must be an array');
      el.replaceChildren(...children);
    });
  },

  useAdapterEffect(
    el: Node,
    key: string,
    callback: (value: Omit<SignalAdapter, 'effect'>) => void,
  ) {
    const adapter = MQSignalBinder.adapter;
    if (!adapter) {
      throw new Error(
        '[Mini-Stack] Adapter  não configurado. Chame MQSignalBinder.setup() primeiro.',
      );
    }

    // O Binder delega a criação do efeito pro Adapter
    const dispose = adapter.effect(() => {
      callback({
        getValue: adapter.getValue,
        isSignal: adapter.isSignal,
      });
    });

    MQBuilderCleanup.attachDispose(el, key, dispose);
  },
};

