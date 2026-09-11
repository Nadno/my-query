import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('tabs: abas com seleção, painel correto e aria wired', async ({ page }) => {
  await page.goto('/examples/wai-aria/tabs.html');

  const descricao = page.getByRole('tab', { name: 'Descrição' });
  const teclado = page.getByRole('tab', { name: 'Teclado' });

  // aba inicial ativa + apenas ela no tab order
  await expect(descricao).toHaveAttribute('aria-selected', 'true');
  await expect(teclado).toHaveAttribute('aria-selected', 'false');
  await expect(descricao).toHaveAttribute('tabindex', '0');
  await expect(teclado).toHaveAttribute('tabindex', '-1');

  // painel visível corresponde à aba
  await expect(page.getByRole('tabpanel')).toContainText('economizam espaço');
  await expect(descricao).toHaveAttribute('aria-controls', 'panel-descricao');

  // clicar troca a aba e o painel
  await teclado.click();
  await expect(descricao).toHaveAttribute('aria-selected', 'false');
  await expect(teclado).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('roving tabindex');
});

test('tabs: setas mudam a aba ativa; Home/End vão às pontas', async ({ page }) => {
  await page.goto('/examples/wai-aria/tabs.html');

  const descricao = page.getByRole('tab', { name: 'Descrição' });
  const teclado = page.getByRole('tab', { name: 'Teclado' });
  const marca = page.getByRole('tab', { name: 'Marcação' });

  await descricao.focus();
  await page.keyboard.press('ArrowRight');
  await expect(teclado).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('End');
  await expect(marca).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('role=tablist');

  await page.keyboard.press('Home');
  await expect(descricao).toHaveAttribute('aria-selected', 'true');

  // loop: ArrowLeft da primeira vai para a última
  await page.keyboard.press('ArrowLeft');
  await expect(marca).toHaveAttribute('aria-selected', 'true');
});
