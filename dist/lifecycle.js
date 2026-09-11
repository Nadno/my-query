let e = null;
function i(n = e) {
  return { cleanups: [], parent: n };
}
function s(n, o) {
  const t = e;
  e = n;
  try {
    return o();
  } finally {
    e = t;
  }
}
function c(n) {
  e && e.cleanups.push(n);
}
function a(n) {
  const { cleanups: o } = n;
  for (let t = o.length - 1; t >= 0; t--)
    try {
      o[t]();
    } catch (r) {
      console.error("[mini-q] cleanup error", r);
    }
  o.length = 0;
}
function l(n) {
  if (!e) {
    console.warn("[mini-q] onUnmounted fora de escopo — passe um builder a $.mount");
    return;
  }
  c(n);
}
function p(n) {
  if (!e) {
    console.warn("[mini-q] onMounted fora de escopo — passe um builder a $.mount"), n();
    return;
  }
  const o = e;
  u.push({ scope: o, fn: n });
}
const u = [];
function f() {
  if (u.length === 0) return;
  const n = u.splice(0, u.length);
  for (const { scope: o, fn: t } of n)
    s(o, () => {
      const r = t();
      typeof r == "function" && c(r);
    });
}
export {
  s as a,
  l as b,
  i as c,
  a as d,
  f,
  p as o,
  c as r
};
