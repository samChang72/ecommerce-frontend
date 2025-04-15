import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/ecommerce-frontend/', // 設定基底路徑
  build: {
    outDir: 'docs', // 將輸出目錄改為 docs
  },
});
