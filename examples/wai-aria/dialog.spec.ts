import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('dialog: abre, foca o primeiro elemento, fecha com Esc e Confirma', async ({ page }) => {
  await page.goto('/examples/wai-aria/dialog.html');

  const trigger = page.getByRole('button', { name: 'Abrir diálogo' });
  const dialog = page.getByRole('dialog', { name: 'Confirmação' });

  await trigger.click();
  await expect(dialog).toBeVisible();

  // aria-modal + labelling
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog).toHaveAttribute('aria-labelledby', 'dial-title');

  // foco entra no dialog (autoFocus → primeiro focável: botão Cancelar)
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();

  // Esc fecha
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('dialog: foco fica preso — Tab não escapa do modal', async ({ page }) => {
  await page.goto('/examples/wai-aria/dialog.html');

  await page.getByRole('button', { name: 'Abrir diálogo' }).click();
  const cancel = page.getByRole('button', { name: 'Cancelar' });
  const confirm = page.getByRole('button', { name: 'Confirmar' });

  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Tab');
  // wraps de volta para o primeiro (trap via sentinelas)
  await expect(cancel).toBeFocused();
});

test('dialog: Confirmar marca e fecha; backdrop fecha', async ({ page }) => {
  await page.goto('/examples/wai-aria/dialog.html');

  const dialog = page.getByRole('dialog', { name: 'Confirmação' });

  await page.getByRole('button', { name: 'Abrir diálogo' }).click();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('main')).toContainText('Confirmado!');

  // reabre e fecha pelo backdrop
  await page.getByRole('button', { name: 'Abrir diálogo' }).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});
