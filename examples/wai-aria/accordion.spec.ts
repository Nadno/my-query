import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('accordion single: abrir uma fecha a outra; sempre uma aberta', async ({ page }) => {
  await page.goto('/examples/wai-aria/accordion.html');

  const single = page.getByRole('group', { name: /Perguntas frequentes/ });
  const first = single.getByRole('button', { name: /O que é o mini-q/ });
  const second = single.getByRole('button', { name: /Preciso de build/ });

  // estado inicial: primeira aberta
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  // abrir a segunda fecha a primeira (single)
  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'false');

  // painel correspondente visível
  const region = single.locator('[role=region]', { hasText: 'import map' });
  await expect(region).toBeVisible();
});

test('accordion: painel aponta pro header via aria-labelledby', async ({ page }) => {
  await page.goto('/examples/wai-aria/accordion.html');

  const single = page.getByRole('group', { name: /Perguntas frequentes/ });
  const headerId = await single
    .getByRole('button', { name: /Preciso de build/ })
    .getAttribute('id');
  const region = single.locator('#p-build');
  await expect(region).toHaveAttribute('aria-labelledby', headerId);
});

test('accordion múltiplo: dois painéis abertos juntos', async ({ page }) => {
  await page.goto('/examples/wai-aria/accordion.html');

  const multi = page.getByRole('group', { name: /Vários abertos/ });
  const first = multi.getByRole('button', { name: /O que é o mini-q/ });
  const second = multi.getByRole('button', { name: /Preciso de build/ });

  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  await second.click();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
});
