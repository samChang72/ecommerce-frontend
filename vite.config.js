import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'
  
  return {
    plugins: [vue()],
    base: isProduction ? '/ecommerce-frontend/' : '/', // 開發時使用根路徑，建置時使用 GitHub Pages 路徑
    build: {
      outDir: 'docs', // 將輸出目錄改為 docs
    },
    publicDir: 'public', // 確保 public 資料夾被啟用
    server: {
      host: '0.0.0.0', // 允許外部訪問
      port: 3000,
      open: true // 自動開啟瀏覽器
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      open: true
    }
  }
});
