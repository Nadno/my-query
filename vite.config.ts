/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
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
