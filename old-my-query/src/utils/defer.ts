export const defer = (callback: AnyFunction) =>
  setTimeout(() => callback(), 10);
