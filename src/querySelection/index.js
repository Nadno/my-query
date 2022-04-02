import siblings from './siblings';

export default function querySelectionDecorator(proto) {
  function find(query) {
    return $(this.element.querySelector(query));
  }

  function findAll(query) {
    return Array.from(this.element.querySelectorAll(query));
  }

  function child(query) {
    return this.element.querySelector(`:scope > ${query}`);
  }

  function children(query) {
    return Array.from(this.element.querySelectorAll(`:scope > ${query}`));
  }

  function closest(query) {
    return this.element.closest(query);
  }

  return Object.assign(
    proto,
    {
      find,
      findAll,
      child,
      children,
      closest,
    },
    siblings
  );
}
