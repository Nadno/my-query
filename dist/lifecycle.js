let o = null;
function c(n = o) {
  return { cleanups: [], parent: n };
}
function s(n, e) {
  const r = o;
  o = n;
  try {
    return e();
  } finally {
    o = r;
  }
}
function t(n) {
  o && o.cleanups.push(n);
}
function a(n) {
  const { cleanups: e } = n;
  for (let r = e.length - 1; r >= 0; r--)
    try {
      e[r]();
    } catch (u) {
      console.error("[mini-q] cleanup error", u);
    }
  e.length = 0;
}
function i(n) {
  if (!o) {
    console.warn("[mini-q] onUnmounted fora de escopo — passe um builder a $.mount");
    return;
  }
  t(n);
}
function l(n) {
  if (!o) {
    console.warn("[mini-q] onMounted fora de escopo — passe um builder a $.mount"), n();
    return;
  }
  const e = n();
  typeof e == "function" && t(e);
}
export {
  s as a,
  i as b,
  c,
  a as d,
  l as o,
  t as r
};
