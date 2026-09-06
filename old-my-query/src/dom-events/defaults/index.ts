import { DOMEventModifiers } from '../modifiers';
import { DOMCustomEventHandler } from '../custom-events';

import {
  captureFactory,
  onceFactory,
  selfFactory,
  preventDefaultFactory,
  delegateFactory,
} from './modifiers';

import {
  clickOutsideFactory,
  focusOutsideFactory,
  interactOutsideFactory,
  hoverFactory,
} from './custom-events';

export function registerDOMEventDefaults(): void {
  DOMEventModifiers.register('.capture', captureFactory, 0)
    .register('.once', onceFactory, 0)
    .register('.self', selfFactory)
    .register('.delegate', delegateFactory)
    .register('.prevent', preventDefaultFactory);

  DOMCustomEventHandler.register(':click-outside', clickOutsideFactory)
    .register(':focus-outside', focusOutsideFactory)
    .register(':interact-outside', interactOutsideFactory)
    .register(':hover', hoverFactory);
}

export * from './modifiers';
export * from './custom-events';
