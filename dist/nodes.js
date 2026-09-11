const f = Symbol("mq.styleHandle"), s = Symbol("mq.teleported");
function c(r) {
  return typeof r == "object" && r !== null && "nodeType" in r;
}
function d(r) {
  return r[s] === !0;
}
function e(r) {
  if (typeof r == "string") return r;
  if (typeof r == "number") return String(r);
  if (!r) return "";
  if (typeof r == "function")
    return r[f] ? e(r()) : "";
  if (Array.isArray(r)) {
    let t = "";
    for (let o = 0; o < r.length; o++) {
      const i = e(r[o]);
      i && (t += (t ? " " : "") + i);
    }
    return t;
  }
  let n = "";
  for (const t in r)
    r[t] && (n += (n ? " " : "") + t);
  return n;
}
function p(...r) {
  return e(r);
}
function y(r) {
  if (r == null || r === !1 || r === !0)
    return [];
  if (Array.isArray(r)) {
    const n = [];
    for (let t = 0; t < r.length; t++) n.push(...y(r[t]));
    return n;
  }
  return c(r) ? [r] : [document.createTextNode(String(r))];
}
function u(r) {
  if (typeof r == "string") {
    const n = document.querySelector(r);
    if (!n) throw new Error(`[mini-q] Nenhum elemento para o seletor "${r}".`);
    return n;
  }
  return r;
}
export {
  f as S,
  s as T,
  d as a,
  p as c,
  u as g,
  c as i,
  e as r,
  y as t
};
