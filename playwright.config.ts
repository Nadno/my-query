import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './examples/wai-aria',
  testMatch: '*.spec.ts',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      // Serve a raiz do repo com static file serving (Node puro, sem python) — caminho
      // real do CDN (import map sem resolução de bare specifiers pelo vite). Usado
      // pelos specs estáticos e pelo `npm run serve:aria`.
      command: 'node scripts/serve.mjs 5174',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
