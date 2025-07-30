import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ command }) => {
  const isProduction = command === 'build'
  
  return {
    plugins: [vue()],
    base: '/ecommerce-frontend/', // 開發和生產都使用相同的基礎路徑
    build: {
      outDir: 'docs', // 將輸出目錄改為 docs
      emptyOutDir: false, // 保留現有檔案，不清空輸出目錄
    },
    publicDir: 'public', // 確保 public 資料夾被啟用
    server: {
      host: '0.0.0.0', // 允許外部訪問
      port: 3000,
      open: '/ecommerce-frontend/', // 自動開啟瀏覽器並導向正確路徑
      strictPort: false // 允許自動選擇其他端口
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      open: '/ecommerce-frontend/', // 預覽時也使用正確路徑
      strictPort: true
    }
  }
});
