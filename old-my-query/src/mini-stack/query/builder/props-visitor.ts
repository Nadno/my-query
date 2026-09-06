import { MQBuilderCleanup } from './cleanup';

export type BuilderPropsContext = {
  cleanup: typeof MQBuilderCleanup;
  element: HTMLElement;
  key: string;
  value: any;
};

export type BuilderPropsVisitor = {
  canHandle(key: string, value: any): boolean;
  handle(context: BuilderPropsContext): void;
};

export class PropsVisitors {
  private static _visitors: BuilderPropsVisitor[] = [];

  public static addVisitor(v: BuilderPropsVisitor) {
    PropsVisitors._visitors.push(v);
  }

  public static addVisitorFirst(v: BuilderPropsVisitor) {
    PropsVisitors._visitors.unshift(v);
  }

  public static removeVisitor(v: BuilderPropsVisitor) {
    PropsVisitors._visitors = PropsVisitors._visitors.filter(
      (visitor) => visitor !== v,
    );
  }

  /** Returns true if a visitor handled the prop, false otherwise. */
  public static handle(context: BuilderPropsContext): boolean {
    for (const visitor of PropsVisitors._visitors) {
      if (visitor.canHandle(context.key, context.value)) {
        visitor.handle(context);
        return true;
      }
    }
    return false;
  }
}
