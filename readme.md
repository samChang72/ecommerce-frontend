# E-commerce Frontend

Vue.js 3 電商前端應用程式，使用 Vite 建置並部署到 GitHub Pages。

## 🚀 開發指令

### 本地開發
```bash
# 啟動開發服務器
npm run dev

# 開發服務器（含提示訊息）
npm run dev:info

# 本地測試（含網址提示）
npm run test:local
```

**本地開發網址**: http://localhost:3000/ecommerce-frontend/

### 建置與部署

#### 建置專案
```bash
# 建置專案（包含 Facebook Feed 同步）
npm run build

# 僅同步 Facebook Feed
npm run update-facebook-feed

# 建置同步（與 npm run build 相同）
npm run build:sync
```

#### 部署到 GitHub Pages
```bash
# 完整部署流程
npm run build
git add .
git commit -m "build for GitHub Pages"
git push
```

**線上網址**: https://samchang72.github.io/ecommerce-frontend/

### 預覽建置結果
```bash
# 預覽生產建置
npm run preview
```

**預覽網址**: http://localhost:4173/ecommerce-frontend/

## 📋 專案架構

### 技術堆疊
- **前端框架**: Vue.js 3 with Composition API
- **建置工具**: Vite
- **狀態管理**: Pinia
- **路由**: Vue Router 4
- **UI 框架**: Ant Design Vue 4.2.6
- **部署**: GitHub Pages

### 重要檔案
- `src/pages/` - Vue 頁面組件
- `src/store/cart.js` - Pinia 購物車狀態管理
- `src/assets/products.json` - 產品資料
- `docs/` - 建置輸出目錄（用於 GitHub Pages）
- `docs/facebook-feed.json` - Facebook 產品目錄
- `scripts/update-facebook-feed.js` - Facebook Feed 更新腳本

## ⚙️ 配置說明

### 路徑配置
- **Base Path**: `/ecommerce-frontend/`（開發和生產環境一致）
- **輸出目錄**: `docs/`（而非預設的 `dist/`）
- **伺服器端口**: 3000（開發）/ 4173（預覽）

### 自動化流程
1. `npm run build` 會自動執行 `update-facebook-feed` 更新產品目錄
2. 建置過程不會刪除既有的文檔文件（facebook-feed.json、GTM-DataLayer-Integration.md 等）
3. 所有靜態資源會複製到 `docs/` 目錄供 GitHub Pages 使用

## 📊 GTM 整合

專案整合了 Google Tag Manager (GTM) 進行電商事件追蹤：

- **事件追蹤**: add_to_cart, view_item, begin_checkout, purchase, sign_up
- **第三方整合**: Facebook Pixel, OneAD Pixel
- **文檔**: `docs/GTM-DataLayer-Integration.md`

## 🔗 相關連結

- **開發環境**: http://localhost:3000/ecommerce-frontend/
- **生產環境**: https://samchang72.github.io/ecommerce-frontend/
- **Facebook Feed**: https://samchang72.github.io/ecommerce-frontend/facebook-feed.json