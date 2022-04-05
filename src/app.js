'use strict';

import { serialize } from './utils';

import attributeDecorator from './attribute';
import querySelectionDecorator from './querySelection';

const myQuery = (() => {
  const proto = serialize({}, [querySelectionDecorator, attributeDecorator]);

  function myQuery(element) {
    if (element == null) return null;
    if (typeof element == 'string') element = getElement(element);
    if (!(element instanceof Element)) return null;

    return Object.create(proto, {
      element: { value: element },
    });
  }

  function getElement(element) {
    const isId = element.startsWith('#');
    if (isId) {
      const id = element.replace(/^#/, '');
      return document.getElementById(id);
    }

    return document.querySelector(element);
  }

  return myQuery;
})();

window.myQuery = window.$ = myQuery;
