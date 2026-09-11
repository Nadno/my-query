import { S as ee } from "./nodes.js";
import { c as qe } from "./nodes.js";
import { createSignal as _ } from "./reactive.js";
import { r as te } from "./lifecycle.js";
const O = /* @__PURE__ */ new Map();
let C;
function we(e) {
  if (e.breakpoints)
    for (const t in e.breakpoints)
      O.set(t, G(e.breakpoints[t]));
  e.scope && (C = { ...C, ...e.scope });
}
function ne() {
  return C;
}
const se = /^[0-9]+(\.[0-9]+)?$/;
function G(e) {
  if (typeof e == "number") return `(min-width: ${e}px)`;
  const t = e.trim().replace(/px$/, "");
  return se.test(t) ? `(min-width: ${t}px)` : e;
}
function H(e) {
  const t = e.trim();
  return O.has(t) ? O.get(t) : G(t);
}
const oe = /* @__PURE__ */ new Set([
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
function w(e) {
  return e.startsWith("--") ? e : e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function z(e, t) {
  return t ? e.replace(/\$([A-Za-z0-9_-]+)/g, (n, o) => {
    const i = t[o];
    return i ? `.${i}` : n;
  }) : e;
}
function U(e, t) {
  return t === !1 || t === null || t === void 0 ? null : typeof t == "number" ? `${w(e)}: ${oe.has(e) ? t : `${t}px`}` : typeof t == "boolean" ? null : `${w(e)}: ${t}`;
}
function v(e, t, n) {
  const o = [], i = [];
  for (const r in t) {
    const c = t[r];
    if (!(c == null || typeof c == "boolean"))
      if (typeof c == "object")
        if (r.startsWith("@")) {
          const f = r.includes(" ") ? r : `@media ${H(r.slice(1))}`, a = v(e, c, n);
          a.length && i.push(`${f} { ${a.join(" ")} }`);
        } else {
          const f = r.includes("&") ? z(r.replaceAll("&", e), n) : z(`${e} ${r}`, n);
          i.push(...v(f, c, n));
        }
      else {
        const f = U(r, c);
        f && o.push(f);
      }
  }
  const l = [];
  return o.length && l.push(`${e} { ${o.join("; ")}; }`), l.push(...i), l;
}
function re(e, t) {
  const n = [];
  for (const o in t) {
    const i = t[o];
    if (!i || typeof i != "object") continue;
    const l = [];
    for (const r in i) {
      const c = U(r, i[r]);
      c && l.push(c);
    }
    l.length && n.push(`${o} { ${l.join("; ")}; }`);
  }
  return `@keyframes ${e} { ${n.join(" ")} }`;
}
const T = /* @__PURE__ */ new Set();
let m = null;
function ie() {
  return typeof document > "u" ? null : (m != null && m.isConnected || (m = document.getElementById("mq-styles"), m || (m = document.createElement("style"), m.id = "mq-styles", document.head.appendChild(m))), m);
}
function q(e) {
  const t = ie();
  !t || T.has(e) || (T.add(e), t.appendChild(document.createTextNode(`${e}
`)));
}
function V(e, t, n) {
  for (const o of v(e, t, n)) q(o);
}
function ce(e, t, n) {
  if (e.length === 0) return [];
  const o = n ? `@scope (${t}) to (${n})` : `@scope (${t})`;
  return e.map((i) => `${o} { ${i} }`);
}
function ve(e, t) {
  V(e, t);
}
function ae(e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) t = t * 31 + e.charCodeAt(o) | 0;
  const n = (t >>> 0).toString(36);
  return n.length <= 4 ? n : n.slice(-4);
}
function fe(e, t) {
  const n = { ...ne(), ...e };
  return n.name === "hashed" && (n.name = ae(t)), n.strategy || (n.strategy = "prefixed"), n;
}
function le(e, t) {
  return e.strategy === "prefixed" && e.name && e.name !== "hashed" ? `${e.name}-${t}` : t;
}
function P(e, t, n) {
  return `-${e.name && e.name !== "hashed" ? e.name : t}-${w(n)}`;
}
function je(e, t, n) {
  return `${e.name && e.name !== "hashed" ? `${e.name}-${t}` : t}-${n}`;
}
function ue(e) {
  const t = e.$;
  return t != null && t.scope ? t.scope : e.scope;
}
const de = /^\$[A-Za-z0-9_-]+$/;
function M(e) {
  return e !== "$" && de.test(e);
}
const me = /* @__PURE__ */ new Set(["self", "flags", "variants", "keyframes", "hosts", "slots"]);
function Q(e, t = !1) {
  const n = {}, o = {}, i = {}, l = {};
  for (const r in e) {
    const c = e[r];
    if (r === "$") {
      Object.assign(n, c ?? {});
      continue;
    }
    if (M(r)) {
      const f = r.slice(1);
      c && typeof c == "object" ? o[f] = o[f] ? E(c, o[f]) : c : t || console.warn(`[mini-q] "${r}" deve ser um objeto de estilo — ignorado.`);
      continue;
    }
    if (r.startsWith(">") || r === "parts") {
      const f = {};
      r.startsWith(">") ? f[r.slice(1)] = c : c && typeof c == "object" && Object.assign(f, c), t || console.warn(
        `[mini-q] "${r}" deprecado — declare partes como "$nome" (\`$${Object.keys(f)[0]}\`).`
      );
      for (const a in f) {
        const d = f[a];
        d && typeof d == "object" ? i[a] = i[a] ? E(d, i[a]) : d : t || console.warn(`[mini-q] "${r}" deve ser um objeto de estilo — ignorado.`);
      }
      continue;
    }
    if (t) {
      if (r === "flags" || r === "variants" || r === "defaults" || r === "keyframes" || r === "slots" || r === "hosts" || r === "scope") continue;
    } else
      switch (r) {
        case "flags":
        case "variants":
        case "defaults":
        case "keyframes":
        case "slots":
        case "hosts":
        case "scope":
          n[r] = c;
          continue;
      }
    l[r] = c;
  }
  return { meta: n, parts: o, explicitParts: i, decls: l };
}
function E(e, t) {
  if (!t) return e;
  if (!e) return t;
  const n = {};
  for (const o in t) n[o] = t[o];
  for (const o in e) n[o] = e[o];
  return n;
}
function pe(e) {
  return Q(e, !1);
}
function he(e, t, n) {
  const o = {}, i = (l) => {
    const { parts: r, explicitParts: c } = Q(l, !0), f = { ...c, ...r };
    for (const a in f)
      me.has(a) || (o[a] = P(e, t, a), i(f[a]));
  };
  return i(n), o;
}
const B = /* @__PURE__ */ new Set(["self", "flags", "variants", "keyframes", "hosts", "slots"]);
function S(e, t, n, o) {
  for (const i of v(t, n, o)) e.out.push(i);
}
function K(e, t, n, o) {
  var c, f;
  const i = {}, l = {}, r = {};
  for (const a in n)
    M(a) ? l[a.slice(1)] = n[a] : a === "hosts" ? Object.assign(r, n[a]) : a === "parts" || a === "slots" ? (console.warn(
      `[mini-q] "${a}" em flag/variante deprecado — use "$nome" para parte e "hosts" para hospedados.`
    ), Object.assign(a === "parts" ? l : r, n[a])) : a !== "$" && (i[a] = n[a]);
  Object.keys(i).length && S(e, t, i, e.partRefs);
  for (const a in l) {
    const d = ((c = o[a]) == null ? void 0 : c.direct) ?? !0;
    S(
      e,
      `${t}${d ? " > " : " "}.${P(e.scope, e.block, a)}`,
      l[a],
      e.partRefs
    );
  }
  for (const a in r) {
    const d = (f = e.hostSel) == null ? void 0 : f.call(e, a);
    if (!d) {
      console.warn(`[mini-q] host "${a}" não declarado em hosts de "${e.block}" — declare em \`$: { hosts }\`.`);
      continue;
    }
    S(e, `${t} .${d}`, r[a], e.partRefs);
  }
}
function Y(e, t, n) {
  const { meta: o, parts: i, explicitParts: l, decls: r } = pe(e), c = {}, f = /* @__PURE__ */ new Set();
  for (const s in l) {
    if (B.has(s)) {
      f.add(s), console.warn(
        `[mini-q] parte "${s}" em "${t.block}" usa um nome reservado do handle (self/flags/variants/keyframes/hosts/slots) — renomeie.`
      );
      continue;
    }
    c[s] = { cfg: l[s], direct: !1 };
  }
  for (const s in i) {
    if (B.has(s)) {
      f.has(s) || console.warn(
        `[mini-q] parte "${s}" em "${t.block}" usa um nome reservado do handle (self/flags/variants/keyframes/hosts/slots) — renomeie.`
      );
      continue;
    }
    const u = c[s];
    c[s] = u ? { cfg: E(i[s], u.cfg), direct: !0 } : { cfg: i[s], direct: !0 };
  }
  const a = n.length === 1, d = (t.native ? ":scope" : `.${n[0].cls}`) + n.slice(1).map((s) => s.direct ? ` > .${s.cls}` : ` .${s.cls}`).join(""), J = n[n.length - 1].cls, k = {}, j = o.hosts ?? o.slots;
  if (j)
    for (const s in j) {
      const u = j[s];
      k[s] = typeof u == "string" ? u : u.self;
    }
  const A = o.flags ?? {}, D = o.variants ?? {}, X = o.defaults ?? {}, I = o.keyframes ?? {};
  t.hostSel = (s) => k[s];
  const y = {};
  for (const s in r) {
    if (M(s)) continue;
    const u = r[s];
    if (u != null) {
      if (typeof u != "object") {
        y[s] = u;
        continue;
      }
      if (s.startsWith("&") || s.startsWith("@")) {
        y[s] = u;
        continue;
      }
      String(s).includes("$") ? y[s] = u : console.warn(
        `[mini-q] chave "${s}" ignorada em "${t.block}" — declare partes como "$nome", condicionais em "$: flags/variants".`
      );
    }
  }
  Object.keys(y).length && S(t, d, y, t.partRefs);
  const b = {};
  for (const s in A)
    K(t, `${d}.--is-${s}`, A[s], c), b[s] = `--is-${s}`;
  const h = {};
  for (const s in D) {
    h[s] = {};
    const u = D[s];
    for (const p in u)
      K(t, `${d}.--${s}-${p}`, u[p], c), h[s][p] = `--${s}-${p}`;
  }
  const L = {};
  for (const s in I) {
    const u = `${t.block}-${w(s)}`;
    q(re(u, I[s])), L[s] = u;
  }
  const W = {};
  for (const s in c) {
    const u = P(t.scope, t.block, s);
    W[s] = Y(c[s].cfg, t, [
      ...n.map((p) => ({ ...p })),
      { cls: u, direct: c[s].direct }
    ]);
  }
  const x = X, N = a ? t.root : J, R = ((s = {}) => {
    const u = [N], p = { ...x, ...s };
    for (const $ in p) {
      const g = p[$];
      g == null || g === !1 || (h[$] && typeof g == "string" && h[$][g] ? u.push(h[$][g]) : b[$] !== void 0 && g === !0 && u.push(b[$]));
    }
    return u.join(" ");
  });
  return Object.assign(
    R,
    { self: N, flags: b, variants: h, keyframes: L, hosts: { ...k }, slots: { ...k } },
    W
  ), Object.defineProperty(R, ee, { value: !0 }), R;
}
const Z = /* @__PURE__ */ new Set(), F = /* @__PURE__ */ new Set();
function $e(e) {
  Z.has(e) && !F.has(e) && (F.add(e), console.warn(`[mini-q] estilo "${e}" registrado mais de uma vez — as regras podem colidir.`)), Z.add(e);
}
function ge(e, t) {
  $e(e);
  const n = fe(ue(t), e), o = he(n, e, t), i = {
    scope: n,
    block: e,
    root: le(n, e),
    native: n.strategy === "native",
    out: [],
    partRefs: o
  }, l = Y(t, i, [{ cls: i.root, direct: !0 }]), r = i.native ? ce(i.out, `.${i.root}`, n.to) : i.out;
  for (const c of r) q(c);
  return l;
}
const ye = Object.assign(ge, { css: V });
function Re(e, t) {
  return ye(e, { parts: t });
}
function Oe(e) {
  const t = H(e);
  if (typeof matchMedia > "u")
    return _(!1);
  const n = matchMedia(t), o = _(n.matches), i = (l) => {
    o.value = l.matches;
  };
  return n.addEventListener("change", i), te(() => n.removeEventListener("change", i)), o;
}
export {
  v as compile,
  we as config,
  ve as css,
  qe as cx,
  ae as hashScope,
  V as inject,
  Oe as media,
  Re as parts,
  je as scopedId,
  ye as style
};
