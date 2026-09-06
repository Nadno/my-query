import { registerDOMEventDefaults } from './defaults';

// Register built-in modifiers and custom events on import
registerDOMEventDefaults();

export * from './types';
export * from './store';
export * from './modifiers';
export * from './custom-events';
export * from './event';
export * from './utils';
export * from './defaults';
