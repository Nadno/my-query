/// <reference types="vitest" />

import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer(),
  ],
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
