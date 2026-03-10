import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  assetsInclude: ['**/*.json'],
  build: {
    outDir: 'dist',
  },
});
