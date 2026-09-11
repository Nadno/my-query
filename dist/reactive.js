import { r as o } from "./lifecycle.js";
let e = null;
function c(n) {
  e = n;
}
function r() {
  if (!e)
    throw new Error(
      "[mini-q] Nenhum adapter de reatividade instalado. Chame $.useSignal(adapter) antes."
    );
  return e;
}
function a(n) {
  return e != null && e.isSignal(n);
}
function u(n) {
  return typeof n == "function" || a(n);
}
function l(n) {
  return e && e.untrack ? e.untrack(n) : n();
}
function d(n) {
  const t = r();
  if (!t.signal)
    throw new Error(
      "[mini-q] O adapter instalado não implementa `signal`; necessário para $.media/estado reativo."
    );
  return t.signal(n);
}
function p(n, t) {
  const i = r();
  i.setValue ? i.setValue(n, t) : n.value = t;
}
function s(n) {
  return a(n) ? r().getValue(n) : typeof n == "function" ? n() : n;
}
function g(n, t) {
  if (u(n)) {
    const i = r().effect(() => t(s(n)));
    o(i);
  } else
    t(n);
}
export {
  g as bind,
  d as createSignal,
  r as getAdapter,
  u as isReactive,
  a as isSignal,
  s as read,
  p as setValue,
  l as untrack,
  c as useSignal
};
