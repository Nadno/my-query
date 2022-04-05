export const serialize = (obj, fns) => (
  fns && Array.isArray(fns) && fns.forEach((fn) => fn.call(obj, obj)), obj
);
