export interface HtmlElementProps extends AllHTMLAttributes {}

interface SVGProps<T> extends SVGAttributes<T> {}
interface SVGLineElementAttributes<T> extends SVGProps<T> {}
interface SVGTextElementAttributes<T> extends SVGProps<T> {}

export interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * The index signature was removed to enable closed typing for style
   * using CSSType. You're able to use type assertion or module augmentation
   * to add properties or an index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
}

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  'aria-activedescendant'?: string | undefined;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  'aria-atomic'?: Booleanish | undefined;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined;
  /**
   * Defines a string value that labels the current element, which is intended to be converted into Braille.
   * @see aria-label.
   */
  'aria-braillelabel'?: string | undefined;
  /**
   * Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.
   * @see aria-roledescription.
   */
  'aria-brailleroledescription'?: string | undefined;
  'aria-busy'?: Booleanish | undefined;
  /**
   * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
   * @see aria-pressed @see aria-selected.
   */
  'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined;
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   * @see aria-colindex.
   */
  'aria-colcount'?: number | undefined;
  /**
   * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
   * @see aria-colcount @see aria-colspan.
   */
  'aria-colindex'?: number | undefined;
  /**
   * Defines a human readable text alternative of aria-colindex.
   * @see aria-rowindextext.
   */
  'aria-colindextext'?: string | undefined;
  /**
   * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-colindex @see aria-rowspan.
   */
  'aria-colspan'?: number | undefined;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   * @see aria-owns.
   */
  'aria-controls'?: string | undefined;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  'aria-current'?:
    | boolean
    | 'false'
    | 'true'
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | undefined;
  /**
   * Identifies the element (or elements) that describes the object.
   * @see aria-labelledby
   */
  'aria-describedby'?: string | undefined;
  /**
   * Defines a string value that describes or annotates the current element.
   * @see related aria-describedby.
   */
  'aria-description'?: string | undefined;
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   * @see aria-describedby.
   */
  'aria-details'?: string | undefined;
  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
   * @see aria-hidden @see aria-readonly.
   */
  'aria-disabled'?: Booleanish | undefined;
  /**
   * Indicates what functions can be performed when a dragged object is released on the drop target.
   * @deprecated in ARIA 1.1
   */
  'aria-dropeffect'?:
    | 'none'
    | 'copy'
    | 'execute'
    | 'link'
    | 'move'
    | 'popup'
    | undefined;
  /**
   * Identifies the element that provides an error message for the object.
   * @see aria-invalid @see aria-describedby.
   */
  'aria-errormessage'?: string | undefined;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  'aria-expanded'?: Booleanish | undefined;
  /**
   * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
   * allows assistive technology to override the general default of reading in document source order.
   */
  'aria-flowto'?: string | undefined;
  /**
   * Indicates an element's "grabbed" state in a drag-and-drop operation.
   * @deprecated in ARIA 1.1
   */
  'aria-grabbed'?: Booleanish | undefined;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?:
    | boolean
    | 'false'
    | 'true'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
    | 'dialog'
    | undefined;
  /**
   * Indicates whether the element is exposed to an accessibility API.
   * @see aria-disabled.
   */
  'aria-hidden'?: Booleanish | undefined;
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   * @see aria-errormessage.
   */
  'aria-invalid'?:
    | boolean
    | 'false'
    | 'true'
    | 'grammar'
    | 'spelling'
    | undefined;
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  'aria-keyshortcuts'?: string | undefined;
  /**
   * Defines a string value that labels the current element.
   * @see aria-labelledby.
   */
  'aria-label'?: string | undefined;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see aria-describedby.
   */
  'aria-labelledby'?: string | undefined;
  /** Defines the hierarchical level of an element within a structure. */
  'aria-level'?: number | undefined;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  'aria-live'?: 'off' | 'assertive' | 'polite' | undefined;
  /** Indicates whether an element is modal when displayed. */
  'aria-modal'?: Booleanish | undefined;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  'aria-multiline'?: Booleanish | undefined;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  'aria-multiselectable'?: Booleanish | undefined;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  'aria-orientation'?: 'horizontal' | 'vertical' | undefined;
  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
   * @see aria-controls.
   */
  'aria-owns'?: string | undefined;
  /**
   * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
   * A hint could be a sample value or a brief description of the expected format.
   */
  'aria-placeholder'?: string | undefined;
  /**
   * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-setsize.
   */
  'aria-posinset'?: number | undefined;
  /**
   * Indicates the current "pressed" state of toggle buttons.
   * @see aria-checked @see aria-selected.
   */
  'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined;
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   * @see aria-disabled.
   */
  'aria-readonly'?: Booleanish | undefined;
  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
   * @see aria-atomic.
   */
  'aria-relevant'?:
    | 'additions'
    | 'additions removals'
    | 'additions text'
    | 'all'
    | 'removals'
    | 'removals additions'
    | 'removals text'
    | 'text'
    | 'text additions'
    | 'text removals'
    | undefined;
  /** Indicates that user input is required on the element before a form may be submitted. */
  'aria-required'?: Booleanish | undefined;
  /** Defines a human-readable, author-localized description for the role of an element. */
  'aria-roledescription'?: string | undefined;
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   * @see aria-rowindex.
   */
  'aria-rowcount'?: number | undefined;
  /**
   * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
   * @see aria-rowcount @see aria-rowspan.
   */
  'aria-rowindex'?: number | undefined;
  /**
   * Defines a human readable text alternative of aria-rowindex.
   * @see aria-colindextext.
   */
  'aria-rowindextext'?: string | undefined;
  /**
   * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-rowindex @see aria-colspan.
   */
  'aria-rowspan'?: number | undefined;
  /**
   * Indicates the current "selected" state of various widgets.
   * @see aria-checked @see aria-pressed.
   */
  'aria-selected'?: Booleanish | undefined;
  /**
   * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-posinset.
   */
  'aria-setsize'?: number | undefined;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined;
  /** Defines the maximum allowed value for a range widget. */
  'aria-valuemax'?: number | undefined;
  /** Defines the minimum allowed value for a range widget. */
  'aria-valuemin'?: number | undefined;
  /**
   * Defines the current value for a range widget.
   * @see aria-valuetext.
   */
  'aria-valuenow'?: number | undefined;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  'aria-valuetext'?: string | undefined;
}

// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem'
  | (string & {});

interface HTMLAttributes extends AriaAttributes {
  // Standard HTML Attributes
  accessKey?: string | undefined;
  autoCapitalize?:
    | 'off'
    | 'none'
    | 'on'
    | 'sentences'
    | 'words'
    | 'characters'
    | undefined
    | (string & {});
  autoFocus?: boolean | undefined;
  className?: string | undefined;
  contentEditable?: Booleanish | 'inherit' | 'plaintext-only' | undefined;
  contextMenu?: string | undefined;
  dir?: string | undefined;
  draggable?: Booleanish | undefined;
  enterKeyHint?:
    | 'enter'
    | 'done'
    | 'go'
    | 'next'
    | 'previous'
    | 'search'
    | 'send'
    | undefined;
  hidden?: boolean | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  nonce?: string | undefined;
  slot?: string | undefined;
  spellCheck?: Booleanish | undefined;
  style?: CSSProperties | undefined;
  tabIndex?: number | undefined;
  title?: string | undefined;
  translate?: 'yes' | 'no' | undefined;

  // Unknown
  radioGroup?: string | undefined; // <command>, <menuitem>

