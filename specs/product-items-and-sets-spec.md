# 商品項目與商品組合 — 功能規格書（給 RD）

| 項目 | 內容 |
|---|---|
| 文件版本 | v1.0 |
| 撰寫角色 | Product Manager |
| 對象 | 前後端 RD |
| 狀態 | Draft / 待評估 |
| 視覺參考 | `mockups/catalog-manager.html`（可互動原型） |
| 資料參考 | `catalog_products.csv`（Meta 目錄欄位）、`src/assets/products.json`、`docs/data.xml` |

---

## 1. 背景與目標

我們的目錄資料（`data.xml` / feed）已可上架 Meta，但目前缺少**站內自管的目錄後台**。本規格定義兩個核心模組，讓營運人員不需進 Meta 後台即可檢視商品上架狀態、並將商品分群供廣告投放使用。

- **商品項目（Product Items）**：目錄內所有商品的清單、狀態與診斷。
- **商品組合（Product Sets）**：以「篩選條件」把商品動態分群，作為廣告投放的商品池。

### 成功指標
1. 營運可在清單頁 3 秒內找到任一商品並看到其上架狀態。
2. 可用篩選條件建立商品組合，且組合會隨 feed 更新自動重算成員。

---

## 2. 名詞定義

| 名詞 | 說明 |
|---|---|
| 目錄 Catalog | 一組商品資料的容器，對應一份 feed。 |
| 商品項目 Item | 目錄中的單一商品，唯一鍵為 `content_id`（本專案格式 `DB_<id>`）。 |
| 商品組合 Product Set | 依條件動態圈選的商品子集合；**動態**＝feed 更新後成員自動重算。 |
| 篩選條件 Filter | `屬性 + 運算子 + 值` 的三元組。 |
| 資料來源 Data Source | 商品資料的匯入方式（feed 排程 / 手動上傳 / Pixel）。 |

> ⚠️ 重要澄清：商品組合的篩選屬性（含 `gender`、`age_group`）是**商品屬性**，非受眾資料。受眾在廣告層另行設定，本規格不涵蓋。

---

## 3. 範圍

**In scope**：商品項目清單/狀態/診斷、資料來源設定、商品組合建構器（篩選引擎）。

**Out of scope**：廣告建立與受眾設定、金流/庫存扣減、Pixel/CAPI 事件蒐集實作（僅需串接既有 `item_id = DB_<id>` 契約）。

---

## 4. 使用者故事

- US-1｜身為營運，我想看到所有商品與其上架狀態，以便快速發現被拒登的商品。
- US-2｜身為營運，我想用名稱或 Content ID 搜尋商品，以便定位單一品項。
- US-3｜身為營運，我想設定 feed 自動抓取排程，以便商品資料定期同步。
- US-4｜身為行銷，我想用「售價 < 100 的飲料」這類條件建立商品組合，供動態廣告投放。
- US-5｜身為行銷，我想在建立組合時即時看到符合的商品數，以判斷組合規模是否足夠。

---

## 5. 商品項目（Product Items）

### 5.1 資料模型（欄位規格，對齊 Meta 目錄）

| 欄位 | key | 必填 | 型別 | 規則 |
|---|---|---|---|---|
| 內容編號 | `id` | ✅ | string | 全目錄唯一；本專案 `DB_<id>`，須等於站上 dataLayer 的 `item_id`。上限 100 字。 |
| 標題 | `title` | ✅ | string | ≤ 200 字。 |
| 說明 | `description` | ✅ | string | 純文字、非全大寫，≤ 9999 字。 |
| 供應狀況 | `availability` | ✅ | enum | `in stock` / `out of stock`。 |
| 商品狀況 | `condition` | ✅ | enum | `new` / `used` / `refurbished`。 |
| 價格 | `price` | ✅ | money | `數字 + 空格 + ISO4217`，小數點用 `.`，例 `30.00 TWD`。 |
| 商品頁網址 | `link` | ✅ | url | 可購買的商品頁。 |
| 主圖 | `image_link` | ✅ | url | JPG/PNG/GIF，≥ 500×500。非 ASCII 檔名須 percent-encode。 |
| 品牌 | `brand` | ✅ | string | ≤ 100 字。 |
| Google 產品類別 | `google_product_category` | 建議 | string | 官方分類字串。 |
| 優惠價 | `sale_price` | 選填 | money | 同 price 格式。 |
| 商品群組編號 | `item_group_id` | 選填 | string | 同款變體共用。 |
| 變體屬性 | `gender` `color` `size` `age_group` `material` `pattern` | 選填 | string/enum | 服飾類建議填。 |
| 自訂標籤 | `custom_label_0..4` | 選填 | string | 供分群/報表使用。 |
| GTIN | `gtin` | 選填 | string | 建議補以提升比對率。 |

