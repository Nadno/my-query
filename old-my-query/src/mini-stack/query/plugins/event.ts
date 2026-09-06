import { HTMLElementInstanceMap } from '@/html-types';
import { DOMEvent } from '@/dom-events/event';
import { DOMEventOptions, DOMCustomEventKeyMap } from '@/dom-events/types';
import { MQPlugin } from '../types';
import { PropsVisitors } from '../builder/props-visitor';

export const MQEventPlugin: MQPlugin = {
  name: 'MQEvents',
  install(mq) {
    const eventHandlers = new WeakMap<Element, DOMEvent<any>>();

    mq.$static({ DOMEvent });

    const getOrCreate = (element: Element): DOMEvent<any> => {
      let handler = eventHandlers.get(element);
      if (!handler) {
        handler = new DOMEvent(element);
        eventHandlers.set(element, handler);
      }
      return handler;
    };

    mq.$extend({
      on: function (this: any, ...args: any[]) {
        return (getOrCreate(this.element) as any).on(...args);
      },
      $on: function (this: any, ...args: any[]) {
        return (getOrCreate(this.element) as any).$on(...args);
      },
      off: function (this: any, ...args: any[]) {
        const handler = eventHandlers.get(this.element);
        return handler ? (handler as any).off(...args) : this;
      },
      $off: function (this: any, ...args: any[]) {
        const handler = eventHandlers.get(this.element);
        return handler ? (handler as any).$off(...args) : this;
      },
    });

    PropsVisitors.addVisitor({
      canHandle: (key) => key === 'on',
      handle: (ctx) => {
        const dom = getOrCreate(ctx.element);
        for (const k in ctx.value) (dom as any).on(k, ctx.value[k]);
      },
    });
  },
};

declare module '../types' {
  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    on<TEvent extends keyof WindowEventMap>(
      event: TEvent,
      handler: (e: WindowEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    on<TEvent extends keyof DocumentEventMap>(
      event: TEvent,
      handler: (e: DocumentEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    on<TEvent extends keyof HTMLElementEventMap>(
      event: TEvent,
      handler: (e: HTMLElementEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;

    off<TEvent extends keyof WindowEventMap>(
      event: TEvent,
      handler: (e: WindowEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    off<TEvent extends keyof DocumentEventMap>(
      event: TEvent,
      handler: (e: DocumentEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    off<TEvent extends keyof HTMLElementEventMap>(
      event: TEvent,
      handler: (e: HTMLElementEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;

    $on<TEvent extends keyof WindowEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: WindowEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $on<TEvent extends keyof DocumentEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: DocumentEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $on<TEvent extends keyof HTMLElementEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: HTMLElementEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $on<TEvent extends keyof DOMCustomEventKeyMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: DOMCustomEventKeyMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $on(
      declarations: [string | { $$: string; [key: string]: any }, ...any[]],
      handler: (e: Event) => void,
      options?: DOMEventOptions,
    ): this;

    $off<TEvent extends keyof WindowEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: WindowEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $off<TEvent extends keyof DocumentEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: DocumentEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $off<TEvent extends keyof HTMLElementEventMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: HTMLElementEventMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $off<TEvent extends keyof DOMCustomEventKeyMap>(
      declarations: [TEvent, ...any[]],
      handler: (e: DOMCustomEventKeyMap[TEvent]) => void,
      options?: DOMEventOptions,
    ): this;
    $off(
      declarations: [string | { $$: string; [key: string]: any }, ...any[]],
      handler: (e: Event) => void,
      options?: DOMEventOptions,
    ): this;
  }
}

