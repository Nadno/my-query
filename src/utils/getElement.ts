export default function getElement(element: string) {
  const isId = element.startsWith('#');
  if (isId) {
    const id = element.replace(/^#/, '');
    return document.getElementById(id);
  }

  return document.querySelector(element);
}
