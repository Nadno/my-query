import { QueryHandlerModifiers } from './query-handler-modifiers';
import { QueryCustomEventHandler } from './query-custom-event-handler';

import {
  captureFactory,
  selfFactory,
  onceFactory,
  preventDefaultFactory,
  delegateFactory,
} from './query-default-modifiers';

import {
  clickOutsideFactory,
  focusOutsideFactory,
  hoverFactory,
  interactOutsideFactory,
} from './query-default-custom-events';

QueryHandlerModifiers.register('pre', '.capture', captureFactory)
  .register('pre', '.once', onceFactory)
  .register('normal', '.self', selfFactory)
  .register('normal', '.delegate', delegateFactory)
  .register('normal', '.prevent', preventDefaultFactory);

QueryCustomEventHandler.register(':click-outside', clickOutsideFactory)
  .register(':focus-outside', focusOutsideFactory)
  .register(':interact-outside', interactOutsideFactory)
  .register(':hover', hoverFactory);

export * from './query-custom-event-handler';
export * from './query-default-custom-events';
export * from './query-default-modifiers';
export * from './query-event-handler';
export * from './query-handler-modifiers';
export * from './query-handler-store';
