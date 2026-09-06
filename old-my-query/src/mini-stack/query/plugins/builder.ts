import { MQPlugin } from '../types';
import { PropsVisitors } from '../builder/props-visitor';
import { createTagFactories, cx } from '../builder/builder';
import { MQSignalBinder } from '../builder/binder';
import { applyClass, applyStyle, setProperty } from '../builder/utils';
import { HtmlTagTypeMap } from '../tags';
import { HTMLElementTagMap } from '@/html-types';
import MQDataSet from '../core/query-data-set';

export const MQBuilderPlugin: MQPlugin = {
  name: 'MQBuilder',
  install(mq) {
    createTagFactories(mq);
    mq.$static({ cx });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === 'class',
      handle: (ctx) => applyClass(ctx.element, ctx.value),
    });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === '$class',
      handle: (ctx) => {
        const adapter = MQSignalBinder.adapter;
        if (!adapter) return;
        const dispose = adapter.effect(() => {
          applyClass(ctx.element, adapter.getValue(ctx.value));
        });
        ctx.cleanup.attachDispose(ctx.element, '$class', dispose);
      },
    });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === 'style',
      handle: (ctx) => applyStyle(ctx.element, ctx.value),
    });

    PropsVisitors.addVisitor({
      canHandle: (k) => k === '$style',
      handle: (ctx) => {
        const adapter = MQSignalBinder.adapter;
        if (!adapter) return;
        const dispose = adapter.effect(() => {
          const styles = adapter.getValue(ctx.value);
          for (const k in styles)
            (ctx.element.style as any)[k] = String(styles[k]);
        });
        ctx.cleanup.attachDispose(ctx.element, '$style', dispose);
      },
    });

    // Static attribute fallback — matches everything except reactive ($*) and 'on'
    PropsVisitors.addVisitor({
      canHandle: (k) => k.charCodeAt(0) !== 36 && k !== 'on',
      handle: (ctx) => setProperty(ctx.element, ctx.key, ctx.value),
    });
  },
};

declare module '../types' {
  type MQCreateTagsFactories = {
    [Key in keyof HTMLElementTagMap]: MQCreateTagMap<HTMLElementTagMap[Key]>;
  };

  interface MQCoreStatic extends MQCreateTagsFactories {}
}

