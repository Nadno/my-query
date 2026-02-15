/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'happy-dom',
  },
  build: {
    minify: 'esbuild',
    lib: {
      entry: resolve(__dirname, 'src', 'main.ts'),
      name: 'myQuery',
      fileName: 'my-query',
    },
  },
});
