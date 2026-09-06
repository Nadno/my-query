import { HTMLElementInstanceMap } from '@/html-types';
import { MQueryClassList } from '../core/query-class-list';
import { MQPlugin } from '../types';

/**
 * ClassList Plugin - CSS class manipulation
 * Provides: add, has, remove, replace, supports, toggle
 */

export const MQClasslistPlugin: MQPlugin = {
  name: 'MQClasslist',
  install(mq) {
    mq.$extend({
      classes: {
        get() {
          return {
            has: MQueryClassList.has.bind(null, this.element as HTMLElement),
            add: MQueryClassList.add.bind(null, this.element as HTMLElement),
            remove: MQueryClassList.remove.bind(
              null,
              this.element as HTMLElement,
            ),
            toggle: MQueryClassList.toggle.bind(
              null,
              this.element as HTMLElement,
            ),
            replace: MQueryClassList.replace.bind(
              null,
              this.element as HTMLElement,
            ),
            supports: MQueryClassList.supports.bind(
              null,
              this.element as HTMLElement,
            ),
          };
        },
      },
    });
  },
};

declare module '../types' {
  interface MQClassList {
    add(...tokens: string[]): any;
    has(token: string): boolean;
    remove(...tokens: string[]): any;
    replace(token: string, newToken: string): boolean;
    supports(token: string): boolean;
    toggle(tokens: Record<string, boolean | undefined>): any;
    toggle(token: string, force?: boolean): boolean;
  }

  interface MQCore<E extends keyof HTMLElementInstanceMap> {
    classes: MQClassList;
  }
}

