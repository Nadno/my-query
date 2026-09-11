import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('switch: alterna aria-checked no clique e no teclado', async ({ page }) => {
  await page.goto('/examples/wai-aria/switch.html');

  const notif = page.getByRole('switch', { name: 'Notificações' });
  const som = page.getByRole('switch', { name: 'Som' });

  await expect(notif).toHaveAttribute('aria-checked', 'true');
  await expect(som).toHaveAttribute('aria-checked', 'false');

  await som.click();
  await expect(som).toHaveAttribute('aria-checked', 'true');

  som.focus();
  await page.keyboard.press('Enter');
  await expect(som).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press(' ');
  await expect(som).toHaveAttribute('aria-checked', 'true');
});

test('switch: fundo reflete o estado checked (regressão do estilo aninhado inline)', async ({ page }) => {
  await page.goto('/examples/wai-aria/switch.html');

  // Notificações inicia checked=true → o fundo deve ser o azul "on" (#3b82f6),
  // não o grisalho do estado off. Regride se o `&[aria-checked]` não for compilado.
  const notif = page.getByRole('switch', { name: 'Notificações' });
  await expect(notif).toHaveCSS('background-color', 'rgb(59, 130, 246)');

  // desligar → volta ao estado off (grisalho translúcido)
  await notif.click();
  await expect(notif).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.12)');
});

test('switch: grupo exclusivo (multiple:false) desmarca o outro', async ({ page }) => {
  await page.goto('/examples/wai-aria/switch.html');

  const claro = page.getByRole('switch', { name: 'Claro' });
  const escuro = page.getByRole('switch', { name: 'Escuro' });

  await expect(claro).toHaveAttribute('aria-checked', 'true');

  await escuro.click();
  await expect(claro).toHaveAttribute('aria-checked', 'false');
  await expect(escuro).toHaveAttribute('aria-checked', 'true');
});

test('switch: allowAllUnchecked:false mantém pelo menos um ligado', async ({ page }) => {
  await page.goto('/examples/wai-aria/switch.html');

  const claro = page.getByRole('switch', { name: 'Claro' });
  const escuro = page.getByRole('switch', { name: 'Escuro' });
  const auto = page.getByRole('switch', { name: 'Automático' });

  // desligar o claro → grupo re-liga o claro (não fica tudo off)
  await claro.click();
  await expect(claro).toHaveAttribute('aria-checked', 'true');
  await expect(escuro).toHaveAttribute('aria-checked', 'false');
  await expect(auto).toHaveAttribute('aria-checked', 'false');

  // ligar o escuro → claro cai
  await escuro.click();
  await expect(claro).toHaveAttribute('aria-checked', 'false');
  await expect(escuro).toHaveAttribute('aria-checked', 'true');
});
