var x = Object.defineProperty;
var w = (i) => {
  throw TypeError(i);
};
var O = (i, t, e) => t in i ? x(i, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[t] = e;
var r = (i, t, e) => O(i, typeof t != "symbol" ? t + "" : t, e), b = (i, t, e) => t.has(i) || w("Cannot " + e);
var u = (i, t, e) => (b(i, t, "read from private field"), e ? e.call(i) : t.get(i)), p = (i, t, e) => t.has(i) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(i) : t.set(i, e), a = (i, t, e, s) => (b(i, t, "write to private field"), s ? s.call(i, e) : t.set(i, e), e);
function m(i, t) {
  return t <= 0 || i < 0 ? 0 : i >= t ? t - 1 : i;
}
var h, c;
const v = class v {
  constructor(t, e) {
    p(this, h);
    p(this, c);
    a(this, c, Math.max(0, t)), a(this, h, m(e, u(this, c)));
  }
  static of(t, e = 0) {
    return new v(t, e);
  }
  /** 1D: um eixo. Sem colunas — isso é FocusGrid. */
  static next(t) {
    const { index: e, count: s, step: n, loop: o = !1 } = t;
    if (s <= 0)
      return { overflow: n < 0 ? "before" : "after" };
    const l = e + n;
    return l < 0 ? o ? { index: (l % s + s) % s } : { overflow: "before" } : l >= s ? o ? { index: l % s } : { overflow: "after" } : { index: l };
  }
  get current() {
    return u(this, h);
  }
  get count() {
    return u(this, c);
  }
  resize(t) {
    return a(this, c, Math.max(0, t)), a(this, h, m(u(this, h), u(this, c))), this;
  }
  set(t) {
    return a(this, h, m(t, u(this, c))), this;
  }
  next(t, e = !1) {
    const s = v.next({
      index: u(this, h),
      count: u(this, c),
      step: t,
      loop: e
    });
    return "index" in s && a(this, h, s.index), s;
  }
};
h = new WeakMap(), c = new WeakMap();
let d = v;
function L(i, t) {
  return t === "vertical" ? i === "ArrowDown" ? 1 : i === "ArrowUp" ? -1 : null : i === "ArrowRight" ? 1 : i === "ArrowLeft" ? -1 : null;
}
class k {
  constructor(t, e) {
    r(this, "root");
    r(this, "target");
    r(this, "orientation");
    r(this, "loop");
    r(this, "initial");
    r(this, "onOverflow");
    r(this, "onMove");
    r(this, "roving", d.of(0));
    r(this, "active", !1);
    this.root = t, this.target = e.target ?? ":scope > *", this.orientation = e.orientation ?? "horizontal", this.loop = e.loop ?? !1, this.initial = e.initial, this.onOverflow = e.onOverflow, this.onMove = e.onMove, this.onKeyDown = this.onKeyDown.bind(this), this.onFocusOut = this.onFocusOut.bind(this), this.onFocusIn = this.onFocusIn.bind(this);
  }
  static of(t, e = {}) {
    return new k(t, e);
  }
  activate() {
    return this.active ? this : (this.active = !0, this.refresh(!0), this.root.addEventListener("keydown", this.onKeyDown), this.root.addEventListener("focusout", this.onFocusOut), this.root.addEventListener("focusin", this.onFocusIn), this);
  }
  deactivate() {
    return this.active ? (this.active = !1, this.root.removeEventListener("keydown", this.onKeyDown), this.root.removeEventListener("focusout", this.onFocusOut), this.root.removeEventListener("focusin", this.onFocusIn), this) : this;
  }
  /** Relê os itens (DOM pode ter mudado) e repinta o tabindex. */
  refresh(t = !1) {
    const e = this.items();
    this.roving.resize(e.length);
    const s = document.activeElement;
    if (s instanceof HTMLElement) {
      const n = e.indexOf(s);
      if (n >= 0)
        return this.roving.set(n), this.paint(), this;
    }
    return t && this.initial !== void 0 && this.roving.set(this.resolveInitial(e)), this.paint(), this;
  }
  items() {
    return this.target === ":scope > *" ? Array.from(this.root.children).filter(
      (t) => t instanceof HTMLElement
    ) : Array.from(
      this.root.querySelectorAll(this.target)
    );
  }
  resolveInitial(t) {
    const e = this.initial;
    if (typeof e == "number") return e;
    if (typeof e == "string" && !e.startsWith(":")) {
      const s = t.findIndex((n) => n.matches(e));
      if (s >= 0) return s;
    }
    return 0;
  }
  paint() {
    const t = this.items();
    t.length !== 0 && t.forEach((e, s) => {
      e.tabIndex = s === this.roving.current ? 0 : -1;
    });
  }
  moveTo(t) {
    var n;
    const s = this.items()[t];
    s && (this.roving.set(t), this.paint(), s.focus(), (n = this.onMove) == null || n.call(this, s));
  }
  onKeyDown(t) {
    var s;
    const e = L(t.key, this.orientation);
    if (e !== null) {
      t.preventDefault();
      const n = this.roving.next(e, this.loop);
      if ("overflow" in n) {
        (s = this.onOverflow) == null || s.call(this, n.overflow);
        return;
      }
      this.moveTo(n.index);
      return;
    }
    if (t.key === "Home" || t.key === "End") {
      t.preventDefault();
      const n = this.items(), o = t.key === "Home" ? 0 : n.length - 1;
      if (o === this.roving.current) return;
      this.moveTo(o);
    }
  }
  onFocusIn(t) {
    const e = t.target;
    if (!(e instanceof HTMLElement) || !this.root.contains(e)) return;
    const s = this.items().indexOf(e);
    s < 0 || (this.roving.set(s), this.paint());
  }
  onFocusOut(t) {
    this.root.contains(t.relatedTarget) || (this.roving.set(this.resolveInitial(this.items())), this.paint());
  }
}
const A = '[role="gridcell"]:not([disabled])', I = {
  ArrowRight: () => 1,
  ArrowLeft: () => -1,
  ArrowDown: (i) => i,
  ArrowUp: (i) => -i
};
function S(i, t) {
  const e = I[i];
  return e ? e(t) : null;
}
function M(i, t) {
  if (typeof t == "number") return t;
  if (typeof t == "string")
    for (const e of t.split(",").map((s) => s.trim())) {
      if (!e) continue;
      const s = i.findIndex((n) => n.matches(e));
      if (s >= 0) return s;
    }
  return 0;
}
class E {
  constructor(t, e) {
    r(this, "root");
    r(this, "columns");
    r(this, "cellSelector");
    r(this, "initial");
    r(this, "loop");
    r(this, "onOverflow");
    r(this, "onMove");
    r(this, "roving", d.of(0));
    r(this, "active", !1);
    r(this, "observer", null);
    r(this, "refreshQueued", !1);
    this.root = t, this.columns = e.columns, this.cellSelector = e.cells ?? A, this.initial = e.initial, this.loop = e.loop ?? !1, this.onOverflow = e.onOverflow, this.onMove = e.onMove, this.onKeyDown = this.onKeyDown.bind(this), this.onFocusIn = this.onFocusIn.bind(this);
  }
  static of(t, e) {
    return new E(t, e);
  }
  activate() {
    return this.active ? this : (this.active = !0, this.refresh(!0), this.root.addEventListener("keydown", this.onKeyDown), this.root.addEventListener("focusin", this.onFocusIn), this.observer = new MutationObserver(() => this.queueRefresh()), this.observer.observe(this.root, { childList: !0, subtree: !0 }), this);
  }
  deactivate() {
    var t;
    return this.active ? (this.active = !1, (t = this.observer) == null || t.disconnect(), this.observer = null, this.root.removeEventListener("keydown", this.onKeyDown), this.root.removeEventListener("focusin", this.onFocusIn), this) : this;
  }
  queueRefresh() {
    this.refreshQueued || !this.active || (this.refreshQueued = !0, queueMicrotask(() => {
      this.refreshQueued = !1, this.active && this.refresh(!1);
    }));
  }
  /** Relê as células (DOM mudou) e volta a pintar o tabindex. */
  refresh(t = !1) {
    const e = this.cells();
    this.roving.resize(e.length);
    const s = document.activeElement;
    if (s instanceof HTMLElement) {
      const n = e.indexOf(s);
      if (n >= 0)
        return this.roving.set(n), this.paint(), this;
    }
    return t && this.roving.set(M(e, this.initial)), this.paint(), this;
  }
  cells() {
    return Array.from(
      this.root.querySelectorAll(this.cellSelector)
    );
  }
  paint() {
    const t = this.cells();
    this.root.getAttribute("tabindex") !== "-1" && (this.root.tabIndex = -1), t.forEach((e, s) => {
      e.tabIndex = s === this.roving.current ? 0 : -1;
    });
  }
  onFocusIn(t) {
    const e = t.target;
    if (!(e instanceof HTMLElement)) return;
    const n = this.cells().indexOf(e);
    n < 0 || (this.roving.set(n), this.paint());
  }
  onKeyDown(t) {
    var l, g;
    const e = S(t.key, this.columns);
    if (e === null) return;
    const s = this.cells();
    if (this.roving.resize(s.length), s.length === 0) return;
    t.preventDefault();
    const n = this.roving.next(e, this.loop);
    if ("overflow" in n) {
      (l = this.onOverflow) == null || l.call(this, n.overflow, { step: e });
      return;
    }
    const o = s[n.index];
    this.paint(), o == null || o.focus(), o && ((g = this.onMove) == null || g.call(this, o));
  }
}
const D = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "details",
  'input:not([type="hidden"]):not([disabled])',
  "iframe",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[contentEditable=""]',
  '[contentEditable="true"]',
  '[tabindex]:not([tabindex^="-"]):not([disabled])'
].join(","), T = {
  trap: !0,
  isolate: !0,
  restoreFocus: !0,
  autoFocus: !0
};
function C(i) {
  const t = getComputedStyle(i);
  return t.display !== "none" && t.visibility !== "hidden";
}
const f = [];
class y {
  constructor(t, e = {}) {
    r(this, "root");
    r(this, "options");
    r(this, "previous", null);
    r(this, "sentinels", []);
    r(this, "isolated", []);
    r(this, "active", !1);
    this.root = t, this.options = { ...T, ...e }, this.onFocusIn = this.onFocusIn.bind(this), this.onFocusOut = this.onFocusOut.bind(this);
  }
  /** Fábrica: cria um escopo sobre uma raiz do DOM. */
  static of(t, e) {
    return new y(t, e);
  }
  /** O escopo no topo da pilha (o que governa o foco), se houver. */
  static get current() {
    return f[f.length - 1] ?? null;
  }
  // ---- consultas puras ---------------------------------------------------
  focusables() {
    return Array.from(
      this.root.querySelectorAll(D)
    ).filter((t) => C(t) && !t.dataset.focusSentinel);
  }
  first() {
    return this.focusables()[0] ?? null;
  }
  last() {
    const t = this.focusables();
    return t[t.length - 1] ?? null;
  }
  // ---- restauração de foco ----------------------------------------------
  /** Guarda o foco atual (não sobrescreve se já guardou — aninhamento). */
  capture() {
    if (!this.previous) {
      const t = document.activeElement;
      this.previous = t instanceof HTMLElement ? t : null;
    }
    return this;
  }
  restore() {
    const t = this.previous ?? document.body;
    return this.previous = null, requestAnimationFrame(() => {
      var e;
      return (e = t.focus) == null ? void 0 : e.call(t);
    }), this;
  }
  // ---- trap (sentinelas) -------------------------------------------------
  focusEdge(t) {
    const e = t === "first" ? this.first() : this.last();
    requestAnimationFrame(() => (e ?? this.root).focus());
  }
  onFocusOut(t) {
    const e = t.relatedTarget;
    e != null && e.dataset.focusSentinel && this.focusEdge(e.dataset.focusSentinel === "start" ? "last" : "first");
  }
  onFocusIn(t) {
    const e = t.target;
    if (!(e != null && e.dataset.focusSentinel)) return;
    const s = t.relatedTarget;
    s && this.root.contains(s) || this.focusEdge(e.dataset.focusSentinel === "start" ? "first" : "last");
  }
  makeSentinel(t) {
    const e = document.createElement("span");
    return e.tabIndex = 0, e.dataset.focusSentinel = t, Object.assign(e.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)"
    }), e;
  }
  trap() {
    if (this.sentinels.length) return this;
    const t = this.makeSentinel("start"), e = this.makeSentinel("end");
    return this.root.prepend(t), this.root.append(e), this.sentinels = [t, e], this.root.addEventListener("focusin", this.onFocusIn), this.root.addEventListener("focusout", this.onFocusOut), this;
  }
  release() {
    return this.sentinels.forEach((t) => t.remove()), this.sentinels = [], this.root.removeEventListener("focusin", this.onFocusIn), this.root.removeEventListener("focusout", this.onFocusOut), this;
  }
  // ---- isolate (inert do exterior) --------------------------------------
  isolate() {
    if (this.isolated.length) return this;
    const t = Array.from(document.body.children).filter(
      (e) => e instanceof HTMLElement && !e.contains(this.root)
    );
    for (const e of t)
      e.inert || (e.inert = !0, this.isolated.push(e));
    return this;
  }
  restoreOutside() {
    for (const t of this.isolated) t.inert = !1;
    return this.isolated = [], this;
  }
  // ---- ciclo de vida -----------------------------------------------------
  activate() {
    if (this.active) return this;
    if (this.active = !0, this.capture(), f.push(this), this.options.isolate && this.isolate(), this.options.trap && this.trap(), this.options.autoFocus) {
      this.root.hasAttribute("tabindex") || (this.root.tabIndex = -1);
      const t = this.first() ?? this.root;
      requestAnimationFrame(() => t.focus());
    }
    return this;
  }
  deactivate() {
    if (!this.active) return this;
    this.active = !1, this.release(), this.restoreOutside();
    const t = f.lastIndexOf(this);
    return t >= 0 && f.splice(t, 1), this.options.restoreFocus && this.restore(), this;
  }
}
class F {
  constructor(t) {
    r(this, "options");
    r(this, "checkers", /* @__PURE__ */ new Map());
    this.options = {
      multiple: t.multiple ?? !1,
      allowAllUnchecked: t.allowAllUnchecked ?? !0,
      defaultChecked: t.defaultChecked
    };
  }
  static of(t = {}) {
    return new F(t);
  }
  has(t) {
    return this.checkers.has(t);
  }
  isChecked(t) {
    return this.checkers.get(t) ?? !1;
  }
  get checked() {
    const t = [];
    for (const [e, s] of this.checkers)
      s && t.push(e);
    return t;
  }
  register(t, e) {
    if (this.checkers.has(t))
      throw new Error(`[mini-q/aria] CheckGroup: item duplicado "${t}"`);
    const s = this.options.defaultChecked === t ? !0 : e;
    this.checkers.set(t, s), s && !this.options.multiple && this.keepOnly(t), !s && !this.options.allowAllUnchecked && this.keepLastCheckedOr(t);
  }
  unregister(t) {
    this.checkers.delete(t);
  }
  set(t, e) {
    this.checkers.has(t) && (this.checkers.set(t, e), e && !this.options.multiple && this.keepOnly(t), !e && !this.options.allowAllUnchecked && this.keepLastCheckedOr(t));
  }
  /** Mantém apenas `name` checado (desmarca os demais). */
  keepOnly(t) {
    for (const e of this.checkers.keys())
      e !== t && this.checkers.set(e, !1);
  }
  /** Garante que ao menos `name` fica checado (ou outro ainda checado). */
  keepLastCheckedOr(t) {
    for (const [, e] of this.checkers)
      if (e) return;
    this.checkers.set(t, !0);
  }
}
export {
  F as CheckGroup,
  E as FocusGrid,
  y as FocusScope,
  k as RovingFocus,
  d as RovingIndex,
  S as stepForKey
};
