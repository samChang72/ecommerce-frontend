# 庫存同步功能規格書（方案 A：GitHub Actions 全自動）

> 文件對象：RD
> 撰寫角色：PM
> 版本：v1.0（2026-07-24）
> 相關文件：[product-items-and-sets-spec.md](./product-items-and-sets-spec.md)

---

## 1. 背景與目標

本站為 GitHub Pages 純靜態託管（`main` 分支 `/docs` 目錄），無後端伺服器。商品資料 `src/assets/products.json` 於 build 時打包，Meta 目錄 feed（`docs/data.xml`、`docs/data-rss.xml`、`docs/facebook-feed.json`）由 `scripts/update-facebook-feed.js` 產出為靜態檔。

**目標**：使用者完成結帳後，自動扣減對應商品庫存，並讓三個 feed 檔案的 `availability`（及庫存量）同步更新，全程不引入資料庫或常駐後端。

**非目標（Non-goals）**：
- 即時防超賣（本站無真實金流，允許數分鐘延遲）
- 付款、物流、訂單管理系統
- 庫存回補介面（初期直接改 JSON + commit）

---

## 2. 系統架構總覽

```
使用者結帳（CheckoutPage submitOrder）
        │  POST { order_id, items:[{id, qty}] }
        ▼
Cloudflare Worker（中繼層，持有 GitHub Token）
        │  驗證 payload → POST /repos/{owner}/{repo}/dispatches
        ▼
GitHub Action（repository_dispatch: purchase，concurrency 序列化）
        │  1. 扣減 data/stock.json
        │  2. 執行 scripts/update-facebook-feed.js 重產三個 feed + docs/stock.json
        │  3. git commit + push
        ▼
GitHub Pages 自動重新部署
        │
        ├── Meta 依排程抓取 data-rss.xml / data.xml（availability 已更新）
        └── 前端 runtime fetch docs/stock.json（頁面顯示最新庫存）
```

**設計要點**：庫存不放進 `products.json`（它被打包進 JS bundle，改動需完整 rebuild），而是獨立成 `stock.json` 由前端 runtime 讀取。如此每筆訂單只需改兩個 JSON + 重產 feed，Action 不必跑 `npm run build`。

---

## 3. 資料模型

### 3.1 `data/stock.json`（庫存唯一真實來源，source of truth）

```json
{
  "1": 20,
  "2": 15,
  "3": 5
}
```

- Key：商品 id（字串型別，對應 `products.json` 的 `id`）
- Value：現有庫存量（整數，≥ 0）
- 初始值由 PM 提供（demo 可統一設 20）

### 3.2 `docs/stock.json`（部署版）

- 由 Action 從 `data/stock.json` 複製產生，供前端 fetch
- URL：`https://samchang72.github.io/ecommerce-frontend/stock.json`

### 3.3 `products.json`

- **不變更**。商品靜態屬性（名稱、價格、圖片、分類）維持現狀。

---

## 4. 前端變更（`src/pages/CheckoutPage.vue`）

### 4.1 送出訂單

`submitOrder` 在既有 GTM `purchase` 事件之後，新增呼叫中繼 API：

```
POST https://<worker-subdomain>.workers.dev/order
Content-Type: application/json

{
  "order_id": "ORDER_xxx",          // 沿用既有產生的 orderId
  "items": [
    { "id": 1, "qty": 2 },
    { "id": 3, "qty": 1 }
  ]
}
```

- **Fire-and-forget**：API 失敗不阻擋結帳流程（catch 後僅 console.warn），使用者體驗不受影響
- 既有 GTM `purchase` dataLayer push 完全不動

### 4.2 庫存顯示（Phase 3）

- HomePage / ProductPage 於 mounted 時 fetch `stock.json`（加 `?t=<timestamp>` 避免快取）
- `stock === 0` 顯示「售完」並 disable 加入購物車按鈕
- fetch 失敗時 fallback 為可購買（不阻擋 demo 動線）

---

## 5. 中繼層（Cloudflare Worker）

前端無法安全持有 GitHub Token，需一層中繼。

**職責**：
1. CORS：僅允許 `https://samchang72.github.io`
2. Payload 驗證（不合格回 `400`）：
   - `order_id`：非空字串，長度 ≤ 64
   - `items`：非空陣列，長度 ≤ 50
   - `items[].id`：正整數；`items[].qty`：1–99 整數
3. 呼叫 GitHub API：

```
POST https://api.github.com/repos/samchang72/ecommerce-frontend/dispatches
Authorization: Bearer <GITHUB_TOKEN>   // Worker Secret，絕不進前端或 repo

{
  "event_type": "purchase",
  "client_payload": { "order_id": "...", "items": [...] }
}
```

