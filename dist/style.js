import { S as V } from "./nodes.js";
import { c as ye } from "./nodes.js";
import { createSignal as I } from "./reactive.js";
import { r as Z } from "./lifecycle.js";
const C = /* @__PURE__ */ new Map();
let E;
function ue(e) {
  if (e.breakpoints)
    for (const t in e.breakpoints)
      C.set(t, T(e.breakpoints[t]));
  e.scope && (E = { ...E, ...e.scope });
}
function F() {
  return E;
}
const Q = /^[0-9]+(\.[0-9]+)?$/;
function T(e) {
  if (typeof e == "number") return `(min-width: ${e}px)`;
  const t = e.trim().replace(/px$/, "");
  return Q.test(t) ? `(min-width: ${t}px)` : e;
}
function _(e) {
  const t = e.trim();
  return C.has(t) ? C.get(t) : T(t);
}
const Y = /* @__PURE__ */ new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "fontWeight",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "scale",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth"
]);
function S(e) {
  return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function A(e, t) {
  return t ? e.replace(/\$([A-Za-z0-9_-]+)/g, (n, s) => {
    const r = t[s];
    return r ? `.${r}` : n;
  }) : e;
}
function B(e, t) {
  return t === !1 || t === null || t === void 0 ? null : typeof t == "number" ? `${S(e)}: ${Y.has(e) ? t : `${t}px`}` : typeof t == "boolean" ? null : `${S(e)}: ${t}`;
}
function v(e, t, n) {
  const s = [], r = [];
  for (const c in t) {
    const i = t[c];
    if (!(i == null || typeof i == "boolean"))
      if (typeof i == "object")
        if (c.startsWith("@")) {
          const l = c.includes(" ") ? c : `@media ${_(c.slice(1))}`, $ = v(e, i, n);
          $.length && r.push(`${l} { ${$.join(" ")} }`);
        } else {
          const l = c.includes("&") ? A(c.replaceAll("&", e), n) : A(`${e} ${c}`, n);
          r.push(...v(l, i, n));
        }
      else {
        const l = B(c, i);
        l && s.push(l);
      }
  }
  const a = [];
  return s.length && a.push(`${e} { ${s.join("; ")}; }`), a.push(...r), a;
}
function J(e, t) {
  const n = [];
  for (const s in t) {
    const r = t[s];
    if (!r || typeof r != "object") continue;
    const a = [];
    for (const c in r) {
      const i = B(c, r[c]);
      i && a.push(i);
    }
    a.length && n.push(`${s} { ${a.join("; ")}; }`);
  }
  return `@keyframes ${e} { ${n.join(" ")} }`;
}
const W = /* @__PURE__ */ new Set();
let d = null;
function X() {
  return typeof document > "u" ? null : (d != null && d.isConnected || (d = document.getElementById("mq-styles"), d || (d = document.createElement("style"), d.id = "mq-styles", document.head.appendChild(d))), d);
}
function O(e) {
  const t = X();
  !t || W.has(e) || (W.add(e), t.appendChild(document.createTextNode(`${e}
`)));
}
function G(e, t, n) {
  for (const s of v(e, t, n)) O(s);
}
function x(e, t, n) {
  if (e.length === 0) return [];
  const s = n ? `@scope (${t}) to (${n})` : `@scope (${t})`;
  return e.map((r) => `${s} { ${r} }`);
}
function de(e, t) {
  G(e, t);
}
function ee(e) {
  let t = 0;
  for (let s = 0; s < e.length; s++) t = t * 31 + e.charCodeAt(s) | 0;
  const n = (t >>> 0).toString(36);
  return n.length <= 4 ? n : n.slice(-4);
}
function te(e, t) {
  const n = { ...F(), ...e };
  return n.name === "hashed" && (n.name = ee(t)), n.strategy || (n.strategy = "prefixed"), n;
}
function ne(e, t) {
  return e.strategy === "prefixed" && e.name && e.name !== "hashed" ? `${e.name}-${t}` : t;
}
function R(e, t, n) {
  return `-${e.name && e.name !== "hashed" ? e.name : t}-${S(n)}`;
}
function pe(e, t, n) {
  return `${e.name && e.name !== "hashed" ? `${e.name}-${t}` : t}-${n}`;
}
const se = /* @__PURE__ */ new Set(["parts", "scope", "flags", "variants", "defaults", "slots", "keyframes"]);
function oe(e) {
  return e.scope;
}
function w(e) {
  const t = {}, n = {};
  for (const s in e) {
    if (s.startsWith(">")) {
      const r = s.slice(1), a = e[s];
      if (a && typeof a == "object") {
        const { decls: c, parts: i } = w(a);
        n[r] = { ...c, parts: i };
      } else
        console.warn(`[mini-q] "${s}" deve ser um objeto de estilo — ignorado.`);
      continue;
    }
    t[s] = e[s];
  }
  return { decls: t, parts: n };
}
function H(e, t) {
  if (!t) return e;
  const n = {};
  for (const s in t) n[s] = t[s];
  for (const s in e) {
    const { decls: r, parts: a } = w(e[s]);
    if (t[s]) {
      const { decls: c, parts: i } = w(t[s]);
      n[s] = H(a, i), n[s] = { ...c, ...r, parts: n[s] };
    } else
      n[s] = { ...r, parts: a };
  }
  return n;
}
const L = /* @__PURE__ */ new Set(["self", "flags", "variants", "keyframes", "slots"]);
function b(e, t, n, s) {
  for (const r of v(t, n, s)) e.out.push(r);
}
function M(e, t, n) {
  var c;
  const s = {};
  let r, a;
  for (const i in n)
    i === "parts" ? r = n[i] : i === "slots" ? a = n[i] : s[i] = n[i];
  if (Object.keys(s).length && b(e, t, s), r)
    for (const i in r) b(e, `${t} .${R(e.scope, e.block, i)}`, r[i]);
  if (a)
    for (const i in a) {
      const l = (c = e.slotSel) == null ? void 0 : c.call(e, i);
      if (!l) {
        console.warn(`[mini-q] slot "${i}" não declarado em "${e.block}" — declare em \`slots\`.`);
        continue;
      }
      b(e, `${t} .${l}`, a[i]);
    }
}
function K(e, t, n) {
  const { decls: s, parts: r } = w(e), a = H(r, s.parts), c = n.length === 1, i = t.native ? n.map((o, f) => f === 0 ? ":scope" : `.${o}`).join(" ") : n.map((o) => `.${o}`).join(" "), l = n[n.length - 1], $ = {};
  if (a)
    for (const o in a)
      L.has(o) || ($[o] = R(t.scope, t.block, o));
  const g = {};
  if (s.slots) {
    const o = s.slots;
    for (const f in o) {
      const u = o[f];
      g[f] = typeof u == "string" ? u : u.self;
    }
  }
  t.slots = g, t.slotSel = (o) => g[o];
  const y = {};
  for (const o in s) {
    if (se.has(o)) continue;
    const f = s[o];
    if (f != null) {
      if (typeof f != "object") {
        y[o] = f;
        continue;
      }
      if (o.startsWith("&") || o.startsWith("@")) {
        y[o] = f;
        continue;
      }
      console.warn(
        `[mini-q] chave "${o}" ignorada em "${t.block}" — partes vão sob "parts", flags sob "flags", variantes sob "variants".`
      );
    }
  }
  Object.keys(y).length && b(t, i, y, $);
  const k = {};
  if (e.flags)
    for (const o in e.flags)
      M(t, `${i}.--is-${o}`, e.flags[o]), k[o] = `--is-${o}`;
  const p = {};
  if (e.variants)
    for (const o in e.variants) {
      p[o] = {};
      const f = e.variants[o];
      for (const u in f)
        M(t, `${i}.--${o}-${u}`, f[u]), p[o][u] = `--${o}-${u}`;
    }
  const D = {};
  if (e.keyframes)
    for (const o in e.keyframes) {
      const f = `${t.block}-${S(o)}`;
      O(J(f, e.keyframes[o])), D[o] = f;
    }
  const P = {};
  if (a)
    for (const o in a) {
      if (L.has(o)) {
        console.warn(
          `[mini-q] parte "${o}" em "${t.block}" usa um nome reservado do handle (self/flags/variants/keyframes/slots) — renomeie.`
        );
        continue;
      }
      const f = R(t.scope, t.block, o);
      P[o] = K(a[o], t, [...n, f]);
    }
  const U = e.defaults ?? {}, q = c ? t.root : l, j = ((o = {}) => {
    const f = [q], u = { ...U, ...o };
    for (const m in u) {
      const h = u[m];
      h == null || h === !1 || (p[m] && typeof h == "string" && p[m][h] ? f.push(p[m][h]) : k[m] !== void 0 && h === !0 && f.push(k[m]));
    }
    return f.join(" ");
  });
  return Object.assign(j, { self: q, flags: k, variants: p, keyframes: D, slots: { ...g } }, P), Object.defineProperty(j, V, { value: !0 }), j;
}
const N = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set();
function re(e) {
  N.has(e) && !z.has(e) && (z.add(e), console.warn(`[mini-q] estilo "${e}" registrado mais de uma vez — as regras podem colidir.`)), N.add(e);
}
function ie(e, t) {
  re(e);
  const n = te(oe(t), e), s = {
    scope: n,
    block: e,
    root: ne(n, e),
    native: n.strategy === "native",
    out: [],
    slots: {}
  }, r = K(t, s, [s.root]), a = s.native ? x(s.out, `.${s.root}`, n.to) : s.out;
  for (const c of a) O(c);
  return r;
}
const ae = Object.assign(ie, { css: G });
function me(e, t) {
  return ae(e, { parts: t });
}
function he(e) {
  const t = _(e);
  if (typeof matchMedia > "u")
    return I(!1);
  const n = matchMedia(t), s = I(n.matches), r = (a) => {
    s.value = a.matches;
  };
  return n.addEventListener("change", r), Z(() => n.removeEventListener("change", r)), s;
}
export {
  v as compile,
  ue as config,
  de as css,
  ye as cx,
  ee as hashScope,
  G as inject,
  he as media,
  me as parts,
  pe as scopedId,
  ae as style
};
