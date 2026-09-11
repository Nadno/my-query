import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('disclosure: painel começa aberto e alterna com o clique', async ({ page }) => {
  await page.goto('/examples/wai-aria/disclosure.html');

  const firstButton = page.getByRole('button', { name: /O que é o mini-q/ });
  const panel = page.locator(`#${await firstButton.getAttribute('aria-controls')}`);

  // estado inicial: primeiro aberto (expanded=true), demais não
  await expect(firstButton).toHaveAttribute('aria-expanded', 'true');

  const second = page.getByRole('button', { name: /Preciso de build/ });
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  // clicar fecha o primeiro e abre o segundo
  await firstButton.click();
  await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  await second.click();
  await expect(second).toHaveAttribute('aria-expanded', 'true');

  // region label -> o painel aponta pro botão
  const region = second.locator('xpath=..').locator('[role=region]');
  await expect(region).toHaveAttribute('aria-labelledby', await second.getAttribute('id'));
});

test('disclosure: teclado — Enter e Espaço alternam', async ({ page }) => {
  await page.goto('/examples/wai-aria/disclosure.html');

  const firstButton = page.getByRole('button', { name: /O que é o mini-q/ });
  await firstButton.focus();
  await page.keyboard.press('Enter');
  await expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press(' ');
  await expect(firstButton).toHaveAttribute('aria-expanded', 'true');
});
