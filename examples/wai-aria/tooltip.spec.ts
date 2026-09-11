import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('tooltip: mostra no hover e esconde ao sair', async ({ page }) => {
  await page.goto('/examples/wai-aria/tooltip.html');

  const imprimir = page.getByRole('button', { name: 'Imprimir' });
  const tip = page.getByRole('tooltip', { name: /Exporta a página em PDF/ });

  // inicialmente invisível e descrito pelo trigger
  await expect(tip).not.toBeVisible();
  await expect(imprimir).toHaveAttribute('aria-describedby', 'tip-imprimir');

  await imprimir.hover();
  await expect(tip).toBeVisible();
  await expect(tip).toHaveAttribute('data-show', 'true');

  await page.mouse.move(5, 5); // fora
  await expect(tip).not.toBeVisible();
});

test('tooltip: mostra no foco via teclado', async ({ page }) => {
  await page.goto('/examples/wai-aria/tooltip.html');

  const salvar = page.getByRole('button', { name: 'Salvar rascunho' });
  const tip = page.getByRole('tooltip', { name: /Mantém o texto/ });

  await salvar.focus();
  await expect(tip).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(tip).not.toBeVisible();
});
