import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page, Route } from '@playwright/test';

/**
 * E2E helper — serve o `dist/` da lib localmente, interceptando as requisições
 * ao CDN (jsdelivr) referenciado no import map de cada exemplo. Assim os specs
 * rodam offline e sempre contra o build local (não contra o branch no GitHub).
 */

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SIGNALS = path.join(ROOT, 'node_modules', '@preact', 'signals-core', 'dist');

const GH_MINIQ = /^\/gh\/Nadno\/my-query@[^/]*\/dist\//;
const NPM_SIGNALS = /^\/npm\/@preact\/signals-core@[^/]*\//;

async function fulfillFile(route: Route, rel: string, base: string) {
  try {
    const abs = path.join(base, ...rel.split('/'));
    const body = await readFile(abs);
    await route.fulfill({
      status: 200,
      contentType: abs.endsWith('.js') ? 'text/javascript' : 'application/octet-stream',
      body,
    });
  } catch {
    await route.fulfill({ status: 404, body: 'not found' });
  }
}

export async function serveLibsLocal(page: Page) {
  await page.route('**/cdn.jsdelivr.net/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    if (GH_MINIQ.test(p)) return fulfillFile(route, p.replace(GH_MINIQ, ''), DIST);
    if (NPM_SIGNALS.test(p)) return fulfillFile(route, p.replace(NPM_SIGNALS, ''), SIGNALS);
    await route.abort();
  });
}
