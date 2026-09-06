// Re-exports from the standalone dom-events package.
// This file exists for backwards-compatibility with existing imports.
// Prefer importing from '@/dom-events' directly.
export {
  DOMEvent,
  DOMEvent as MQEvent,
  type ModifierDeclaration,
} from '@/dom-events/event';

export {
  DOMEventModifiers,
  DOMEventModifiers as QueryHandlerModifiers,
  type Modifier,
  type ModifierFactory,
  type ModifierResult,
  type ModifierTransform,
  type ModifyOptions,
  type ExternalModifierMeta,
  type InternalModifierMeta,
} from '@/dom-events/modifiers';

export {
  DOMCustomEventHandler,
  DOMCustomEventHandler as QueryCustomEventHandler,
  type CustomEventFactory,
  type CustomEventHandler,
  type CustomEventListener,
  type CustomEventListenerOptions,
  type CustomEventAddHandler,
  type CustomEventRemoveHandler,
  type CustomEventHandlerCommon,
  type CustomEventHandlerResult,
  type ComplexCustomEventHandlerResult,
  type ComplexCustomEventHandler,
  type CreateCustomEventOptions,
  type AddCustomEventOptions,
  type RemoveCustomEventOptions,
  type EventTypes,
} from '@/dom-events/custom-events';

export {
  DOMHandlerStore,
  DOMHandlerStore as QueryHandlerStore,
  type HandlerMapping,
  type MappedHandlerData,
  type AddMappedHandlerData,
} from '@/dom-events/store';

export {
  captureFactory,
  onceFactory,
  selfFactory,
  preventDefaultFactory,
  delegateFactory,
  type EventHandlerModifierMeta,
  type EventHandlerModifierFactory,
  type EventHandlerDelegateModifierMeta,
} from '@/dom-events/defaults/modifiers';

export {
  clickOutsideFactory,
  focusOutsideFactory,
  interactOutsideFactory,
  hoverFactory,
} from '@/dom-events/defaults/custom-events';
