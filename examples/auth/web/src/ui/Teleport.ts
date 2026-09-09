import $, { $mount, $onUnmounted } from 'mini-q';
import type { Child } from 'mini-q';

function resolveTarget(target: string | Element): Element {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error(`[mini-q] Teleport: alvo não encontrado (${String(target)}).`);
  return el;
}

/**
 * Renderiza `children` em outro lugar da DOM, fora da árvore do componente pai.
 * Útil para modais, toasts e overlays que precisam escapar de `overflow:hidden`
 * ou de contextos de empilhamento (z-index) do pai.
 *
 * Retorna um comentário placeholder no local original para manter o lifecycle.
 */
export function Teleport(p: { target: string | Element; children: Child }) {
  const target = resolveTarget(p.target);

  const unmount = $mount(target, () => p.children);
  $onUnmounted(unmount);

  return document.createComment('teleport');
}
