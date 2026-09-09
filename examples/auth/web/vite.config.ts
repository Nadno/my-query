import { defineConfig } from 'vite';
import type { ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

const webDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

export default defineConfig({
  root: webDir,
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  optimizeDeps: { exclude: ['mini-q'] },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (err, _req, res) => {
            console.error('[vite proxy /api]', err.message);
            const out = res as ServerResponse;
            if (out && typeof out.writeHead === 'function' && !out.headersSent) {
              out.writeHead(503, { 'Content-Type': 'application/json' });
              out.end(JSON.stringify({ error: 'API indisponível' }));
            }
          });
        },
      },
    },
    fs: { allow: [repoRoot] },
  },
});