  // WAI-ARIA
  role?: AriaRole | undefined;

  // RDFa Attributes
  about?: string | undefined;
  content?: string | undefined;
  datatype?: string | undefined;
  inlist?: any;
  prefix?: string | undefined;
  property?: string | undefined;
  rel?: string | undefined;
  resource?: string | undefined;
  rev?: string | undefined;
  typeof?: string | undefined;
  vocab?: string | undefined;

  // Non-standard Attributes
  autoCorrect?: string | undefined;
  autoSave?: string | undefined;
  color?: string | undefined;
  itemProp?: string | undefined;
  itemScope?: boolean | undefined;
  itemType?: string | undefined;
  itemID?: string | undefined;
  itemRef?: string | undefined;
  results?: number | undefined;
  security?: string | undefined;
  unselectable?: 'on' | 'off' | undefined;

  // Popover API
  popover?: '' | 'auto' | 'manual' | 'hint' | undefined;
  popoverTargetAction?: 'toggle' | 'show' | 'hide' | undefined;
  popoverTarget?: string | undefined;

  // Living Standard
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert}
   */
  inert?: boolean | undefined;
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see {@link https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute}
   */
  inputMode?:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search'
    | undefined;
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see {@link https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is}
   */
  is?: string | undefined;
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts}
   */
  exportparts?: string | undefined;
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part}
   */
  part?: string | undefined;
}

interface AllHTMLAttributes extends HTMLAttributes {
  // Standard HTML Attributes
  accept?: string | undefined;
  acceptCharset?: string | undefined;
  action?: string;
  allowFullScreen?: boolean | undefined;
  allowTransparency?: boolean | undefined;
  alt?: string | undefined;
  as?: string | undefined;
  async?: boolean | undefined;
  autoComplete?: string | undefined;
  autoPlay?: boolean | undefined;
  capture?: boolean | 'user' | 'environment' | undefined;
  cellPadding?: number | string | undefined;
  cellSpacing?: number | string | undefined;
  charSet?: string | undefined;
  challenge?: string | undefined;
  checked?: boolean | undefined;
  cite?: string | undefined;
  classID?: string | undefined;
  cols?: number | undefined;
  colSpan?: number | undefined;
  controls?: boolean | undefined;
  coords?: string | undefined;
  crossOrigin?: CrossOrigin;
  data?: string | undefined;
  dateTime?: string | undefined;
  default?: boolean | undefined;
  defer?: boolean | undefined;
  disabled?: boolean | undefined;
  download?: any;
  encType?: string | undefined;
  form?: string | undefined;
  formAction?: string;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  frameBorder?: number | string | undefined;
  headers?: string | undefined;
  height?: number | string | undefined;
  high?: number | undefined;
  href?: string | undefined;
  hrefLang?: string | undefined;
  htmlFor?: string | undefined;
  httpEquiv?: string | undefined;
  integrity?: string | undefined;
  keyParams?: string | undefined;
  keyType?: string | undefined;
  kind?: string | undefined;
  label?: string | undefined;
  list?: string | undefined;
  loop?: boolean | undefined;
  low?: number | undefined;
  manifest?: string | undefined;
  marginHeight?: number | undefined;
  marginWidth?: number | undefined;
  max?: number | string | undefined;
  maxLength?: number | undefined;
  media?: string | undefined;
  mediaGroup?: string | undefined;
  method?: string | undefined;
  min?: number | string | undefined;
  minLength?: number | undefined;
  multiple?: boolean | undefined;
  muted?: boolean | undefined;
  name?: string | undefined;
  noValidate?: boolean | undefined;
  open?: boolean | undefined;
  optimum?: number | undefined;
  pattern?: string | undefined;
  placeholder?: string | undefined;
  playsInline?: boolean | undefined;
  poster?: string | undefined;
  preload?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  reversed?: boolean | undefined;
  rows?: number | undefined;
  rowSpan?: number | undefined;
  sandbox?: string | undefined;
  scope?: string | undefined;
  scoped?: boolean | undefined;
  scrolling?: string | undefined;
  seamless?: boolean | undefined;
  selected?: boolean | undefined;
  shape?: string | undefined;
  size?: number | undefined;
  sizes?: string | undefined;
  span?: number | undefined;
  src?: string | undefined;
  srcDoc?: string | undefined;
  srcLang?: string | undefined;
  srcSet?: string | undefined;
  start?: number | undefined;
  step?: number | string | undefined;
  summary?: string | undefined;
  target?: string | undefined;
  type?: string | undefined;
  useMap?: string | undefined;
  value?: string | readonly string[] | number | undefined;
  width?: number | string | undefined;
  wmode?: string | undefined;
  wrap?: string | undefined;
}

type HTMLAttributeReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

type HTMLAttributeAnchorTarget =
  | '_self'
  | '_blank'
  | '_parent'
  | '_top'
  | (string & {});

interface AnchorHTMLAttributes extends HTMLAttributes {
  download?: any;
  href?: string | undefined;
  hrefLang?: string | undefined;
  media?: string | undefined;
  ping?: string | undefined;
  target?: HTMLAttributeAnchorTarget | undefined;
  type?: string | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
}

interface AudioHTMLAttributes extends MediaHTMLAttributes {}

interface AreaHTMLAttributes extends HTMLAttributes {
  alt?: string | undefined;
  coords?: string | undefined;
  download?: any;
  href?: string | undefined;
  hrefLang?: string | undefined;
  media?: string | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  shape?: string | undefined;
  target?: string | undefined;
}

interface BaseHTMLAttributes extends HTMLAttributes {
  href?: string | undefined;
  target?: string | undefined;
}

interface BlockquoteHTMLAttributes extends HTMLAttributes {
  cite?: string | undefined;
}

