export default function attributeDecorator(myQuery) {
  function has(element, name) {
    return element.hasAttribute(name);
  }

  function get(element, ...names) {
    if (!names.length)
      throw new TypeError('Argument name expected to get the attribute');
    if (names.length > 1)
      return names.map((name) => name && element.getAttribute(name));
    return element.getAttribute(names[0]);
  }

  function set(element, name, value) {
    name.startsWith('on')
      ? setEventAttribute(element, name, value)
      : element.setAttribute(name, value);
    return this;
  }

  function setEventAttribute(element, name, fns) {
    const evt = name.replace(/^on/, '').toLowerCase();
    Array.isArray(fns)
      ? fns.forEach((fn) => element.addEventListener(evt, fn))
      : element.addEventListener(evt, fns);
  }

  function remove(element, ...names) {
    names.forEach((name) => element.removeAttribute(name));
    return this;
  }

  function assign(_, attrs) {
    for (const name in attrs) {
      this.set(name, attrs[name]);
    }
    return this;
  }

  return Object.defineProperty(myQuery, 'attr', {
    get() {
      const attribute = {};
      const bind = (fn) => fn.bind(attribute, this.element);

      return Object.assign(attribute, {
        has: bind(has),
        get: bind(get),
        set: bind(set),
        remove: bind(remove),
        assign: bind(assign),
      });
    },
  });
}
