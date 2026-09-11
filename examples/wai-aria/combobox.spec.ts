import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('combobox: abre com busca, filtra e mantém o destaque', async ({ page }) => {
  await page.goto('/examples/wai-aria/combobox.html');

  const input = page.getByRole('combobox', { name: 'Fruta' });
  const listbox = page.getByRole('listbox', { name: 'Fruta' });

  // abre com foco; destaque no primeiro item via activedescendant
  await input.focus();
  await expect(listbox).toBeVisible();
  await expect(input).toHaveAttribute('aria-activedescendant', 'opt-0');

  // filtra: só frutas que começam com "ma" (Maçã, Manga)
  await input.fill('ma');
  await expect(listbox.getByRole('option')).toHaveCount(2);
  await expect(input).toHaveAttribute('aria-activedescendant', 'opt-0');

  // seta desce: destacado vira o segundo
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'opt-1');
  await expect(listbox.getByRole('option', { name: 'Manga' })).toHaveAttribute('aria-selected', 'true');
});

test('combobox: Enter escolhe e fecha; Esc fecha', async ({ page }) => {
  await page.goto('/examples/wai-aria/combobox.html');

  const input = page.getByRole('combobox', { name: 'Fruta' });
  const listbox = page.getByRole('listbox', { name: 'Fruta' });

  await input.focus();
  await page.keyboard.type('m');
  await expect(listbox).toBeVisible();

  await page.keyboard.press('ArrowDown'); // segunda opção "Manga"
  await page.keyboard.press('Enter');
  await expect(listbox).toBeHidden();
  await expect(input).toHaveValue('Manga');
  await expect(page.locator('.status')).toContainText('Manga');

  await input.focus();
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
});

test('combobox: clique seleciona a opção direto', async ({ page }) => {
  await page.goto('/examples/wai-aria/combobox.html');

  const input = page.getByRole('combobox', { name: 'Fruta' });
  const listbox = page.getByRole('listbox', { name: 'Fruta' });

  await input.focus();
  await listbox.getByRole('option', { name: 'Laranja' }).click();
  await expect(listbox).toBeHidden();
  await expect(input).toHaveValue('Laranja');
});
