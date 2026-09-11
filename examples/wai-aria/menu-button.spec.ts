import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('menu-button: abre no clique, seleciona item e fecha', async ({ page }) => {
  await page.goto('/examples/wai-aria/menu-button.html');

  const trigger = page.getByRole('button', { name: /Arquivo/ });
  const menu = page.getByRole('menu', { name: 'Arquivo' });

  await expect(menu).toBeHidden();

  await trigger.click();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('menuitem', { name: 'Salvar', exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('.status')).toContainText('Salvar');
});

test('menu-button: setas movem o foco entre itens; Esc fecha', async ({ page }) => {
  await page.goto('/examples/wai-aria/menu-button.html');

  const trigger = page.getByRole('button', { name: /Arquivo/ });
  const items = page.getByRole('menuitem');

  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(0)).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(items.nth(0)).toBeFocused();

  // loop: ArrowUp do primeiro → último
  await page.keyboard.press('ArrowUp');
  await expect(items.nth(3)).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', { name: 'Arquivo' })).toBeHidden();
});

test('menu-button: clique fora fecha o menu', async ({ page }) => {
  await page.goto('/examples/wai-aria/menu-button.html');

  const menu = page.getByRole('menu', { name: 'Arquivo' });

  await page.getByRole('button', { name: /Arquivo/ }).click();
  await expect(menu).toBeVisible();

  await page.mouse.click(10, 10);
  await expect(menu).toBeHidden();
});
