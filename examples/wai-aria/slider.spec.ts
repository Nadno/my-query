import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('slider: atributos de valor e mudança por teclado', async ({ page }) => {
  await page.goto('/examples/wai-aria/slider.html');

  const volume = page.getByRole('slider', { name: 'Volume' });

  await expect(volume).toHaveAttribute('aria-valuemin', '0');
  await expect(volume).toHaveAttribute('aria-valuemax', '100');
  await expect(volume).toHaveAttribute('aria-valuenow', '40');

  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveAttribute('aria-valuenow', '45');
  await page.keyboard.press('ArrowDown');
  await expect(volume).toHaveAttribute('aria-valuenow', '40');

  await page.keyboard.press('Home');
  await expect(volume).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('End');
  await expect(volume).toHaveAttribute('aria-valuenow', '100');
});

test('slider: PageUp/PageDown em passos maiores e clamp nos extremos', async ({ page }) => {
  await page.goto('/examples/wai-aria/slider.html');

  const brilho = page.getByRole('slider', { name: 'Brilho' });
  await expect(brilho).toHaveAttribute('aria-valuenow', '70');

  await brilho.focus();
  await page.keyboard.press('PageUp');
  await expect(brilho).toHaveAttribute('aria-valuenow', '90');

  // 90 → 70 → 50 → 30 → 10 → 0 (clamp)
  for (let i = 0; i < 4; i++) await page.keyboard.press('PageDown');
  await expect(brilho).toHaveAttribute('aria-valuenow', '10');
  await page.keyboard.press('PageDown');
  await expect(brilho).toHaveAttribute('aria-valuenow', '0');

  // ArrowLeft no mínimo fica no mínimo
  await page.keyboard.press('ArrowLeft');
  await expect(brilho).toHaveAttribute('aria-valuenow', '0');
});
