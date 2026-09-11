import { r as K } from "./lifecycle.js";
function h(e, n) {
  let t = e;
  for (let o = n.length - 1; o >= 0; o--) t = n[o](t);
  return t;
}
function M(e, ...n) {
  return h(e, n);
}
const W = (e) => (n, t) => (n.preventDefault(), e(n, t)), g = (e) => (n, t) => (n.stopPropagation(), e(n, t)), x = (e) => (n, t) => {
  if (n.target === t.element) return e(n, t);
}, H = (...e) => (n) => (t, o) => {
  if (e.includes(t.key)) return n(t, o);
}, E = (e) => (n) => (t, o) => {
  if (t[e]) return n(t, o);
}, F = (e, n = {}) => (t) => {
  const { leading: o = !1, trailing: u = !0, maxWait: l } = n;
  let i, r, d, f = 0;
  const c = (a, m) => {
    f = Date.now(), d = void 0, i && (clearTimeout(i), i = void 0), r && (clearTimeout(r), r = void 0), t(a, m);
  };
  return (a, m) => {
    const v = Date.now();
    if (o && v - f >= e)
      return f = v, d = void 0, i && (clearTimeout(i), i = void 0), r && (clearTimeout(r), r = void 0), t(a, m);
    if (u && (d = [a, m], i && clearTimeout(i), i = setTimeout(() => {
      i = void 0, d && c(...d);
    }, e), l && !r)) {
      const p = f === 0 ? 0 : v - f;
      r = setTimeout(() => {
        r = void 0, d && c(...d);
      }, Math.max(0, l - p));
    }
  };
}, U = (e, n = {}) => (t) => {
  const { leading: o = !0, trailing: u = !0 } = n;
  return F(e, { leading: o, trailing: u, maxWait: e })(t);
};
function q(e) {
  const n = {};
  for (const t in e) {
    const o = e[t];
    n[t] = Array.isArray(o) ? h(o[0], o.slice(1)) : o;
  }
  return n;
}
const J = Object.assign(M, {
  prevent: W,
  stop: g,
  self: x,
  keys: H,
  alt: E("altKey"),
  ctrl: E("ctrlKey"),
  shift: E("shiftKey"),
  meta: E("metaKey"),
  debounce: F,
  throttle: U,
  handlers: q
}), S = /* @__PURE__ */ new Map();
function L(e, n) {
  S.set(e, n);
}
function z(e) {
  return S.get(e);
}
L("clickOutside", (e, n) => {
  const t = (o) => {
    e.contains(o.target) || n(o);
  };
  return document.addEventListener("pointerdown", t, !0), () => document.removeEventListener("pointerdown", t, !0);
});
L("focusOutside", (e, n) => {
  let t;
  const o = (l) => {
    const i = l.relatedTarget;
    i && e.contains(i) || (t && t(), t = n(l) ?? void 0);
  }, u = () => {
    t && (t(), t = void 0);
  };
  return e.addEventListener("focusout", o), e.addEventListener("focusin", u), () => {
    e.removeEventListener("focusout", o), e.removeEventListener("focusin", u), t && (t(), t = void 0);
  };
});
L("interactOutside", (e, n) => {
  let t;
  const o = (u) => {
    e.contains(u.target) ? t && (t(), t = void 0) : (t && t(), t = n(u) ?? void 0);
  };
  return document.addEventListener("pointerdown", o, !0), () => {
    document.removeEventListener("pointerdown", o, !0), t && (t(), t = void 0);
  };
});
L("hover", (e, n, t = {}) => {
  const { delayIn: o = 0, delayOut: u = 0, touchable: l = !1, holdDelay: i = 500 } = t;
  let r, d, f, c, a = !1;
  const m = () => {
    d && (clearTimeout(d), d = void 0), f && (clearTimeout(f), f = void 0), c && (clearTimeout(c), c = void 0);
  }, v = () => {
    a = !1, r && (r(), r = void 0);
  }, T = () => {
    d && (clearTimeout(d), d = void 0), u > 0 ? f = setTimeout(v, u) : v();
  }, p = (s) => {
    r && r(), r = n(s) ?? void 0;
  }, A = (s) => {
    f && (clearTimeout(f), f = void 0), o > 0 ? d = setTimeout(() => p(s), o) : p(s);
  }, y = (s) => {
    s.pointerType !== "touch" && A(s);
  }, w = (s) => {
    s.pointerType !== "touch" && T();
  }, D = (s) => {
    s.pointerType === "touch" && (a = !0, c = setTimeout(() => {
      c = void 0, p(s);
    }, i));
  }, k = (s) => {
    s.pointerType === "touch" && (a = !1, c && (clearTimeout(c), c = void 0), T());
  }, O = (s) => {
    s.pointerType === "touch" && (a = !1, c && (clearTimeout(c), c = void 0), v());
  }, P = () => {
    !c && !r || (a = !1, c && (clearTimeout(c), c = void 0), v());
  }, b = (s) => {
    a && s.preventDefault();
  }, C = (s) => {
    a && s.preventDefault();
  };
  return e.addEventListener("pointerenter", y), e.addEventListener("pointerleave", w), l && (e.addEventListener("pointerdown", D), e.addEventListener("pointerup", k), e.addEventListener("pointercancel", O), document.addEventListener("scroll", P, !0), e.addEventListener("contextmenu", b), e.addEventListener("selectstart", C)), () => {
    e.removeEventListener("pointerenter", y), e.removeEventListener("pointerleave", w), l && (e.removeEventListener("pointerdown", D), e.removeEventListener("pointerup", k), e.removeEventListener("pointercancel", O), document.removeEventListener("scroll", P, !0), e.removeEventListener("contextmenu", b), e.removeEventListener("selectstart", C)), m(), v();
  };
});
function B(e) {
  if (typeof e == "function") return { handler: e };
  const n = e, t = n[0], o = [];
  let u;
  for (let l = 1; l < n.length; l++) {
    const i = n[l];
    typeof i == "function" ? o.push(i) : i && typeof i == "object" && (u = i);
  }
  return { handler: h(t, o), options: u };
}
function I(e) {
  let n = !1;
  return () => {
    n || (n = !0, e());
  };
}
function j(e, n, t) {
  const { handler: o, options: u } = B(t), l = z(n);
  if (l)
    return I(l(e.element, (r) => o(r, e), u));
  const i = (r) => o(r, e);
  return e.element.addEventListener(n, i, u), I(() => e.element.removeEventListener(n, i, u));
}
function N(e, n) {
  for (const t in n) {
    const o = n[t];
    o != null && K(j(e, t, o));
  }
}
function Q(e, n, t) {
  const o = j(e, n, t);
  return K(o), o;
}
export {
  N as applyEvents,
  h as compose,
  z as getCustomEvent,
  J as handle,
  Q as on,
  L as registerCustomEvent
};