### 5.2 清單頁

- **統計卡**：商品總數 / 使用中 / 有問題 / 上次同步時間。
- **工具列**：
  - 搜尋框：對 `title` 與 `id` 做**不分大小寫的 contains** 比對。
  - 篩選 chip：`狀態`（使用中/有問題）、`供應狀況`（有庫存/缺貨）。
- **表格欄位**：勾選框、商品（縮圖＋名稱＋產品類型）、Content ID、產品類型、供應狀況、價格、狀態。
- **縮圖**：載入失敗需 fallback（原型用品類 emoji；正式版建議用預設佔位圖）。
- **批次操作**：表頭全選；選取後可批次匯出/停用（v1 先做全選 UI，動作可 stub）。
- **分頁**：商品數 > 50 時需分頁或無限捲動（RD 擇一，建議 cursor-based）。

### 5.3 資料來源

| 方式 | 需求 |
|---|---|
| Data feed | 輸入 feed URL（如 `…/data.xml`）＋**排程**（每小時/每日）；記錄上次成功時間與結果。 |
| 手動上傳 | 支援 XML / CSV / TSV / Google 試算表。 |
| Pixel | 依瀏覽事件自動建立商品（v1 可僅顯示未連結狀態）。 |

### 5.4 診斷（Diagnostics）

系統需檢查並列出問題項，每則含：等級（錯誤/警告）、標題、受影響商品數、說明。至少涵蓋：
1. **缺必填欄位**（如缺 `image_link`）→ 該商品不上架。
2. **Content ID 與 Pixel 事件不符** → `item_id` 未對齊 `<g:id>`，無法歸因。
3. **建議補 `gtin` / `brand`** → 提升 Advantage+ 比對率。

---

## 6. 商品組合（Product Sets）

### 6.1 建立流程

1. 輸入**名稱**（必填）。
2. 開關「使用篩選條件」：
   - **開**：顯示篩選建構器，組合為**動態**（feed 更新後重算）。
   - **關**：改為手動從右側清單挑選商品（v1 可先做 UI）。
3. 設定一或多條篩選條件。
4. 右側即時顯示符合的商品與數量。
5. 按「建立」儲存。

### 6.2 篩選條件建構器

一條條件 = `屬性(attr) + 運算子(op) + 值(value)`。多條件之間以**比對模式**串接：

- **所有篩選條件**＝ AND（every）
- **至少一個篩選條件**＝ OR（some）

#### 6.2.1 屬性清單與型別（共 22 項）

| 型別 | 屬性 |
|---|---|
| number | `price` 價格、`sale_price` 優惠價 |
| select | `gender` 性別、`age_group` 年齡層、`availability` 供應狀況、`condition` 商品狀況 |
| text | `item_group_id`、`id`、`title`、`description`、`product_type`、`google_product_category`、`brand`、`color`、`size`、`material`、`pattern`、`custom_label_0..4` |

#### 6.2.2 運算子（依屬性型別）

| 型別 | 可用運算子 |
|---|---|
| number | 大於 / 小於 / 等於 / 不等於 / 大於或等於 / 小於或等於 |
| text | 包含 / 不包含 / 等於 / 不等於 |
| select | 等於 / 不等於 |

#### 6.2.3 值輸入元件（依型別）

| 型別 | 元件 |
|---|---|
| number | 幣別下拉（TWD/USD/EUR/JPY/GBP）＋金額輸入；幣別符號隨選擇變動。 |
| text | 文字輸入框。 |
| select | 該屬性的選項下拉。 |

> 切換屬性時：運算子重設為該型別第一個、值清空、幣別回 TWD。

### 6.3 比對邏輯（RD 實作依據，pseudocode）

