import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    write: false,
    rollupOptions: {
      input: {
        app: 'test/app/src/main.ts',
      },
    },
  },
});
