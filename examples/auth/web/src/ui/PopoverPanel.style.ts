// Solução paliativa: o panel do Popover é teleportado para o body, então precisa de
// uma classe standalone. Quando a engine suportar estilos "outer" (<name ou style.scope),
// isso volta a ser uma parte de sPopover.
import { style } from 'mini-q/style';

export const sPopoverOuterPanel = style('popover-outer-panel', {
  position: 'fixed',
  minWidth: 180,
  padding: 'var(--space-sm)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 'var(--z-popover)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
});
