export function getIntroSection() {
  return `**什麼是 OnePixel？**
OnePixel 是部署在網站上的追蹤程式碼，用於追蹤使用者行為並將資料回傳至OneAD廣告平台。
目的：

* 測量廣告成效
* 優化廣告投放
* 建立再行銷受眾

**所需項目，兩個部分：**

* 初始化程式碼 – 所有頁面都需部署
* 事件程式碼 –追蹤重要行為（例：商品瀏覽、註冊會員、加入購物車、結帳、完成購買）

**OneAD 的 Click ID：opi 字串是什麼？**
opi 是 OneAD產生的追蹤參數，當用戶點擊廣告時，此參數會自動附加在廣告到達網址中，並一併傳遞至廣告主網站。透過 opi，可以更準確歸因轉換事件，了解不同廣告成效來源，並協助擴大再行銷與受眾觸及。此機制不會影響您既有的追蹤參數設定，可與 UTM 或其他分析工具並用。`
}

export function getEcommerceTable() {
  return `**電子商務廣告主，事件設定建議：**

| 事件 | 建議觸發時機 | 建議參數 | 目的 |
| :---: | :---: | :---: | :---: |
| **PageView** | 所有頁面 | – | 基礎流量追蹤 |
| **ViewContent** | 商品頁 | content_ids, content_type, contents, value, currency | 追蹤商品瀏覽興趣 |
| **AddToCart** | 加入購物車 | content_ids, content_type, contents, value, currency | 追蹤購物車行為， 利於再行銷 |
| **InitiateCheckout** | 開始結帳 | content_ids, contents, num_items, value, currency | 追蹤結帳行為 |
| **Purchase** | 完成購買 | content_ids, content_type, contents, num_items, value, currency | 追蹤營收成效與 計算投資報酬率 |

電子商務廣告主而言，設定參數可以幫助更精確追蹤每筆訂單的商品明細與數量，並紀錄訂單金額與貨幣，方便分析營收及投資報酬率 (ROAS)，同時支援更精準的再行銷與廣告優化。

**若曾設定過META Dynamic Product Ads需要的電商轉換事件，可沿用相同的參數邏輯與觸發條件。**`
}

export function getEventExample(eventType, eventId) {
  if (eventType === 'ViewContent') {
    return `頁面瀏覽（ViewContent）為例：

\`\`\`
<script>
  // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）
  // 除了 OneAD 事件代碼ID 之外，您還需要自行加入其他的屬性，包含：商品編號、價格等
  onep('track', 'ViewContent', {
    id: '${eventId}',  // 必填，為OneAD 事件代碼ID
    content_ids: ['SKU0001'],  // 必填，商品 ID
    content_name: '商品名稱',  // 商品名稱
    content_category: '商品分類',  // 商品分類
    content_type: 'product',  // 內容類型
    value: 1299,  // 必填，商品價格
    currency: 'TWD'  // 必填，幣別
  });
</script>
\`\`\``
  }

  if (eventType === 'AddToCart') {
    return `以加入購物車（Add To Cart）為例：

\`\`\`
<script>
  // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）
  onep('track', 'AddToCart', {
    id: '${eventId}',  // 必填，為OneAD 事件代碼ID
    content_ids: ['SKU0001'],  // 必填，商品 ID
    content_name: '夏季高跟涼鞋',  // 商品名稱
    content_category: '涼鞋類',  // 商品分類
    content_type: 'product',  // 內容類型
    value: 1299,  // 必填，加入購物車總價
    currency: 'TWD'  // 必填，幣別
  });
</script>
\`\`\``
  }

  if (eventType === 'InitiateCheckout') {
    return `以點擊結帳（Initiate Checkout）為例：

\`\`\`
<script>
  // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）
  onep('track', 'InitiateCheckout', {
    id: '${eventId}',  // 必填，為OneAD 事件代碼ID
    content_ids: ['SKU0001'],  // 必填，商品 ID
    content_name: '夏季高跟涼鞋',  // 商品名稱
    content_category: '涼鞋類',  // 商品分類
    content_type: 'product',  // 內容類型
    value: 1299,  // 必填，點擊結帳總價
    currency: 'TWD'  // 必填，幣別
  });
</script>
\`\`\``
  }

  if (eventType === 'Purchase') {
    return `以完成購買（Purchase）為例：

\`\`\`
<script>
  // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）
  onep('track', 'Purchase', {
    id: '${eventId}',  // 必填，為OneAD 事件代碼ID
    content_ids: ['SKU0001', 'SKU0002'],  // 必填，所有購買商品的 ID 陣列
    value: 2500,  // 必填，交易總金額
    currency: 'TWD',  // 必填，幣別
    transaction_id: '00120001',  // 訂單編號
    num_items: 2  // 購買商品總數
  });
</script>
\`\`\``
  }

  if (eventType === 'Lead') {
    return `按鈕點擊（Lead）為例：

\`\`\`
<script>
  // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）
  onep('track', 'Lead', {
    content_name: 'lead',
    id: '${eventId}'
  });
</script>
\`\`\``
  }

  return ''
}

export function getPropertiesTable() {
  return `**物件屬性 (Object Properties)**
上述部署情境舉例之外，電子商務廣告主可以在支援的標準事件中，依據需求使用以下的預設物件屬性。請使用 JSON 格式來構建參數物件資料，然後傳入事件函式中。

| 屬性名稱 | 資料型別 | 說明 |
| :---: | :---: | ----- |
| content_category | string | 頁面或商品的分類 |
| content_ids | array of integers  or strings | 與事件關聯的商品 ID，例如 SKU：['AA0001', 'BB0001'] |
| content_name | string | 頁面或**商品**的名稱 |
| content_type | string | 根據傳入的 content_ids 或 contents，可設為 product 或 product_group。如果content_ids 或 contents 參數中傳送的編號為產品編號，此值應該為 product。如果傳送產品群組編號，此值應該為 product_group。 |
| contents | array of objects | 包含商品識別碼（如 EAN）、數量與價格的 JSON 陣列；必須包含 id 和 quantity 屬性 |
| currency | string | value 的幣別 |
| delivery_category | string | 配送方式；支援值包括：in_store（店內取貨）、curbside（路邊取貨）、home_delivery（宅配） |
| num_items | integer | 在開始結帳時的商品數量，適用於 InitiateCheckout 事件。 |
| predicted_ltv | integer, float | 廣告主自行定義的預測客戶終身價值。 |
| search_string | string | 使用者的搜尋字串，用於 Search 事件。 |
| status | Boolean | 用於 CompleteRegistration 事件，表示註冊狀態。 |
| value | integer or float | 適用於所有使用價值優化的事件，為必填項目。需填入數值，且代表金額，例如購買事件的訂單金額。 |`
}
