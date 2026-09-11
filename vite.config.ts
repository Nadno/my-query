import { defineConfig } from 'vite';

/**
 * Config do demo (index.html). O build da lib mora em `vite.lib.config.ts`
 * (`npm run build:lib` → `dist/`); o demo builda para `dist-demo/` para não
 * conflitar com o artefato versionado da lib.
 */
export default defineConfig({
  build: {
    outDir: 'dist-demo',
  },
});