4. 成功回 `202 Accepted`

**Token 規格**：Fine-grained PAT，僅授權本 repo、僅 `Contents: Read and write` 權限。

**Rate limiting**（建議）：同 IP 每分鐘 ≤ 10 次，超出回 `429`。

---

## 6. GitHub Action（`.github/workflows/purchase-sync.yml`）

```yaml
on:
  repository_dispatch:
    types: [purchase]

concurrency:
  group: inventory-sync
  cancel-in-progress: false     # 排隊執行，不取消 → 序列化避免競態
```

**步驟**：
1. `actions/checkout`（`ref: main`）
2. `node scripts/decrement-stock.js '<client_payload JSON>'`
3. `node scripts/update-facebook-feed.js`（一併輸出 `docs/stock.json`）
4. `git commit`（訊息格式：`chore: 訂單 <order_id> 扣減庫存`）
5. `git push`；若因遠端更新失敗 → `git pull --rebase` 後重試一次

---

## 7. 扣庫存腳本（`scripts/decrement-stock.js`）

**輸入**：argv 帶入 `client_payload` JSON

**邏輯**：
1. 讀取 `data/stock.json`
2. 逐項處理 `items`：`newStock = Math.max(0, stock - qty)`
   - 未知商品 id → 跳過並輸出警告（不中斷）
   - 扣減後為 0 → log 標示「售完」
3. 以 immutable 方式產生新物件後寫回

**冪等性（Phase 4，選配）**：維護 `data/processed-orders.json` 記錄已處理的 `order_id`；重複 dispatch 直接跳過，防止 Meta 重送或使用者重整造成重複扣減。

---

## 8. Feed 輸出變更（`scripts/update-facebook-feed.js`）

1. 新增讀取 `data/stock.json`
2. 三種 feed 的 `availability` 改為動態：
   - `stock > 0` → `in stock`
   - `stock === 0` → `out of stock`
3. RSS / XML feed 新增 `<g:quantity_to_sell_on_facebook>`（值 = 現有庫存），供 Meta 端庫存顯示
4. 一併輸出部署版 `docs/stock.json`（供前端 runtime 讀取）
5. Feed URL 不變，Meta 商務管理員設定無需調整

---

## 9. 併發與競態處理

| 情境 | 處理方式 |
|---|---|
| 兩筆訂單幾乎同時送出 | Action `concurrency` group 排隊序列化，後到的 run 讀到前一筆已 commit 的庫存 |
| push 時遠端已有新 commit（人工改動） | `git pull --rebase` 後重試一次；仍失敗則 Action 標紅 |
| 同一訂單重複觸發 | Phase 4 冪等機制（processed-orders） |
| 庫存不足仍下單 | 允許（無真實金流），扣至 0 為止並 log |

---

## 10. 安全性檢查清單

- [ ] GitHub Token 僅存於 Worker Secret，前端程式碼與 repo 中不出現
- [ ] Token 為 fine-grained、單 repo、僅 Contents 權限
- [ ] Worker 驗證所有輸入欄位（型別、範圍、長度）
- [ ] CORS 僅允許正式站 origin
- [ ] Rate limiting 防濫發 dispatch

---

## 11. 驗收條件（Acceptance Criteria）

1. 完成結帳後 3 分鐘內：`docs/stock.json`、`data.xml`、`data-rss.xml`、`facebook-feed.json` 中對應商品庫存/availability 均已更新
2. 庫存扣至 0 的商品，三個 feed 的 `availability` 均為 `out of stock`
3. 連續兩筆訂單（間隔 < 10 秒）均被處理，總扣減量正確、無互相覆蓋
4. Worker 對缺欄位、負數 qty、超長陣列等無效 payload 回 `400`
5. 前端 API 呼叫失敗時，結帳成功訊息與導頁流程不受影響
6. 商品頁在庫存為 0 時顯示售完狀態（Phase 3）

---

## 12. 分階段實作計畫

| Phase | 內容 | 驗證方式 |
|---|---|---|
| 1 | 建立 `data/stock.json`；`update-facebook-feed.js` 讀庫存輸出 availability 與 quantity | 本地跑 script，檢查三個 feed 輸出兩種狀態（有庫存 / 售完）皆正確 |
| 2 | Worker + `repository_dispatch` + Action + `decrement-stock.js` | curl 打 Worker，確認 Action 執行、commit 產生、feed 更新 |
| 3 | 前端結帳串接 Worker；商品頁 runtime 讀 `stock.json` 顯示庫存 | 線上實際下單，3 分鐘內確認全鏈路 |
| 4（選配） | 冪等（processed-orders）、失敗通知、rate limiting | 重送同 order_id 不重複扣減 |
