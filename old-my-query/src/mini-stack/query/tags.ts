/**
 * HTML Tag Definitions - Type definitions and list of valid HTML tags
 * 
 * Provides type information for HTML tags to ensure type safety when using
 * the element builder functions. Each tag function returns the appropriate
 * HTMLElement type.
 */

// List of common HTML tags
export const HTML_TAGS = [
  // Document structure
  'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
  'div', 'header', 'footer', 'main', 'section', 'article', 'aside', 'nav',

  // Text content
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',

  // Inline text semantics
  'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data',
  'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark',
  'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span',

  // Images and multimedia
  'img', 'audio', 'video', 'source', 'track', 'canvas', 'embed', 'iframe',
  'object', 'param', 'picture', 'map', 'area',

  // Lists
  'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'menu', 'menuitem',

  // Tables
  'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr',
  'td', 'th',

  // Forms
  'form', 'label', 'input', 'button', 'select', 'datalist', 'optgroup',
  'option', 'textarea', 'output', 'progress', 'meter', 'fieldset', 'legend',

  // Interactive elements
  'details', 'summary', 'dialog',

  // Scripting
  'noscript', 'template', 'slot',
] as const;

// Type definitions for tag-to-element mappings
export type HtmlTagTypeMap = {
  html: HTMLHtmlElement;
  head: HTMLHeadElement;
  body: HTMLBodyElement;
  title: HTMLTitleElement;
  meta: HTMLMetaElement;
  link: HTMLLinkElement;
  script: HTMLScriptElement;
  style: HTMLStyleElement;
  div: HTMLDivElement;
  header: HTMLElement;
  footer: HTMLElement;
  main: HTMLElement;
  section: HTMLElement;
  article: HTMLElement;
  aside: HTMLElement;
  nav: HTMLElement;

  h1: HTMLHeadingElement;
  h2: HTMLHeadingElement;
  h3: HTMLHeadingElement;
  h4: HTMLHeadingElement;
  h5: HTMLHeadingElement;
  h6: HTMLHeadingElement;

  p: HTMLParagraphElement;
  br: HTMLBRElement;
  hr: HTMLHRElement;

  a: HTMLAnchorElement;
  em: HTMLElement;
  strong: HTMLElement;
  small: HTMLElement;
  s: HTMLElement;
  cite: HTMLElement;
  q: HTMLQuoteElement;
  dfn: HTMLElement;
  abbr: HTMLElement;
  data: HTMLDataElement;
  time: HTMLTimeElement;
  code: HTMLElement;
  var: HTMLElement;
  samp: HTMLElement;
  kbd: HTMLElement;
  sub: HTMLElement;
  sup: HTMLElement;
  i: HTMLElement;
  b: HTMLElement;
  u: HTMLElement;
  mark: HTMLElement;
  ruby: HTMLElement;
  rt: HTMLElement;
  rp: HTMLElement;
  bdi: HTMLElement;
  bdo: HTMLElement;
  span: HTMLSpanElement;

  img: HTMLImageElement;
  audio: HTMLAudioElement;
  video: HTMLVideoElement;
  source: HTMLSourceElement;
  track: HTMLTrackElement;
  canvas: HTMLCanvasElement;
  embed: HTMLEmbedElement;
  iframe: HTMLIFrameElement;
  object: HTMLObjectElement;
  param: HTMLParamElement;
  picture: HTMLElement;
  map: HTMLMapElement;
  area: HTMLAreaElement;

  ul: HTMLUListElement;
  ol: HTMLOListElement;
  li: HTMLLIElement;
  dl: HTMLDListElement;
  dt: HTMLElement;
  dd: HTMLElement;
  menu: HTMLMenuElement;
  menuitem: HTMLElement;

  table: HTMLTableElement;
  caption: HTMLTableCaptionElement;
  colgroup: HTMLTableColElement;
  col: HTMLTableColElement;
  tbody: HTMLTableSectionElement;
  thead: HTMLTableSectionElement;
  tfoot: HTMLTableSectionElement;
  tr: HTMLTableRowElement;
  td: HTMLTableCellElement;
  th: HTMLTableCellElement;

  form: HTMLFormElement;
  label: HTMLLabelElement;
  input: HTMLInputElement;
  button: HTMLButtonElement;
  select: HTMLSelectElement;
  datalist: HTMLDataListElement;
  optgroup: HTMLOptGroupElement;
  option: HTMLOptionElement;
  textarea: HTMLTextAreaElement;
  output: HTMLOutputElement;
  progress: HTMLProgressElement;
  meter: HTMLMeterElement;
  fieldset: HTMLFieldSetElement;
  legend: HTMLLegendElement;

  details: HTMLDetailsElement;
  summary: HTMLElement;
  dialog: HTMLDialogElement;

  noscript: HTMLElement;
  template: HTMLTemplateElement;
  slot: HTMLSlotElement;
};

// Type for valid HTML tag names
export type HtmlTagName = keyof HtmlTagTypeMap;

// Type for the element type corresponding to a tag name
export type TagElement<T extends HtmlTagName> = HtmlTagTypeMap[T];
