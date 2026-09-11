import { applyEvents as J, on as k, handle as Q } from "./events.js";
import { registerCustomEvent as we, compose as xe, getCustomEvent as Me } from "./events.js";
import { r as N, a as E, f as U, d as v, c as L } from "./lifecycle.js";
import { o as Re, b as Ve } from "./lifecycle.js";
import { r as W, T as z, g as R, i as V, t as X, a as Y } from "./nodes.js";
import { c as qe } from "./nodes.js";
import { bind as f, read as A, setValue as $, isSignal as j, getAdapter as Z, untrack as b, isReactive as _ } from "./reactive.js";
import { useSignal as He } from "./reactive.js";
function H(e, t) {
  const n = W(t);
  n ? e.className = n : e.className && e.removeAttribute("class");
}
function I(e, t) {
  if (typeof t == "string") {
    e.setAttribute("style", t);
    return;
  }
  for (const n in t) {
    const o = t[n];
    o != null && (e.style[n] = String(o));
  }
}
function P(e, t, n) {
  if (n === !1 || n === null || n === void 0) {
    e.removeAttribute(t);
    return;
  }
  if (t in e) {
    e[t] = n;
    return;
  }
  e.setAttribute(t, String(n));
}
function B(e) {
  return `aria-${e.toLowerCase()}`;
}
function D(e, t, n) {
  if (n == null) {
    e.removeAttribute(t);
    return;
  }
  e.setAttribute(t, String(n));
}
function F(e, t) {
  for (const n in t) {
    const o = t[n];
    D(e, B(n), o);
  }
}
function ee(e, t) {
  for (const n in t) {
    const o = t[n];
    if (o === void 0) continue;
    const r = B(n);
    f(o, (s) => D(e, r, s));
  }
}
function te(e, t, n) {
  let o;
  for (const r in n) {
    const s = n[r];
    switch (r) {
      case "key":
        continue;
      case "class":
        H(e, s);
        continue;
      case "$class":
        f(s, (c) => H(e, c));
        continue;
      case "style":
        I(e, s);
        continue;
      case "$style":
        f(
          s,
          (c) => I(e, c)
        );
        continue;
      case "data":
        for (const c in s)
          e.dataset[c] = String(s[c]);
        continue;
      case "$data":
        for (const c in s)
          f(s[c], (a) => {
            e.dataset[c] = String(a);
          });
        continue;
      case "aria":
        F(e, s);
        continue;
      case "$aria":
        ee(e, s);
        continue;
      case "on":
        J(t, s);
        continue;
      case "use":
        o = s;
        continue;
    }
    if (r.charCodeAt(0) === 36) {
      const c = r.slice(1);
      f(s, (a) => P(e, c, a));
      continue;
    }
    P(e, r, s);
  }
  return o;
}
function ne(e, t) {
  const n = Array.isArray(t) ? t : [t];
  for (const o of n) {
    const r = o(e);
    typeof r == "function" && N(r);
  }
}
function ge(e, t) {
  return (n) => {
    const o = n.element;
    if (o instanceof HTMLInputElement && o.type === "checkbox") {
      Array.isArray(A(e)) ? ce(n, e, t) : re(n, e, t);
      return;
    }
    if (o instanceof HTMLInputElement && o.type === "radio") {
      se(n, e, t);
      return;
    }
    if (o instanceof HTMLSelectElement && o.multiple) {
      ie(n, e, t);
      return;
    }
    oe(n, e, t);
  };
}
function T(e, t) {
  let n = e;
  if (t != null && t.trim && (n = n.trim()), t != null && t.number) {
    const o = parseFloat(n);
    return Number.isNaN(o) ? n : o;
  }
  return n;
}
function oe(e, t, n) {
  const o = e.element;
  f(t, (r) => {
    const s = r == null ? "" : String(r);
    o.value !== s && (o.value = s);
  }), k(e, n != null && n.lazy ? "change" : "input", () => $(t, T(o.value, n)));
}
function re(e, t, n) {
  const o = e.element, r = (n == null ? void 0 : n.trueValue) ?? !0, s = (n == null ? void 0 : n.falseValue) ?? !1;
  f(t, (c) => {
    o.checked = c === r;
  }), k(e, "change", () => $(t, o.checked ? r : s));
}
function se(e, t, n) {
  const o = e.element;
  f(t, (r) => {
    o.checked = o.value === (r == null ? "" : String(r));
  }), k(e, "change", () => {
    o.checked && $(t, T(o.value, n));
  });
}
function ce(e, t, n) {
  const o = e.element;
  f(t, (r) => {
    const s = Array.isArray(r) ? r : [];
    o.checked = s.map((c) => String(c)).includes(o.value);
  }), k(e, "change", () => {
    const r = A(t), s = Array.isArray(r) ? r.slice() : [], a = s.map((u) => String(u)).indexOf(o.value), i = T(o.value, n);
    o.checked && a === -1 ? s.push(i) : !o.checked && a !== -1 && s.splice(a, 1), $(t, s);
  });
}
function ie(e, t, n) {
  const o = e.element;
  f(t, (r) => {
    const s = Array.isArray(r) ? r.map((c) => String(c)) : [];
    for (const c of Array.from(o.options)) c.selected = s.includes(c.value);
  }), k(e, "change", () => {
    $(
      t,
      Array.from(o.selectedOptions).map((r) => T(r.value, n))
    );
  });
}
function Ae(e) {
  return (t) => {
    f(e, (n) => {
      t.element.hidden = !n;
    });
  };
}
function Se(e) {
  return (t) => {
    const n = t.element;
    n[z] = !0;
    const o = (r) => {
      r.appendChild(n);
    };
    typeof e == "function" ? f(e, (r) => o(R(r))) : o(R(e)), N(() => {
      n.remove();
    });
  };
}
function K(e) {
  return Array.isArray(e) && e.length === 2 && typeof e[0] == "function" && !j(e[0]) && (e[1] == null || typeof e[1] == "object" && !V(e[1]) && !Array.isArray(e[1]));
}
function ae(e) {
  return typeof e == "object" && e !== null && !V(e) && !Array.isArray(e) && !j(e);
}
function ue(e, t) {
  const n = document.createComment("mq");
  e.appendChild(n);
  const o = /* @__PURE__ */ new Map();
  let r = [];
  const s = () => {
    for (const i of r) {
      v(i.scope);
      for (const u of i.nodes) u.remove();
    }
    r = [];
  }, c = (i, u) => {
    s();
    const w = Array.isArray(i) ? i : [i], q = /* @__PURE__ */ new Set(), C = [];
    let O = 0;
    for (let m = 0; m < w.length; m++) {
      const p = w[m];
      if (K(p)) {
        const l = p[1] ?? {}, d = l.key ?? l;
        q.add(d);
        let y = o.get(d);
        if (!y) {
          const h = L();
          y = { nodes: E(h, () => b(() => X(p[0](l)))), scope: h }, o.set(d, y);
        }
        C.push(y);
      } else {
        const l = e.childNodes.length;
        E(u, () => b(() => g(e, p)));
        const d = [];
        for (let h = l; h < e.childNodes.length; h++) {
          const M = e.childNodes[h];
          M && d.push(M);
        }
        const y = { nodes: d, scope: u };
        r.push(y), O++, C.push(y);
      }
    }
    for (const [m, p] of o)
      if (!q.has(m)) {
        v(p.scope);
        for (const l of p.nodes) l.remove();
        o.delete(m);
      }
    O === 0 && v(u);
    const S = document.activeElement;
    let x = n;
    for (let m = C.length - 1; m >= 0; m--) {
      const p = C[m].nodes;
      for (let l = p.length - 1; l >= 0; l--) {
        const d = p[l];
        Y(d) || (d.nextSibling !== x && e.insertBefore(d, x), x = d);
      }
    }
    S && S !== document.activeElement && S.isConnected && typeof S.focus == "function" && S.focus({ preventScroll: !0 });
  }, a = Z().effect(() => {
    const i = L();
    E(i, () => c(A(t), i)), U();
  });
  N(a), N(() => {
    s();
    for (const i of o.values()) {
      v(i.scope);
      for (const u of i.nodes) u.remove();
    }
    o.clear(), n.remove();
  });
}
function g(e, t) {
  if (!(t == null || t === !1 || t === !0)) {
    if (K(t)) {
      g(e, t[0](t[1] ?? {}));
      return;
    }
    if (Array.isArray(t)) {
      for (let n = 0; n < t.length; n++) g(e, t[n]);
      return;
    }
    if (_(t)) {
      ue(e, t);
      return;
    }
    if (V(t)) {
      if (t[z]) return;
      e.appendChild(t);
      return;
    }
    e.appendChild(document.createTextNode(String(t)));
  }
}
function fe(e, ...t) {
  const n = t[0];
  if (typeof n == "function" && !j(n) && n.length > 0) {
    const a = n;
    return ((i = {}) => {
      const u = document.createElement(e);
      return g(u, a(i, { element: u })), u;
    });
  }
  const o = document.createElement(e), r = { element: o };
  let s = 0, c;
  ae(n) && (c = te(o, r, n), s = 1);
  for (let a = s; a < t.length; a++) g(o, t[a]);
  return c != null && ne(r, c), o;
}
const le = Symbol("mq.else");
function G(...e) {
  return () => {
    for (const t of e) {
      if (typeof t == "function") return b(t);
      const [n, o] = t;
      if (n === le || A(n)) return b(o);
    }
    return null;
  };
}
function ve(e, t, n) {
  return n ? G([e, t], n) : G([e, t]);
}
function ke(e, t, n) {
  return () => {
    const o = String(A(e)), r = t[o];
    return r ? b(r) : n ? b(n) : null;
  };
}
function $e(e, t, n) {
  return () => (A(e) ?? []).map(
    (o) => [t, { ...o, key: n(o) }]
  );
}
function Ce(e, t, n) {
  const o = R(e), r = L(null), s = [];
  return E(r, () => {
    const c = typeof t == "function" ? t(n ?? {}) : t, a = o.childNodes.length;
    g(o, c);
    for (let i = a; i < o.childNodes.length; i++) {
      const u = o.childNodes[i];
      u && s.push(u);
    }
  }), U(), () => {
    v(r);
    for (const c of s) c.remove();
  };
}
const de = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "menu",
  "meter",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
], me = {};
for (const e of de)
  me[e] = (...t) => fe(e, ...t);
const Ee = Q.handlers;
export {
  g as $append,
  qe as $cx,
  $e as $each,
  le as $else,
  Q as $handle,
  Ee as $handlers,
  G as $match,
  ge as $model,
  Ce as $mount,
  k as $on,
  Re as $onMounted,
  Ve as $onUnmounted,
  we as $registerCustomEvent,
  Ae as $show,
  ke as $switch,
  He as $useSignal,
  Se as $useTeleport,
  ve as $when,
  ne as applyUse,
  f as bind,
  xe as compose,
  fe as createTag,
  me as default,
  Me as getCustomEvent,
  _ as isReactive,
  j as isSignal,
  A as read,
  $ as setValue,
  b as untrack
};
