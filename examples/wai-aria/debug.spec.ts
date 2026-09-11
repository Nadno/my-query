import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test('diagnóstico: pageerror e console', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('requestfailed', (req) =>
    errors.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`),
  );

  await serveLibsLocal(page);
  await page.goto('/examples/wai-aria/disclosure.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  process.stdout.write(`\n=== ERROS ===\n${errors.join('\n') || '(nenhum)'}\n`);

  const btn = page.getByRole('button', { name: /O que é o mini-q/ });
  await btn.click();
  await page.waitForTimeout(200);
  process.stdout.write(`após clique: ${await btn.getAttribute('aria-expanded')}\n`);
});
