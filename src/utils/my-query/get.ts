import getElement from '../getElement';

export const get = <T extends Element>(query: string): T | null => {
  const element = getElement(query);
  if (!element) throw new Error(`Could not find the element "${query}"`);
  return element as T;
};