```
matched(products, state):
  if not state.useFilter: return products
  active = [f for f in state.filters if isComplete(f)]     # 不完整條件忽略
  if active is empty: return products                       # 無有效條件 → 全部
  return [p for p in products if
            state.matchType == 'all' ? all(eval(p,f) for f in active)
                                     : any(eval(p,f) for f in active)]

isComplete(f):
  a = attrDef(f.attr)
  if not a or not f.op: return false
  if a.type == number: return f.value != '' and isNumber(f.value)
  return f.value != ''

eval(p, f):                    # 回傳 boolean
  pv = p[f.attr]
  number: 依運算子做數值比較；pv 或 value 非數字 → false
  select: 等於/不等於 做字串相等比較
  text  : 包含/不包含/等於/不等於，皆 lower-case 後比較
```

比對規則重點：
- 不完整條件（缺值）**不影響結果**（略過）。
- 無任何有效條件時，組合＝全部商品。
- `sale_price` 等空值欄位在數值比較時視為不符（false）。

### 6.4 即時預覽（右側面板）

- 標頭：`N 商品` / `N 款式`＝符合條件的商品數。
- 搜尋框：在**已符合條件**的結果中，再依名稱/編號過濾顯示（不改變 N）。
- 商品列：縮圖、名稱、價格、`內容編號：DB_x`、⋯選單。
- **商品選擇量表**：填滿比例 = 符合數 / 目錄總數，兩端標示「受限 ↔ 廣泛」。
- 空狀態：無符合條件時顯示提示文案。

### 6.5 編輯輔助

- `＋ 新增其他篩選條件`：新增一列（預設 `標題 / 包含 / 空值`）。
- 每列在總數 > 1 時提供「移除」。
- `清除所有篩選條件`：重置為單一空條件。
- **取消 / 重做（Undo/Redo）**：需維護條件狀態歷史堆疊；按鈕依可用性 enable/disable。
- 底部：`取消`（返回）、`建立`（儲存並回饋結果）。
- AI 生成篩選框：v1 為展示用途，實作可延後（需標示「測試階段，儲存前請檢查」）。

---

## 7. 建議資料結構與 API（方向，細節由 RD 決定）

```jsonc
// Product Set 儲存結構
{
  "id": "set_xxx",
  "name": "飲料",
  "useFilter": true,
  "matchType": "all",              // all | any
  "filters": [
    { "attr": "product_type", "op": "等於", "value": "飲料" },
    { "attr": "price", "op": "小於", "value": "100", "currency": "TWD" }
  ]
}
```

建議端點：
- `GET /catalog/items?search=&status=&availability=&cursor=`
- `GET /catalog/diagnostics`
- `POST /catalog/data-sources`（feed URL + 排程）
- `GET/POST/PUT/DELETE /product-sets`
- `POST /product-sets/preview`（傳 filters，回符合商品數與清單）— 供即時預覽，避免前端持有全量目錄。

---

## 8. 邊界情況與驗證

1. 名稱空白 → 阻擋建立並提示。
2. 條件值含特殊字元 / 引號 → 需轉義，勿造成 XSS 或查詢錯誤。
3. 數值條件輸入非數字 / 負值 → 視為不完整，忽略。
4. 目錄商品數大（>1 萬）→ 預覽走後端查詢，勿在前端全量比對。
5. feed 抓取失敗 → 資料來源顯示錯誤與上次成功時間，不覆寫既有資料。
6. i18n：全介面繁體中文；商品屬性值可能為多語系文字，比對需支援 Unicode。

---

## 9. 非功能需求

- 清單頁首屏 < 1.5s；預覽查詢 < 500ms（1 萬商品內）。
- 篩選比對須不分大小寫且支援中日文字元。
- 縮圖延遲載入（lazy load）。

---

## 10. 驗收條件（Acceptance Criteria）

- [ ] 商品清單可搜尋、可依狀態/供應狀況篩選、縮圖失敗有 fallback。
- [ ] 診斷至少列出缺必填、Content ID 不符兩類問題。
- [ ] 資料來源可設定 feed URL 與排程並記錄結果。
- [ ] 商品組合支援 22 屬性 × 對應運算子 × 三種值輸入。
- [ ] AND / OR 比對正確；不完整條件被忽略；無條件＝全部。
- [ ] 右側即時更新符合數與量表；Undo/Redo 正常。
- [ ] 組合可儲存為第 7 節結構並在 feed 更新後重算成員。

---

## 11. 待確認（Open Questions）

1. 商品組合是否需要跨目錄？（v1 假設單一目錄）
2. 手動挑選模式（關閉篩選）是否納入 v1？
3. AI 生成篩選條件的優先度與資料來源？
4. 診斷規則清單是否需與 Meta 官方診斷完全對齊，或先做核心三類？
