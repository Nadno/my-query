import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/**
 * Build de lib — ESM multi-entry, self-contained (sem hash), para publicar o
 * `dist/` e importar via CDN/import map (jsdelivr, GitHub Pages).
 *
 * Entries espelham os `exports` do package.json. `@preact/signals-core` fica
 * external (o consumidor pluga o adapter; o bundle não embute a lib de signals).
 */
export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        style: fileURLToPath(new URL('./src/style/index.ts', import.meta.url)),
        reactive: fileURLToPath(new URL('./src/reactive.ts', import.meta.url)),
        events: fileURLToPath(new URL('./src/events/index.ts', import.meta.url)),
        'adapters/preact': fileURLToPath(
          new URL('./src/adapters/preact.ts', import.meta.url),
        ),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@preact/signals-core'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
