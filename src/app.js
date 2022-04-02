'use strict';

import querySelectionDecorator from './querySelection';

const myQuery = (() => {
  const proto = querySelectionDecorator({});

  return function myQuery(element) {
    if (element == null) return;
    if (typeof element == 'string') element = document.querySelector(element);

    if (typeof element == 'string') element = document.querySelector(element);
    if (!(element instanceof Element)) return null;

    return Object.assign(Object.create(proto), {
      element,
    });
  };
})();

window.myQuery = window.$ = myQuery;
