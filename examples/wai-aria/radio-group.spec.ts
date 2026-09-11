import { test, expect } from '@playwright/test';
import { serveLibsLocal } from './support';

test.beforeEach(async ({ page }) => {
  await serveLibsLocal(page);
});

test('radio-group: clique seleciona, aria-checked e tabindex roving', async ({ page }) => {
  await page.goto('/examples/wai-aria/radio-group.html');

  const free = page.getByRole('radio', { name: 'Gratuito' });
  const pro = page.getByRole('radio', { name: 'Profissional' });
  const team = page.getByRole('radio', { name: 'Time' });

  // primeiro marcado, e é o único no tab order
  await expect(free).toHaveAttribute('aria-checked', 'true');
  await expect(free).toHaveAttribute('tabindex', '0');
  await expect(pro).toHaveAttribute('tabindex', '-1');

  // clique troca a seleção e move o tabindex para o item focado
  await pro.click();
  await expect(free).toHaveAttribute('aria-checked', 'false');
  await expect(pro).toHaveAttribute('aria-checked', 'true');

  // clicar já foca; a seleção segue a opção clicada
  await team.click();
  await expect(team).toHaveAttribute('aria-checked', 'true');
});

test('radio-group: setas movem e selecionam; Home/End vão às pontas', async ({ page }) => {
  await page.goto('/examples/wai-aria/radio-group.html');

  const free = page.getByRole('radio', { name: 'Gratuito' });
  const pro = page.getByRole('radio', { name: 'Profissional' });
  const team = page.getByRole('radio', { name: 'Time' });

  await free.focus();
  await page.keyboard.press('ArrowDown');
  await expect(pro).toHaveAttribute('aria-checked', 'true');
  await expect(pro).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await expect(team).toHaveAttribute('aria-checked', 'true');

  // loop: de Time (último) para Gratuito (primeiro)
  await page.keyboard.press('ArrowDown');
  await expect(free).toHaveAttribute('aria-checked', 'true');

  // End → último; Home → primeiro (com seleção)
  await page.keyboard.press('End');
  await expect(team).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Home');
  await expect(free).toHaveAttribute('aria-checked', 'true');
});

test('radio-group: regra allowAllUnchecked:false — a seleção nunca fica vazia', async ({ page }) => {
  await page.goto('/examples/wai-aria/radio-group.html');

  const free = page.getByRole('radio', { name: 'Gratuito' });
  const team = page.getByRole('radio', { name: 'Time' });

  await expect(free).toHaveAttribute('aria-checked', 'true');

  // como sempre há um selecionado, "desmarcar" a marcação atual re-seleciona o próprio
  await free.click();
  await expect(free).toHaveAttribute('aria-checked', 'true');

  // e trocar segue normal
  await team.click();
  await expect(free).toHaveAttribute('aria-checked', 'false');
  await expect(team).toHaveAttribute('aria-checked', 'true');
});
