import vuePlugin from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vuePlugin()],
  test: {
    include: ['**/*.{spec,test}.{mjs,js,ts}'],
    coverage: {
      exclude: ['test/*', 'src/types'],
    },
  },
});