interface ButtonHTMLAttributes extends HTMLAttributes {
  disabled?: boolean | undefined;
  form?: string | undefined;
  formAction?: string;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  name?: string | undefined;
  type?: 'submit' | 'reset' | 'button' | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface CanvasHTMLAttributes extends HTMLAttributes {
  height?: number | string | undefined;
  width?: number | string | undefined;
}

interface ColHTMLAttributes extends HTMLAttributes {
  span?: number | undefined;
  width?: number | string | undefined;
}

interface ColgroupHTMLAttributes extends HTMLAttributes {
  span?: number | undefined;
}

interface DataHTMLAttributes extends HTMLAttributes {
  value?: string | readonly string[] | number | undefined;
}

interface DetailsHTMLAttributes extends HTMLAttributes {
  open?: boolean | undefined;
  name?: string | undefined;
}

interface DelHTMLAttributes extends HTMLAttributes {
  cite?: string | undefined;
  dateTime?: string | undefined;
}

interface DialogHTMLAttributes extends HTMLAttributes {
  closedby?: 'any' | 'closerequest' | 'none' | undefined;
  open?: boolean | undefined;
}

interface EmbedHTMLAttributes extends HTMLAttributes {
  height?: number | string | undefined;
  src?: string | undefined;
  type?: string | undefined;
  width?: number | string | undefined;
}

interface FieldsetHTMLAttributes extends HTMLAttributes {
  disabled?: boolean | undefined;
  form?: string | undefined;
  name?: string | undefined;
}

interface FormHTMLAttributes extends HTMLAttributes {
  acceptCharset?: string | undefined;
  action?: string;
  autoComplete?: string | undefined;
  encType?: string | undefined;
  method?: string | undefined;
  name?: string | undefined;
  noValidate?: boolean | undefined;
  target?: string | undefined;
}

interface HtmlHTMLAttributes extends HTMLAttributes {
  manifest?: string | undefined;
}

interface IframeHTMLAttributes extends HTMLAttributes {
  allow?: string | undefined;
  allowFullScreen?: boolean | undefined;
  allowTransparency?: boolean | undefined;
  /** @deprecated */
  frameBorder?: number | string | undefined;
  height?: number | string | undefined;
  loading?: 'eager' | 'lazy' | undefined;
  /** @deprecated */
  marginHeight?: number | undefined;
  /** @deprecated */
  marginWidth?: number | undefined;
  name?: string | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  sandbox?: string | undefined;
  /** @deprecated */
  scrolling?: string | undefined;
  seamless?: boolean | undefined;
  src?: string | undefined;
  srcDoc?: string | undefined;
  width?: number | string | undefined;
}

interface ImgHTMLAttributes extends HTMLAttributes {
  alt?: string | undefined;
  crossOrigin?: CrossOrigin;
  decoding?: 'async' | 'auto' | 'sync' | undefined;
  fetchPriority?: 'high' | 'low' | 'auto';
  height?: number | string | undefined;
  loading?: 'eager' | 'lazy' | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  sizes?: string | undefined;
  src?: string;
  srcSet?: string | undefined;
  useMap?: string | undefined;
  width?: number | string | undefined;
}

interface InsHTMLAttributes extends HTMLAttributes {
  cite?: string | undefined;
  dateTime?: string | undefined;
}

type HTMLInputTypeAttribute =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'
  | (string & {});

type AutoFillAddressKind = 'billing' | 'shipping';
type AutoFillBase = '' | 'off' | 'on';
type AutoFillContactField =
  | 'email'
  | 'tel'
  | 'tel-area-code'
  | 'tel-country-code'
  | 'tel-extension'
  | 'tel-local'
  | 'tel-local-prefix'
  | 'tel-local-suffix'
  | 'tel-national';
type AutoFillContactKind = 'home' | 'mobile' | 'work';
type AutoFillCredentialField = 'webauthn';
type AutoFillNormalField =
  | 'additional-name'
  | 'address-level1'
  | 'address-level2'
  | 'address-level3'
  | 'address-level4'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'cc-csc'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-family-name'
  | 'cc-given-name'
  | 'cc-name'
  | 'cc-number'
  | 'cc-type'
  | 'country'
  | 'country-name'
  | 'current-password'
  | 'family-name'
  | 'given-name'
  | 'honorific-prefix'
  | 'honorific-suffix'
  | 'name'
  | 'new-password'
  | 'one-time-code'
  | 'organization'
  | 'postal-code'
  | 'street-address'
  | 'transaction-amount'
  | 'transaction-currency'
  | 'username';
type OptionalPrefixToken<T extends string> = `${T} ` | '';
type OptionalPostfixToken<T extends string> = ` ${T}` | '';
type AutoFillField =
  | AutoFillNormalField
  | `${OptionalPrefixToken<AutoFillContactKind>}${AutoFillContactField}`;
type AutoFillSection = `section-${string}`;
type AutoFill =
  | AutoFillBase
  | `${OptionalPrefixToken<AutoFillSection>}${OptionalPrefixToken<AutoFillAddressKind>}${AutoFillField}${OptionalPostfixToken<AutoFillCredentialField>}`;
type HTMLInputAutoCompleteAttribute = AutoFill | (string & {});

interface InputHTMLAttributes extends HTMLAttributes {
  accept?: string | undefined;
  alt?: string | undefined;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
  capture?: boolean | 'user' | 'environment' | undefined;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  formAction?: string;
  formEncType?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  height?: number | string | undefined;
  list?: string | undefined;
  max?: number | string | undefined;
  maxLength?: number | undefined;
  min?: number | string | undefined;
  minLength?: number | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  pattern?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  src?: string | undefined;
  step?: number | string | undefined;
  type?: HTMLInputTypeAttribute | undefined;
  value?: string | readonly string[] | number | undefined;
  width?: number | string | undefined;
}

interface KeygenHTMLAttributes extends HTMLAttributes {
  challenge?: string | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  keyType?: string | undefined;
  keyParams?: string | undefined;
  name?: string | undefined;
}

interface LabelHTMLAttributes extends HTMLAttributes {
  form?: string | undefined;
  htmlFor?: string | undefined;
}

interface LiHTMLAttributes extends HTMLAttributes {
  value?: string | readonly string[] | number | undefined;
}

interface LinkHTMLAttributes extends HTMLAttributes {
  as?: string | undefined;
  blocking?: 'render' | (string & {}) | undefined;
  crossOrigin?: CrossOrigin;
  fetchPriority?: 'high' | 'low' | 'auto';
  href?: string | undefined;
  hrefLang?: string | undefined;
  integrity?: string | undefined;
  media?: string | undefined;
  imageSrcSet?: string | undefined;
  imageSizes?: string | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  sizes?: string | undefined;
  type?: string | undefined;
  charSet?: string | undefined;
  precedence?: string | undefined;
}

interface MapHTMLAttributes extends HTMLAttributes {
  name?: string | undefined;
}

interface MenuHTMLAttributes extends HTMLAttributes {
  type?: string | undefined;
}

interface MediaHTMLAttributes extends HTMLAttributes {
  autoPlay?: boolean | undefined;
  controls?: boolean | undefined;
  controlsList?: string | undefined;
  crossOrigin?: CrossOrigin;
  loop?: boolean | undefined;
  mediaGroup?: string | undefined;
  muted?: boolean | undefined;
  playsInline?: boolean | undefined;
  preload?: string | undefined;
  src?: string;
}

interface MetaHTMLAttributes extends HTMLAttributes {
  charSet?: string | undefined;
  content?: string | undefined;
  httpEquiv?: string | undefined;
  media?: string | undefined;
  name?: string | undefined;
}

interface MeterHTMLAttributes extends HTMLAttributes {
  form?: string | undefined;
  high?: number | undefined;
  low?: number | undefined;
  max?: number | string | undefined;
  min?: number | string | undefined;
  optimum?: number | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface QuoteHTMLAttributes extends HTMLAttributes {
  cite?: string | undefined;
}

interface ObjectHTMLAttributes extends HTMLAttributes {
  classID?: string | undefined;
  data?: string | undefined;
  form?: string | undefined;
  height?: number | string | undefined;
  name?: string | undefined;
  type?: string | undefined;
  useMap?: string | undefined;
  width?: number | string | undefined;
  wmode?: string | undefined;
}

interface OlHTMLAttributes extends HTMLAttributes {
  reversed?: boolean | undefined;
  start?: number | undefined;
  type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined;
}

interface OptgroupHTMLAttributes extends HTMLAttributes {
  disabled?: boolean | undefined;
  label?: string | undefined;
}

interface OptionHTMLAttributes extends HTMLAttributes {
  disabled?: boolean | undefined;
  label?: string | undefined;
  selected?: boolean | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface OutputHTMLAttributes extends HTMLAttributes {
  form?: string | undefined;
  htmlFor?: string | undefined;
  name?: string | undefined;
}

interface ParamHTMLAttributes extends HTMLAttributes {
  name?: string | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface ProgressHTMLAttributes extends HTMLAttributes {
  max?: number | string | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface SlotHTMLAttributes extends HTMLAttributes {
  name?: string | undefined;
}

interface ScriptHTMLAttributes extends HTMLAttributes {
  async?: boolean | undefined;
  blocking?: 'render' | (string & {}) | undefined;
  /** @deprecated */
  charSet?: string | undefined;
  crossOrigin?: CrossOrigin;
  defer?: boolean | undefined;
  fetchPriority?: 'high' | 'low' | 'auto' | undefined;
  integrity?: string | undefined;
  noModule?: boolean | undefined;
  referrerPolicy?: HTMLAttributeReferrerPolicy | undefined;
  src?: string | undefined;
  type?: string | undefined;
}

interface SelectHTMLAttributes extends HTMLAttributes {
  autoComplete?: string | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  multiple?: boolean | undefined;
  name?: string | undefined;
  required?: boolean | undefined;
  size?: number | undefined;
  value?: string | readonly string[] | number | undefined;
}

interface SourceHTMLAttributes extends HTMLAttributes {
  height?: number | string | undefined;
  media?: string | undefined;
  sizes?: string | undefined;
  src?: string | undefined;
  srcSet?: string | undefined;
  type?: string | undefined;
  width?: number | string | undefined;
}

interface StyleHTMLAttributes extends HTMLAttributes {
  blocking?: 'render' | (string & {}) | undefined;
  media?: string | undefined;
  scoped?: boolean | undefined;
  type?: string | undefined;
  href?: string | undefined;
  precedence?: string | undefined;
}

interface TableHTMLAttributes extends HTMLAttributes {
  align?: 'left' | 'center' | 'right' | undefined;
  bgcolor?: string | undefined;
  border?: number | undefined;
  cellPadding?: number | string | undefined;
  cellSpacing?: number | string | undefined;
  frame?: boolean | undefined;
  rules?: 'none' | 'groups' | 'rows' | 'columns' | 'all' | undefined;
  summary?: string | undefined;
  width?: number | string | undefined;
}

interface TextareaHTMLAttributes extends HTMLAttributes {
  autoComplete?: string | undefined;
  cols?: number | undefined;
  dirName?: string | undefined;
  disabled?: boolean | undefined;
  form?: string | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  name?: string | undefined;
  placeholder?: string | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  rows?: number | undefined;
  value?: string | readonly string[] | number | undefined;
  wrap?: string | undefined;
}

interface TdHTMLAttributes extends HTMLAttributes {
  align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
  colSpan?: number | undefined;
  headers?: string | undefined;
  rowSpan?: number | undefined;
  scope?: string | undefined;
  abbr?: string | undefined;
  height?: number | string | undefined;
  width?: number | string | undefined;
  valign?: 'top' | 'middle' | 'bottom' | 'baseline' | undefined;
}

interface ThHTMLAttributes extends HTMLAttributes {
  align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined;
  colSpan?: number | undefined;
  headers?: string | undefined;
  rowSpan?: number | undefined;
  scope?: string | undefined;
  abbr?: string | undefined;
}

interface TimeHTMLAttributes extends HTMLAttributes {
  dateTime?: string | undefined;
}

interface TrackHTMLAttributes extends HTMLAttributes {
  default?: boolean | undefined;
  kind?: string | undefined;
  label?: string | undefined;
  src?: string | undefined;
  srcLang?: string | undefined;
}

interface VideoHTMLAttributes extends MediaHTMLAttributes {
  height?: number | string | undefined;
  playsInline?: boolean | undefined;
  poster?: string | undefined;
  width?: number | string | undefined;
  disablePictureInPicture?: boolean | undefined;
  disableRemotePlayback?: boolean | undefined;
}

interface WebViewHTMLAttributes extends HTMLAttributes {
  allowFullScreen?: boolean | undefined;
  allowpopups?: boolean | undefined;
  autosize?: boolean | undefined;
  blinkfeatures?: string | undefined;
  disableblinkfeatures?: string | undefined;
  disableguestresize?: boolean | undefined;
  disablewebsecurity?: boolean | undefined;
  guestinstance?: string | undefined;
  httpreferrer?: string | undefined;
  nodeintegration?: boolean | undefined;
  partition?: string | undefined;
  plugins?: boolean | undefined;
  preload?: string | undefined;
  src?: string | undefined;
  useragent?: string | undefined;
  webpreferences?: string | undefined;
}

interface SVGAttributes<T = SVGElement> extends AriaAttributes {
  suppressHydrationWarning?: boolean | undefined;

  // Attributes which also defined in HTMLAttributes
  className?: string | undefined;
  color?: string | undefined;
  height?: number | string | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  max?: number | string | undefined;
  media?: string | undefined;
  method?: string | undefined;
  min?: number | string | undefined;
  name?: string | undefined;
  nonce?: string | undefined;
  part?: string | undefined;
  slot?: string | undefined;
  style?: CSSProperties | undefined;
  target?: string | undefined;
  type?: string | undefined;
  width?: number | string | undefined;

  // Other HTML properties supported by SVG elements in browsers
  role?: AriaRole | undefined;
  tabIndex?: number | undefined;
  crossOrigin?: CrossOrigin;

  // SVG Specific attributes
  accentHeight?: number | string | undefined;
  accumulate?: 'none' | 'sum' | undefined;
  additive?: 'replace' | 'sum' | undefined;
  alignmentBaseline?:
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit'
    | undefined;
  allowReorder?: 'no' | 'yes' | undefined;
  alphabetic?: number | string | undefined;
  amplitude?: number | string | undefined;
  arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined;
  ascent?: number | string | undefined;
  attributeName?: string | undefined;
  attributeType?: string | undefined;
  autoReverse?: Booleanish | undefined;
  azimuth?: number | string | undefined;
  baseFrequency?: number | string | undefined;
  baselineShift?: number | string | undefined;
  baseProfile?: number | string | undefined;
  bbox?: number | string | undefined;
  begin?: number | string | undefined;
  bias?: number | string | undefined;
  by?: number | string | undefined;
  calcMode?: number | string | undefined;
  capHeight?: number | string | undefined;
  clip?: number | string | undefined;
  clipPath?: string | undefined;
  clipPathUnits?: number | string | undefined;
  clipRule?: number | string | undefined;
  colorInterpolation?: number | string | undefined;
  colorInterpolationFilters?:
    | 'auto'
    | 'sRGB'
    | 'linearRGB'
    | 'inherit'
    | undefined;
  colorProfile?: number | string | undefined;
  colorRendering?: number | string | undefined;
  contentScriptType?: number | string | undefined;
  contentStyleType?: number | string | undefined;
  cursor?: number | string | undefined;
  cx?: number | string | undefined;
  cy?: number | string | undefined;
  d?: string | undefined;
  decelerate?: number | string | undefined;
  descent?: number | string | undefined;
  diffuseConstant?: number | string | undefined;
  direction?: number | string | undefined;
  display?: number | string | undefined;
  divisor?: number | string | undefined;
  dominantBaseline?:
    | 'auto'
    | 'use-script'
    | 'no-change'
    | 'reset-size'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'central'
    | 'middle'
    | 'text-after-edge'
    | 'text-before-edge'
    | 'inherit'
    | undefined;
  dur?: number | string | undefined;
  dx?: number | string | undefined;
  dy?: number | string | undefined;
  edgeMode?: number | string | undefined;
  elevation?: number | string | undefined;
  enableBackground?: number | string | undefined;
  end?: number | string | undefined;
  exponent?: number | string | undefined;
  externalResourcesRequired?: Booleanish | undefined;
  fill?: string | undefined;
  fillOpacity?: number | string | undefined;
  fillRule?: 'nonzero' | 'evenodd' | 'inherit' | undefined;
  filter?: string | undefined;
  filterRes?: number | string | undefined;
  filterUnits?: number | string | undefined;
  floodColor?: number | string | undefined;
  floodOpacity?: number | string | undefined;
  focusable?: Booleanish | 'auto' | undefined;
  fontFamily?: string | undefined;
  fontSize?: number | string | undefined;
  fontSizeAdjust?: number | string | undefined;
  fontStretch?: number | string | undefined;
  fontStyle?: number | string | undefined;
  fontVariant?: number | string | undefined;
  fontWeight?: number | string | undefined;
  format?: number | string | undefined;
  fr?: number | string | undefined;
  from?: number | string | undefined;
  fx?: number | string | undefined;
  fy?: number | string | undefined;
  g1?: number | string | undefined;
  g2?: number | string | undefined;
  glyphName?: number | string | undefined;
  glyphOrientationHorizontal?: number | string | undefined;
  glyphOrientationVertical?: number | string | undefined;
  glyphRef?: number | string | undefined;
  gradientTransform?: string | undefined;
  gradientUnits?: string | undefined;
  hanging?: number | string | undefined;
  horizAdvX?: number | string | undefined;
  horizOriginX?: number | string | undefined;
  href?: string | undefined;
  ideographic?: number | string | undefined;
  imageRendering?: number | string | undefined;
  in2?: number | string | undefined;
  in?: string | undefined;
  intercept?: number | string | undefined;
  k1?: number | string | undefined;
  k2?: number | string | undefined;
  k3?: number | string | undefined;
  k4?: number | string | undefined;
  k?: number | string | undefined;
  kernelMatrix?: number | string | undefined;
  kernelUnitLength?: number | string | undefined;
  kerning?: number | string | undefined;
  keyPoints?: number | string | undefined;
  keySplines?: number | string | undefined;
  keyTimes?: number | string | undefined;
  lengthAdjust?: number | string | undefined;
  letterSpacing?: number | string | undefined;
  lightingColor?: number | string | undefined;
  limitingConeAngle?: number | string | undefined;
  local?: number | string | undefined;
  markerEnd?: string | undefined;
  markerHeight?: number | string | undefined;
  markerMid?: string | undefined;
  markerStart?: string | undefined;
  markerUnits?: number | string | undefined;
  markerWidth?: number | string | undefined;
  mask?: string | undefined;
  maskContentUnits?: number | string | undefined;
  maskUnits?: number | string | undefined;
  mathematical?: number | string | undefined;
  mode?: number | string | undefined;
  numOctaves?: number | string | undefined;
  offset?: number | string | undefined;
  opacity?: number | string | undefined;
  operator?: number | string | undefined;
  order?: number | string | undefined;
  orient?: number | string | undefined;
  orientation?: number | string | undefined;
  origin?: number | string | undefined;
  overflow?: number | string | undefined;
  overlinePosition?: number | string | undefined;
  overlineThickness?: number | string | undefined;
  paintOrder?: number | string | undefined;
  panose1?: number | string | undefined;
  path?: string | undefined;
  pathLength?: number | string | undefined;
  patternContentUnits?: string | undefined;
  patternTransform?: number | string | undefined;
  patternUnits?: string | undefined;
  pointerEvents?: number | string | undefined;
  points?: string | undefined;
  pointsAtX?: number | string | undefined;
  pointsAtY?: number | string | undefined;
  pointsAtZ?: number | string | undefined;
  preserveAlpha?: Booleanish | undefined;
  preserveAspectRatio?: string | undefined;
  primitiveUnits?: number | string | undefined;
  r?: number | string | undefined;
  radius?: number | string | undefined;
  refX?: number | string | undefined;
  refY?: number | string | undefined;
  renderingIntent?: number | string | undefined;
  repeatCount?: number | string | undefined;
  repeatDur?: number | string | undefined;
  requiredExtensions?: number | string | undefined;
  requiredFeatures?: number | string | undefined;
  restart?: number | string | undefined;
  result?: string | undefined;
  rotate?: number | string | undefined;
  rx?: number | string | undefined;
  ry?: number | string | undefined;
  scale?: number | string | undefined;
  seed?: number | string | undefined;
  shapeRendering?: number | string | undefined;
  slope?: number | string | undefined;
  spacing?: number | string | undefined;
  specularConstant?: number | string | undefined;
  specularExponent?: number | string | undefined;
  speed?: number | string | undefined;
  spreadMethod?: string | undefined;
  startOffset?: number | string | undefined;
  stdDeviation?: number | string | undefined;
  stemh?: number | string | undefined;
  stemv?: number | string | undefined;
  stitchTiles?: number | string | undefined;
  stopColor?: string | undefined;
  stopOpacity?: number | string | undefined;
  strikethroughPosition?: number | string | undefined;
  strikethroughThickness?: number | string | undefined;
  string?: number | string | undefined;
  stroke?: string | undefined;
  strokeDasharray?: string | number | undefined;
  strokeDashoffset?: string | number | undefined;
  strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' | undefined;
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined;
  strokeMiterlimit?: number | string | undefined;
  strokeOpacity?: number | string | undefined;
  strokeWidth?: number | string | undefined;
  surfaceScale?: number | string | undefined;
  systemLanguage?: number | string | undefined;
  tableValues?: number | string | undefined;
  targetX?: number | string | undefined;
  targetY?: number | string | undefined;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit' | undefined;
  textDecoration?: number | string | undefined;
  textLength?: number | string | undefined;
  textRendering?: number | string | undefined;
  to?: number | string | undefined;
  transform?: string | undefined;
  u1?: number | string | undefined;
  u2?: number | string | undefined;
  underlinePosition?: number | string | undefined;
  underlineThickness?: number | string | undefined;
  unicode?: number | string | undefined;
  unicodeBidi?: number | string | undefined;
  unicodeRange?: number | string | undefined;
  unitsPerEm?: number | string | undefined;
  vAlphabetic?: number | string | undefined;
  values?: string | undefined;
  vectorEffect?: number | string | undefined;
  version?: string | undefined;
  vertAdvY?: number | string | undefined;
  vertOriginX?: number | string | undefined;
  vertOriginY?: number | string | undefined;
  vHanging?: number | string | undefined;
  vIdeographic?: number | string | undefined;
  viewBox?: string | undefined;
  viewTarget?: number | string | undefined;
  visibility?: number | string | undefined;
  vMathematical?: number | string | undefined;
  widths?: number | string | undefined;
  wordSpacing?: number | string | undefined;
  writingMode?: number | string | undefined;
  x1?: number | string | undefined;
  x2?: number | string | undefined;
  x?: number | string | undefined;
  xChannelSelector?: string | undefined;
  xHeight?: number | string | undefined;
  xlinkActuate?: string | undefined;
  xlinkArcrole?: string | undefined;
  xlinkHref?: string | undefined;
  xlinkRole?: string | undefined;
  xlinkShow?: string | undefined;
  xlinkTitle?: string | undefined;
  xlinkType?: string | undefined;
  xmlBase?: string | undefined;
  xmlLang?: string | undefined;
  xmlns?: string | undefined;
  xmlnsXlink?: string | undefined;
  xmlSpace?: string | undefined;
  y1?: number | string | undefined;
  y2?: number | string | undefined;
  y?: number | string | undefined;
  yChannelSelector?: string | undefined;
  z?: number | string | undefined;
  zoomAndPan?: string | undefined;
}

type HTMLElementTags =
  | 'a'
  | 'abbr'
  | 'address'
  | 'area'
  | 'article'
  | 'aside'
  | 'audio'
  | 'b'
  | 'base'
  | 'bdi'
  | 'bdo'
  | 'big'
  | 'blockquote'
  | 'body'
  | 'br'
  | 'button'
  | 'canvas'
  | 'caption'
  | 'center'
  | 'cite'
  | 'code'
  | 'col'
  | 'colgroup'
  | 'data'
  | 'datalist'
  | 'dd'
  | 'del'
  | 'details'
  | 'dfn'
  | 'dialog'
  | 'div'
  | 'dl'
  | 'dt'
  | 'em'
  | 'embed'
  | 'fieldset'
  | 'figcaption'
  | 'figure'
  | 'footer'
  | 'form'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'head'
  | 'header'
  | 'hgroup'
  | 'hr'
  | 'html'
  | 'i'
  | 'iframe'
  | 'img'
  | 'input'
  | 'ins'
  | 'kbd'
  | 'keygen'
  | 'label'
  | 'legend'
  | 'li'
  | 'link'
  | 'main'
  | 'map'
  | 'mark'
  | 'menu'
  | 'menuitem'
  | 'meta'
  | 'meter'
  | 'nav'
  | 'noscript'
  | 'object'
  | 'ol'
  | 'optgroup'
  | 'option'
  | 'output'
  | 'p'
  | 'param'
  | 'picture'
  | 'pre'
  | 'progress'
  | 'q'
  | 'rp'
  | 'rt'
  | 'ruby'
  | 's'
  | 'samp'
  | 'search'
  | 'slot'
  | 'script'
  | 'section'
  | 'select'
  | 'small'
  | 'source'
  | 'span'
  | 'strong'
  | 'style'
  | 'sub'
  | 'summary'
  | 'sup'
  | 'table'
  | 'template'
  | 'tbody'
  | 'td'
  | 'textarea'
  | 'tfoot'
  | 'th'
  | 'thead'
  | 'time'
  | 'title'
  | 'tr'
  | 'track'
  | 'u'
  | 'ul'
  | 'var'
  | 'video'
  | 'wbr'
  | 'webview';

type SVGElementTags =
  | 'animate'
  | 'animateMotion'
  | 'animateTransform'
  | 'circle'
  | 'clipPath'
  | 'defs'
  | 'desc'
  | 'ellipse'
  | 'feBlend'
  | 'feColorMatrix'
  | 'feComponentTransfer'
  | 'feComposite'
  | 'feConvolveMatrix'
  | 'feDiffuseLighting'
  | 'feDisplacementMap'
  | 'feDistantLight'
  | 'feDropShadow'
  | 'feFlood'
  | 'feFuncA'
  | 'feFuncB'
  | 'feFuncG'
  | 'feFuncR'
  | 'feGaussianBlur'
  | 'feImage'
  | 'feMerge'
  | 'feMergeNode'
  | 'feMorphology'
  | 'feOffset'
  | 'fePointLight'
  | 'feSpecularLighting'
  | 'feSpotLight'
  | 'feTile'
  | 'feTurbulence'
  | 'filter'
  | 'foreignObject'
  | 'g'
  | 'image'
  | 'line'
  | 'linearGradient'
  | 'marker'
  | 'mask'
  | 'metadata'
  | 'mpath'
  | 'path'
  | 'pattern'
  | 'polygon'
  | 'polyline'
  | 'radialGradient'
  | 'rect'
  | 'set'
  | 'stop'
  | 'svg'
  | 'switch'
  | 'symbol'
  | 'text'
  | 'textPath'
  | 'tspan'
  | 'use'
  | 'view';

export interface HTMLElementAttributeMap {
  // HTML
  a: AnchorHTMLAttributes;
  abbr: HTMLAttributes;
  address: HTMLAttributes;
  area: AreaHTMLAttributes;
  article: HTMLAttributes;
  aside: HTMLAttributes;
  audio: AudioHTMLAttributes;
  b: HTMLAttributes;
  base: BaseHTMLAttributes;
  bdi: HTMLAttributes;
  bdo: HTMLAttributes;
  big: HTMLAttributes;
  blockquote: BlockquoteHTMLAttributes;
  body: HTMLAttributes;
  br: HTMLAttributes;
  button: ButtonHTMLAttributes;
  canvas: CanvasHTMLAttributes;
  caption: HTMLAttributes;
  center: HTMLAttributes;
  cite: HTMLAttributes;
  code: HTMLAttributes;
  col: ColHTMLAttributes;
  colgroup: ColgroupHTMLAttributes;
  data: DataHTMLAttributes;
  datalist: HTMLAttributes;
  dd: HTMLAttributes;
  del: DelHTMLAttributes;
  details: DetailsHTMLAttributes;
  dfn: HTMLAttributes;
  dialog: DialogHTMLAttributes;
  div: HTMLAttributes;
  dl: HTMLAttributes;
  dt: HTMLAttributes;
  em: HTMLAttributes;
  embed: EmbedHTMLAttributes;
  fieldset: FieldsetHTMLAttributes;
  figcaption: HTMLAttributes;
  figure: HTMLAttributes;
  footer: HTMLAttributes;
  form: FormHTMLAttributes;
  h1: HTMLAttributes;
  h2: HTMLAttributes;
  h3: HTMLAttributes;
  h4: HTMLAttributes;
  h5: HTMLAttributes;
  h6: HTMLAttributes;
  head: HTMLAttributes;
  header: HTMLAttributes;
  hgroup: HTMLAttributes;
  hr: HTMLAttributes;
  html: HtmlHTMLAttributes;
  i: HTMLAttributes;
  iframe: IframeHTMLAttributes;
  img: ImgHTMLAttributes;
  input: InputHTMLAttributes;
  ins: InsHTMLAttributes;
  kbd: HTMLAttributes;
  keygen: KeygenHTMLAttributes;
  label: LabelHTMLAttributes;
  legend: HTMLAttributes;
  li: LiHTMLAttributes;
  link: LinkHTMLAttributes;
  main: HTMLAttributes;
  map: MapHTMLAttributes;
  mark: HTMLAttributes;
  menu: MenuHTMLAttributes;
  menuitem: HTMLAttributes;
  meta: MetaHTMLAttributes;
  meter: MeterHTMLAttributes;
  nav: HTMLAttributes;
  noscript: HTMLAttributes;
  object: ObjectHTMLAttributes;
  ol: OlHTMLAttributes;
  optgroup: OptgroupHTMLAttributes;
  option: OptionHTMLAttributes;
  output: OutputHTMLAttributes;
  p: HTMLAttributes;
  param: ParamHTMLAttributes;
  picture: HTMLAttributes;
  pre: HTMLAttributes;
  progress: ProgressHTMLAttributes;
  q: QuoteHTMLAttributes;
  rp: HTMLAttributes;
  rt: HTMLAttributes;
  ruby: HTMLAttributes;
  s: HTMLAttributes;
  samp: HTMLAttributes;
  search: HTMLAttributes;
  script: ScriptHTMLAttributes;
  section: HTMLAttributes;
  select: SelectHTMLAttributes;
  slot: SlotHTMLAttributes;
  small: HTMLAttributes;
  source: SourceHTMLAttributes;
  span: HTMLAttributes;
  strong: HTMLAttributes;
  style: StyleHTMLAttributes;
  sub: HTMLAttributes;
  summary: HTMLAttributes;
  sup: HTMLAttributes;
  table: TableHTMLAttributes;
  template: HTMLAttributes;
  tbody: HTMLAttributes;
  td: TdHTMLAttributes;
  textarea: TextareaHTMLAttributes;
  tfoot: HTMLAttributes;
  th: ThHTMLAttributes;
  thead: HTMLAttributes;
  time: TimeHTMLAttributes;
  title: HTMLAttributes;
  tr: HTMLAttributes;
  track: TrackHTMLAttributes;
  u: HTMLAttributes;
  ul: HTMLAttributes;
  var: HTMLAttributes;
  video: VideoHTMLAttributes;
  wbr: HTMLAttributes;
  webview: WebViewHTMLAttributes;

  // SVG
  svg: SVGAttributes;
  animate: SVGAttributes;
  animateMotion: SVGAttributes;
  animateTransform: SVGAttributes;
  circle: SVGAttributes;
  clipPath: SVGAttributes;
  defs: SVGAttributes;
  desc: SVGAttributes;
  ellipse: SVGAttributes;
  feBlend: SVGAttributes;
  feColorMatrix: SVGAttributes;
  feComponentTransfer: SVGAttributes;
  feComposite: SVGAttributes;
  feConvolveMatrix: SVGAttributes;
  feDiffuseLighting: SVGAttributes;
  feDisplacementMap: SVGAttributes;
  feDistantLight: SVGAttributes;
  feDropShadow: SVGAttributes;
  feFlood: SVGAttributes;
  feFuncA: SVGAttributes;
  feFuncB: SVGAttributes;
  feFuncG: SVGAttributes;
  feFuncR: SVGAttributes;
  feGaussianBlur: SVGAttributes;
  feImage: SVGAttributes;
  feMerge: SVGAttributes;
  feMergeNode: SVGAttributes;
  feMorphology: SVGAttributes;
  feOffset: SVGAttributes;
  fePointLight: SVGAttributes;
  feSpecularLighting: SVGAttributes;
  feSpotLight: SVGAttributes;
  feTile: SVGAttributes;
  feTurbulence: SVGAttributes;
  filter: SVGAttributes;
  foreignObject: SVGAttributes;
  g: SVGAttributes;
  image: SVGAttributes;
  line: SVGAttributes;
  linearGradient: SVGAttributes;
  marker: SVGAttributes;
  mask: SVGAttributes;
  metadata: SVGAttributes;
  mpath: SVGAttributes;
  path: SVGAttributes;
  pattern: SVGAttributes;
  polygon: SVGAttributes;
  polyline: SVGAttributes;
  radialGradient: SVGAttributes;
  rect: SVGAttributes;
  set: SVGAttributes;
  stop: SVGAttributes;
  switch: SVGAttributes;
  symbol: SVGAttributes;
  text: SVGAttributes;
  textPath: SVGAttributes;
  tspan: SVGAttributes;
  use: SVGAttributes;
  view: SVGAttributes;
}

// Mapa de instância do elemento DOM → interface de atributos
export interface HTMLElementToAttributesMap {
  HTMLAnchorElement: AnchorHTMLAttributes;
  HTMLAreaElement: AreaHTMLAttributes;
  HTMLAudioElement: AudioHTMLAttributes;
  HTMLBaseElement: BaseHTMLAttributes;
  HTMLBodyElement: HTMLAttributes;
  HTMLBRElement: HTMLAttributes;
  HTMLButtonElement: ButtonHTMLAttributes;
  HTMLCanvasElement: CanvasHTMLAttributes;
  HTMLDataElement: DataHTMLAttributes;
  HTMLDataListElement: HTMLAttributes;
  HTMLDetailsElement: DetailsHTMLAttributes;
  HTMLDialogElement: DialogHTMLAttributes;
  HTMLDivElement: HTMLAttributes;
  HTMLDListElement: HTMLAttributes;
  HTMLEmbedElement: EmbedHTMLAttributes;
  HTMLFieldSetElement: FieldsetHTMLAttributes;
  HTMLFormElement: FormHTMLAttributes;
  HTMLHeadElement: HTMLAttributes;
  HTMLHeadingElement: HTMLAttributes;
  HTMLHRElement: HTMLAttributes;
  HTMLHtmlElement: HtmlHTMLAttributes;
  HTMLIFrameElement: IframeHTMLAttributes;
  HTMLImageElement: ImgHTMLAttributes;
  HTMLInputElement: InputHTMLAttributes;
  HTMLLabelElement: LabelHTMLAttributes;
  HTMLLegendElement: HTMLAttributes;
  HTMLLIElement: LiHTMLAttributes;
  HTMLLinkElement: LinkHTMLAttributes;
  HTMLMapElement: MapHTMLAttributes;
  HTMLMediaElement: MediaHTMLAttributes;
  HTMLMenuElement: HTMLAttributes;
  HTMLMetaElement: MetaHTMLAttributes;
  HTMLMeterElement: MeterHTMLAttributes;
  HTMLModElement: DelHTMLAttributes;
  HTMLObjectElement: ObjectHTMLAttributes;
  HTMLOListElement: OlHTMLAttributes;
  HTMLOptGroupElement: OptgroupHTMLAttributes;
  HTMLOptionElement: OptionHTMLAttributes;
  HTMLOutputElement: OutputHTMLAttributes;
  HTMLParagraphElement: HTMLAttributes;
  HTMLParamElement: ParamHTMLAttributes;
  HTMLPreElement: HTMLAttributes;
  HTMLProgressElement: ProgressHTMLAttributes;
  HTMLQuoteElement: QuoteHTMLAttributes;
  HTMLScriptElement: ScriptHTMLAttributes;
  HTMLSelectElement: SelectHTMLAttributes;
  HTMLSlotElement: SlotHTMLAttributes;
  HTMLSourceElement: SourceHTMLAttributes;
  HTMLSpanElement: HTMLAttributes;
  HTMLStyleElement: StyleHTMLAttributes;
  HTMLTableCaptionElement: HTMLAttributes;
  HTMLTableCellElement: TdHTMLAttributes;
  HTMLTableColElement: ColHTMLAttributes;
  HTMLTableElement: TableHTMLAttributes;
  HTMLTableRowElement: HTMLAttributes;
  HTMLTableSectionElement: HTMLAttributes;
  HTMLTemplateElement: HTMLAttributes;
  HTMLTextAreaElement: TextareaHTMLAttributes;
  HTMLTimeElement: TimeHTMLAttributes;
  HTMLTitleElement: HTMLAttributes;
  HTMLTrackElement: TrackHTMLAttributes;
  HTMLUListElement: HTMLAttributes;
  HTMLVideoElement: VideoHTMLAttributes;
  HTMLElement: HTMLAttributes;
  Element: HTMLAttributes;
  SVGElement: SVGAttributes;
}

export interface HTMLElementInstanceMap {
  HTMLAnchorElement: HTMLAnchorElement;
  HTMLAreaElement: HTMLAreaElement;
  HTMLAudioElement: HTMLAudioElement;
  HTMLBaseElement: HTMLBaseElement;
  HTMLBodyElement: HTMLBodyElement;
  HTMLBRElement: HTMLBRElement;
  HTMLButtonElement: HTMLButtonElement;
  HTMLCanvasElement: HTMLCanvasElement;
  HTMLDataElement: HTMLDataElement;
  HTMLDataListElement: HTMLDataListElement;
  HTMLDetailsElement: HTMLDetailsElement;
  HTMLDialogElement: HTMLDialogElement;
  HTMLDivElement: HTMLDivElement;
  HTMLDListElement: HTMLDListElement;
  HTMLEmbedElement: HTMLEmbedElement;
  HTMLFieldSetElement: HTMLFieldSetElement;
  HTMLFormElement: HTMLFormElement;
  HTMLHeadElement: HTMLHeadElement;
  HTMLHeadingElement: HTMLHeadingElement;
  HTMLHRElement: HTMLHRElement;
  HTMLHtmlElement: HTMLHtmlElement;
  HTMLIFrameElement: HTMLIFrameElement;
  HTMLImageElement: HTMLImageElement;
  HTMLInputElement: HTMLInputElement;
  HTMLLabelElement: HTMLLabelElement;
  HTMLLegendElement: HTMLLegendElement;
  HTMLLIElement: HTMLLIElement;
  HTMLLinkElement: HTMLLinkElement;
  HTMLMapElement: HTMLMapElement;
  HTMLMediaElement: HTMLMediaElement;
  HTMLMenuElement: HTMLMenuElement;
  HTMLMetaElement: HTMLMetaElement;
  HTMLMeterElement: HTMLMeterElement;
  HTMLModElement: HTMLModElement;
  HTMLObjectElement: HTMLObjectElement;
  HTMLOListElement: HTMLOListElement;
  HTMLOptGroupElement: HTMLOptGroupElement;
  HTMLOptionElement: HTMLOptionElement;
  HTMLOutputElement: HTMLOutputElement;
  HTMLParagraphElement: HTMLParagraphElement;
  HTMLParamElement: HTMLParamElement;
  HTMLPreElement: HTMLPreElement;
  HTMLProgressElement: HTMLProgressElement;
  HTMLQuoteElement: HTMLQuoteElement;
  HTMLScriptElement: HTMLScriptElement;
  HTMLSelectElement: HTMLSelectElement;
  HTMLSlotElement: HTMLSlotElement;
  HTMLSourceElement: HTMLSourceElement;
  HTMLSpanElement: HTMLSpanElement;
  HTMLStyleElement: HTMLStyleElement;
  HTMLTableCaptionElement: HTMLTableCaptionElement;
  HTMLTableCellElement: HTMLTableCellElement;
  HTMLTableColElement: HTMLTableColElement;
  HTMLTableElement: HTMLTableElement;
  HTMLTableRowElement: HTMLTableRowElement;
  HTMLTableSectionElement: HTMLTableSectionElement;
  HTMLTemplateElement: HTMLTemplateElement;
  HTMLTextAreaElement: HTMLTextAreaElement;
  HTMLTimeElement: HTMLTimeElement;
  HTMLTitleElement: HTMLTitleElement;
  HTMLTrackElement: HTMLTrackElement;
  HTMLUListElement: HTMLUListElement;
  HTMLVideoElement: HTMLVideoElement;
  HTMLElement: HTMLElement;
  Element: Element;
  SVGElement: SVGElement;
}

export interface HTMLElementTagMap  {
  html: 'HTMLHtmlElement';
  head: 'HTMLHeadElement';
  body: 'HTMLBodyElement';
  title: 'HTMLTitleElement';
  base: 'HTMLBaseElement';
  meta: 'HTMLMetaElement';
  link: 'HTMLLinkElement';
  script: 'HTMLScriptElement';
  style: 'HTMLStyleElement';
  div: 'HTMLDivElement';
  header: 'HTMLElement';
  footer: 'HTMLElement';
  main: 'HTMLElement';
  section: 'HTMLElement';
  article: 'HTMLElement';
  aside: 'HTMLElement';
  nav: 'HTMLElement';

  h1: 'HTMLHeadingElement';
  h2: 'HTMLHeadingElement';
  h3: 'HTMLHeadingElement';
  h4: 'HTMLHeadingElement';
  h5: 'HTMLHeadingElement';
  h6: 'HTMLHeadingElement';

  p: 'HTMLParagraphElement';
  pre: 'HTMLPreElement';
  blockquote: 'HTMLQuoteElement';
  br: 'HTMLBRElement';
  hr: 'HTMLHRElement';

  a: 'HTMLAnchorElement';
  em: 'HTMLElement';
  strong: 'HTMLElement';
  small: 'HTMLElement';
  s: 'HTMLElement';
  cite: 'HTMLElement';
  q: 'HTMLQuoteElement';
  ins: 'HTMLModElement';
  del: 'HTMLModElement';
  dfn: 'HTMLElement';
  abbr: 'HTMLElement';
  data: 'HTMLDataElement';
  time: 'HTMLTimeElement';
  code: 'HTMLElement';
  var: 'HTMLElement';
  samp: 'HTMLElement';
  kbd: 'HTMLElement';
  sub: 'HTMLElement';
  sup: 'HTMLElement';
  i: 'HTMLElement';
  b: 'HTMLElement';
  u: 'HTMLElement';
  mark: 'HTMLElement';
  ruby: 'HTMLElement';
  rt: 'HTMLElement';
  rp: 'HTMLElement';
  bdi: 'HTMLElement';
  bdo: 'HTMLElement';
  span: 'HTMLSpanElement';

  img: 'HTMLImageElement';
  audio: 'HTMLAudioElement';
  video: 'HTMLVideoElement';
  source: 'HTMLSourceElement';
  track: 'HTMLTrackElement';
  canvas: 'HTMLCanvasElement';
  embed: 'HTMLEmbedElement';
  iframe: 'HTMLIFrameElement';
  object: 'HTMLObjectElement';
  param: 'HTMLParamElement';
  picture: 'HTMLElement';
  map: 'HTMLMapElement';
  area: 'HTMLAreaElement';

  ul: 'HTMLUListElement';
  ol: 'HTMLOListElement';
  li: 'HTMLLIElement';
  dl: 'HTMLDListElement';
  dt: 'HTMLElement';
  dd: 'HTMLElement';
  menu: 'HTMLMenuElement';
  menuitem: 'HTMLElement';

  table: 'HTMLTableElement';
  caption: 'HTMLTableCaptionElement';
  colgroup: 'HTMLTableColElement';
  col: 'HTMLTableColElement';
  tbody: 'HTMLTableSectionElement';
  thead: 'HTMLTableSectionElement';
  tfoot: 'HTMLTableSectionElement';
  tr: 'HTMLTableRowElement';
  td: 'HTMLTableCellElement';
  th: 'HTMLTableCellElement';

  form: 'HTMLFormElement';
  label: 'HTMLLabelElement';
  input: 'HTMLInputElement';
  button: 'HTMLButtonElement';
  select: 'HTMLSelectElement';
  datalist: 'HTMLDataListElement';
  optgroup: 'HTMLOptGroupElement';
  option: 'HTMLOptionElement';
  textarea: 'HTMLTextAreaElement';
  output: 'HTMLOutputElement';
  progress: 'HTMLProgressElement';
  meter: 'HTMLMeterElement';
  fieldset: 'HTMLFieldSetElement';
  legend: 'HTMLLegendElement';

  details: 'HTMLDetailsElement';
  summary: 'HTMLElement';
  dialog: 'HTMLDialogElement';

  noscript: 'HTMLElement';
  template: 'HTMLTemplateElement';
  slot: 'HTMLSlotElement';
};

// Utility type
export type HTMLAttributesOf<T extends keyof HTMLElementInstanceMap> =
  HTMLElementToAttributesMap[T];

