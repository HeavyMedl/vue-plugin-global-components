import vuePlugin from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: './src/main.ts',
      fileName: 'global-component-plugin',
      formats: ['es'],
    },
  },
  plugins: [
    vuePlugin(),
    dts({
      insertTypesEntry: true,
      exclude: ['test', 'vite.config.ts', 'vitest.config.ts'],
    }),
  ],
});
