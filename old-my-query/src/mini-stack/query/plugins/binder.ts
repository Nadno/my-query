import { HTMLAttributesOf, HTMLElementInstanceMap } from '@/html-types';
import {
  type BindableValue,
  MQSignalBinder,
  type SignalAdapter,
} from '../builder/binder';
import { MQBuilderCleanup } from '../builder/cleanup';
import { MQAttributeKeys, MQCore, MQPlugin, MQPropertyMap } from '../types';
import { PropsVisitors } from '../builder/props-visitor';
import MQDataSet from '../core/query-data-set';

export type MQSignalBinderPluginPropsHandler<
  E extends keyof HTMLElementInstanceMap,
> = {
  <TKey extends keyof MQPropertyMap>(
    this: MQCore<E>,
    source: { [K in TKey]?: BindableValue<MQPropertyMap[K]> },
  ): void;

  <TKey extends keyof MQPropertyMap>(
    this: MQCore<E>,
    source: BindableValue<{ [K in TKey]?: MQPropertyMap[K] }>,
  ): void;
};

export type MQSignalBinderPluginAttrsHandler<
  E extends keyof HTMLElementInstanceMap,
> = {
  (
    this: MQCore<E>,
    source: Partial<
      Record<MQAttributeKeys, BindableValue<string | number | boolean | null>>
    >,
  ): void;
  (
    this: MQCore<E>,
    source: BindableValue<
      Partial<Record<MQAttributeKeys, string | number | boolean | null>>
    >,
  ): void;
};

export class Binder {
  element: Element;

  constructor(element: Element) {
    this.element = element;
  }

  props(source: any) {
    MQSignalBinder.props(this.element, source);
    return this;
  }
  attrs(source: any) {
    MQSignalBinder.attrs(this.element, source);
    return this;
  }
  prop<TKey extends keyof MQPropertyMap>(
    key: TKey,
    signalOrFn: BindableValue<MQPropertyMap[TKey]>,
  ) {
    MQSignalBinder.prop(this.element, key, signalOrFn);
    return this;
  }
  attr(key: MQAttributeKeys, signalOrFn: any) {
    MQSignalBinder.attr(this.element, key, signalOrFn);
    return this;
  }
  text(signalOrFn: BindableValue<any>) {
    MQSignalBinder.text(this.element, signalOrFn);
    return this;
  }
  children<C extends Element>(signalOrFn: BindableValue<C[]>) {
    MQSignalBinder.children(this.element, signalOrFn);
    return this;
  }
}

export const MQSignalBinderPlugin: MQPlugin = {
  name: 'MQSignalBinderPlugin',
  install(mq) {
    mq.$static({
      useSignal(adapter: SignalAdapter) {
        console.log({ adapter });
        MQSignalBinder.setup(adapter);
      },
      isSignal(value: any) {
        return (
          MQSignalBinder.adapter !== null &&
          MQSignalBinder.adapter.isSignal(value)
        );
      },
    });

    mq.$extend({
      bind: {
        get() {
          return new Binder(this.element);
        },
      },
    });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === 'data',
      handle: (ctx) => MQDataSet.assign(ctx.element, ctx.value),
    });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === '$data',
      handle: (ctx) => MQSignalBinder.data(ctx.element, ctx.value),
    });

    PropsVisitors.addVisitorFirst({
      // Handles $* props but yields $class/$style to their dedicated visitors
      canHandle: (key) =>
        key.charCodeAt(0) === 36 && key !== '$class' && key !== '$style',
      handle: (ctx) => {
        switch (ctx.key) {
          case 'data': {
            MQDataSet.assign(ctx.element, ctx.value);
            break;
          }
          case '$data': {
            MQSignalBinder.data(ctx.element, ctx.value);
            break;
          }
          default: {
            MQSignalBinder.attr(
              ctx.element,
              ctx.key.slice(1) as any,
              ctx.value,
            );
          }
        }
      },
    });
  },
};

declare module '../types' {
  interface MQBinder<E extends keyof HTMLElementInstanceMap> {
    props<TKey extends keyof MQPropertyMap>(source: {
      [K in TKey]?: BindableValue<MQPropertyMap[K]>;
    }): this;
    props<TKey extends keyof MQPropertyMap>(
      source: BindableValue<{ [K in TKey]?: MQPropertyMap[K] }>,
    ): this;
    attrs<TKey extends keyof HTMLAttributesOf<E>>(source: {
      [K in TKey]?: BindableValue<HTMLAttributesOf<E>[K]>;
    }): this;
    attrs<TKey extends keyof HTMLAttributesOf<E>>(
      source: BindableValue<{ [K in TKey]?: HTMLAttributesOf<E>[K] }>,
    ): this;
    prop<TKey extends keyof HTMLAttributesOf<E>>(
      key: TKey,
      signalOrFn: BindableValue<HTMLAttributesOf<E>[TKey]>,
    ): this;
    attr<K extends keyof HTMLAttributesOf<E>>(
      key: K | (string & {}),
      signalOrFn: BindableValue<HTMLAttributesOf<E>[K]>,
    ): this;
    text(signalOrFn: BindableValue<any>): this;
    children<C extends Element>(signalOrFn: BindableValue<C[]>): this;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    bind: MQBinder<E>;
  }

  interface MQCoreStatic {
    useSignal(adapter: SignalAdapter): void;
    isSignal(value: any): boolean;
    createScope(element?: HTMLElement): import('./binder').MQScope;
    mountTag(root: HTMLElement, element: HTMLElement): void;
  }
}

export type MQScope = {
  track(dispose: () => void): MQScope;
  dispose(): void;
};

export type { SignalAdapter, BindableValue };

