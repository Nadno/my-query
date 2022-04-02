const siblings = {
  next(query) {
    return this._getSibling('nextElementSibling', query);
  },

  prev(query) {
    return this._getSibling('previousElementSibling', query);
  },

  _getSibling(sibling, query) {
    let $next = this.element[sibling];

    while ($next && !$next.matches(query)) {
      $next = $next[sibling];
    }

    return $($next);
  },

  nexts(query, max) {
    return this._getSiblings('nextElementSibling', query, max);
  },

  prevs(query, max) {
    return this._getSiblings('previousElementSibling', query, max);
  },

  _getSiblings(sibling, query, max = 0) {
    const result = max > 1 ? Array(max) : [];
    if (max === 0) max = 1000;

    let $next = this.element[sibling],
      count = 0;

    while ($next && count < max) {
      if ($next.matches(query)) {
        result[count] = $next[sibling];
        count++;
      }

      $next = $next[sibling];
    }

    return result;
  },
};

export default siblings;
