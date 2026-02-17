/**
 * Style System - CSS-in-JS engine for @mini-stack/query
 * 
 * A lightweight, runtime CSS-in-JS engine that generates scoped class names
 * by hashing style objects and injecting them into a single <style> tag.
 */

// Cache to store style objects and their corresponding class names
const styleCache = new Map<string, string>();

// Style sheet element
let styleSheet: CSSStyleSheet | null = null;

// Counter for generating unique class names
let classCounter = 0;

/**
 * Hash a string to a 5-character alphanumeric string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).slice(0, 5);
}

/**
 * Convert camelCase CSS properties to kebab-case
 */
function camelToKebab(camel: string): string {
  return camel.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Process a style object and generate CSS rules
 * @param styleObj Style object to process
 * @param selector Base selector for scoped styles
 */
function processStyleObject(styleObj: any, selector: string): string[] {
  const rules: string[] = [];
  const declarations: string[] = [];

  for (const [key, value] of Object.entries(styleObj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested selector (e.g., &:hover)
      let nestedSelector = key;
      if (nestedSelector.startsWith('&')) {
        nestedSelector = nestedSelector.replace('&', selector);
      } else if (!nestedSelector.startsWith(':')) {
        nestedSelector = `${selector} ${nestedSelector}`;
      } else {
        nestedSelector = selector + nestedSelector;
      }
      rules.push(...processStyleObject(value, nestedSelector));
    } else {
      // Declaration (e.g., color: 'red')
      declarations.push(`${camelToKebab(key)}: ${value}`);
    }
  }

  if (declarations.length > 0) {
    rules.push(`${selector} { ${declarations.join('; ')}; }`);
  }

  return rules;
}

/**
 * Initialize the style sheet
 */
function initializeStyleSheet(): CSSStyleSheet {
  if (styleSheet) return styleSheet;

  let styleElement = document.getElementById('mq-styles') as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'mq-styles';
    document.head.appendChild(styleElement);
  }

  if (!styleElement.sheet) {
    styleElement.textContent = '';
  }

  styleSheet = styleElement.sheet as CSSStyleSheet;
  return styleSheet;
}

/**
 * Generate and inject a scoped class from a style object
 */
function createClass(styleObj: any): string {
  const serialized = JSON.stringify(styleObj);

  if (styleCache.has(serialized)) {
    return styleCache.get(serialized)!;
  }

  const className = `mq-${hashString(serialized)}-${classCounter++}`;
  const selector = `.${className}`;
  const rules = processStyleObject(styleObj, selector);

  const sheet = initializeStyleSheet();
  for (const rule of rules) {
    try {
      sheet.insertRule(rule);
    } catch (error) {
      console.error('Failed to insert CSS rule:', rule, error);
    }
  }

  styleCache.set(serialized, className);
  return className;
}

/**
 * Check if config is a variant-style config (has `base` key)
 */
function isVariantConfig(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'base' in obj &&
    typeof obj.base === 'object'
  );
}

// Variant combination cache: "baseClass|variant1=value1,variant2=value2" → className
const variantCache = new Map<string, string>();

/**
 * CSS-in-JS engine function
 *
 * Plain usage — returns a scoped class name:
 *   style({ color: 'red', '&:hover': { color: 'blue' } }) → "mq-xxxxx-0"
 *
 * Variant usage — returns a function that resolves variant props to class names:
 *   const btn = style({ base: {...}, variants: { size: { sm: {...}, lg: {...} } }, defaultVariants: { size: 'sm' } })
 *   btn() → "mq-base mq-sm"
 *   btn({ size: 'lg' }) → "mq-base mq-lg"
 */
export function style(config: any): any {
  if (!isVariantConfig(config)) {
    return createClass(config);
  }

  const { base, variants = {}, defaultVariants = {} } = config;
  const baseClass = createClass(base);

  // Pre-generate all variant classes
  const variantClasses: Record<string, Record<string, string>> = {};
  for (const [variantName, variantOptions] of Object.entries(variants)) {
    variantClasses[variantName] = {};
    for (const [optionName, optionStyles] of Object.entries(
      variantOptions as Record<string, any>,
    )) {
      variantClasses[variantName][optionName] = createClass(optionStyles);
    }
  }

  return (props?: Record<string, string>): string => {
    const resolved = { ...defaultVariants, ...props };
    const cacheKey = `${baseClass}|${Object.entries(resolved)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')}`;

    if (variantCache.has(cacheKey)) {
      return variantCache.get(cacheKey)!;
    }

    const classes = [baseClass];
    for (const [variantName, optionName] of Object.entries(resolved)) {
      const cls = variantClasses[variantName]?.[optionName as string];
      if (cls) classes.push(cls);
    }

    const result = classes.join(' ');
    variantCache.set(cacheKey, result);
    return result;
  };
}
