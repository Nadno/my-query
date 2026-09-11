import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

/**
 * Spec estático — valida o caminho real de produção (import map + dist/ via CDN),
 * servido por um static file server (sem o vite dev server resolvendo bare
 * specifiers). Reproduz o bug de "Failed to resolve module specifier" quando o
 * import map de um exemplo não declara um módulo que ele importa.
 */

const STATIC = 'http://127.0.0.1:5174';

const EXAMPLES = [
  'switch',
  'radio-group',
  'tabs',
  'accordion',
  'slider',
  'tooltip',
  'menu-button',
  'combobox',
  'dialog',
  'disclosure',
];

const pageErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  pageErrors.length = 0;
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors.push(`console: ${msg.text()}`);
  });
  await serveLibsLocal(page);
});

for (const name of EXAMPLES) {
  test(`estático: ${name} monta no servidor de arquivos (import map real, sem pageerror)`, async ({
    page,
  }) => {
    await page.goto(`${STATIC}/examples/wai-aria/${name}.html`);

    // o app monta de verdade (não só o HTML servir)
    await expect(page.locator('#app')).not.toBeEmpty();

    // nenhum erro de resolução de módulo nem pageerror
    expect(pageErrors).toEqual([]);
  });
}

test('estático: dialog fecha com Esc e devolve o foco ao trigger', async ({ page }) => {
  await page.goto(`${STATIC}/examples/wai-aria/dialog.html`);

  const trigger = page.getByRole('button', { name: 'Abrir diálogo' });
  const dialog = page.getByRole('dialog', { name: 'Confirmação' });

  await trigger.click();
  await expect(dialog).toBeVisible();

  // o modal auto-foca o primeiro focável (Cancelar) — Esc só fecha com o foco dentro
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
