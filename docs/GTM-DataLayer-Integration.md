# GTM Data Layer 整合說明文件

## 📋 概述

本文件說明如何在 Vue.js 電商網站中整合 Google Tag Manager (GTM) 的 Data Layer，以追蹤使用者的購物行為，包括加入購物車、移除商品、查看商品和開始結帳等事件。

## 🔄 資料流程

```
使用者操作 → Vue.js 事件處理 → Data Layer 推送 → GTM 接收 → 第三方追蹤工具 (Facebook Pixel, OneAD Pixel 等)
```

## 🛒 支援的電商事件

### 1. 加入購物車 (add_to_cart)
- **觸發時機**: 使用者點擊「加入購物車」按鈕
- **觸發位置**: 首頁產品列表、產品詳細頁面

### 2. 移除購物車 (remove_from_cart)  
- **觸發時機**: 使用者在購物車頁面移除商品
- **觸發位置**: 購物車頁面

### 3. 查看商品 (view_item)
- **觸發時機**: 使用者進入產品詳細頁面
- **觸發位置**: 產品詳細頁面

### 4. 開始結帳 (begin_checkout)
- **觸發時機**: 使用者點擊「結帳」按鈕
- **觸發位置**: 購物車頁面

### 5. 頁面瀏覽 (page_view)
- **觸發時機**: 使用者切換頁面/路由
- **觸發位置**: 所有頁面的路由變更

## 📊 Data Layer 資料結構

### 標準電商事件格式 (符合 GA4 規範)

```javascript
window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 30.00,
    items: [{
      item_id: '1',
      item_name: '可樂',
      category: '飲料',
      price: 30.00,
      quantity: 1
    }]
  }
})
```

## 💻 程式實作範例

### 1. 首頁 - 加入購物車 (HomePage.vue)

```vue
<template>
  <div class="homepage">
    <!-- 產品列表 -->
    <div class="products">
      <ul>
        <li v-for="product in filteredProducts" :key="product.id" class="product-item">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <strong>{{ product.name }}</strong>
            <p class="price">價格: ${{ product.price }}</p>
          </div>
          <!-- 加入購物車按鈕 -->
          <button @click="addToCart(product)" class="add-to-cart-btn">
            加入購物車
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useCartStore } from '../store/cart'
import productsData from '../assets/products.json'

export default {
  name: 'HomePage',
  setup() {
    const cartStore = useCartStore()
    
    // 加入購物車功能
    const addToCart = (product) => {
      // 1. 更新購物車狀態
      cartStore.addToCart(product)
      
      // 2. 發送 GTM 事件到 Data Layer
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'add_to_cart',
          ecommerce: {
            currency: 'USD',
            value: parseFloat(product.price),
            items: [{
              item_id: product.id.toString(),
              item_name: product.name,
              category: product.type,
              price: parseFloat(product.price),
              quantity: 1
            }]
          }
        })
        
        // 3. Debug 日誌
        console.log('GTM add_to_cart event sent:', {
          item_name: product.name,
          item_id: product.id,
          price: product.price,
          category: product.type
        })
      }
      
      // 4. 使用者回饋
      alert(`${product.name} 已加入購物車！`)
    }
    
    return {
      addToCart
      // ... 其他返回值
    }
  }
}
</script>
```

### 2. 產品頁面 - 查看商品與加入購物車 (ProductPage.vue)

```vue
<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'
import productsData from '../assets/products.json'

export default {
  name: 'ProductPage',
  setup() {
    const route = useRoute()
    const cartStore = useCartStore()
    
    const product = computed(() => {
      const productId = parseInt(route.params.id)
      return productsData.find(p => p.id === productId)
    })
    
    // 當頁面載入時發送查看商品事件
    onMounted(() => {
      if (product.value && typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            currency: 'USD',
            value: parseFloat(product.value.price),
            items: [{
              item_id: product.value.id.toString(),
              item_name: product.value.name,
              category: product.value.type,
              price: parseFloat(product.value.price),
              quantity: 1
            }]
          }
        })
        
        console.log('GTM view_item event sent:', {
          item_name: product.value.name,
          item_id: product.value.id,
          price: product.value.price
        })
      }
    })
    
    // 加入購物車
    const handleAddToCart = () => {
      if (product.value) {
        cartStore.addToCart(product.value)
        
        // 發送 GTM 事件
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'add_to_cart',
            ecommerce: {
              currency: 'USD',
              value: parseFloat(product.value.price),
              items: [{
                item_id: product.value.id.toString(),
                item_name: product.value.name,
                category: product.value.type,
                price: parseFloat(product.value.price),
                quantity: 1
              }]
            }
          })
          
          console.log('GTM add_to_cart event sent from ProductPage')
        }
        
        alert(`${product.value.name} 已加入購物車！`)
      }
    }
    
    return {
      product,
      handleAddToCart
    }
  }
}
</script>
```

### 3. 購物車頁面 - 移除商品與開始結帳 (CartPage.vue)

```vue
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'

const router = useRouter()
const cartStore = useCartStore()
const { items } = cartStore

// 移除購物車商品
const removeFromCart = (itemId) => {
  const itemToRemove = items.find(item => item.id === itemId)
  
  if (itemToRemove) {
    // 發送 GTM 事件 - 移除商品
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
          currency: 'USD',
          value: parseFloat(itemToRemove.price) * itemToRemove.qty,
          items: [{
            item_id: itemToRemove.id.toString(),
            item_name: itemToRemove.name,
            category: itemToRemove.type,
            price: parseFloat(itemToRemove.price),
            quantity: itemToRemove.qty
          }]
        }
      })
      
      console.log('GTM remove_from_cart event sent:', {
        item_name: itemToRemove.name,
        item_id: itemToRemove.id,
        quantity: itemToRemove.qty
      })
    }
    
    // 執行移除操作
    cartStore.removeFromCart(itemId)
  }
}

// 開始結帳
const goToCheckout = () => {
  // 發送 GTM 事件 - 開始結帳
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'USD',
        value: parseFloat(totalPrice.value),
        items: items.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name,
          category: item.type,
          price: parseFloat(item.price),
          quantity: item.qty
        }))
      }
    })
    
    console.log('GTM begin_checkout event sent:', {
      total_value: totalPrice.value,
      item_count: items.length
    })
  }
  
  // 導向結帳頁面
  router.push('/checkout')
}

const totalPrice = computed(() => {
  return items.reduce((total, item) => total + (item.price * item.qty), 0)
})
</script>
```

### 4. 路由追蹤 - 頁面瀏覽事件 (router/index.js)

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
// ... 路由配置

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // ... 路由定義
  ]
})

// GTM 頁面追蹤
router.afterEach((to) => {
  // 確保 GTM dataLayer 存在
  if (typeof window !== 'undefined' && window.dataLayer) {
    // 發送頁面瀏覽事件到 GTM
    window.dataLayer.push({
      event: 'page_view',
      page_title: to.meta?.title || document.title,
      page_location: window.location.href,
      page_path: to.path
    })
    
    console.log('GTM page_view event sent:', {
      page_path: to.path,
      page_title: to.meta?.title || document.title
    })
  }
})

export default router
```

## 🔧 GTM 設定指南

### GTM 變數設定

在 GTM 後台建立以下資料層變數 (Data Layer Variable)：

| 變數名稱 | 變數類型 | 資料層變數名稱 | 說明 |
|----------|----------|----------------|------|
| `DLV - Item ID` | 資料層變數 | `ecommerce.items.0.item_id` | 商品 ID |
| `DLV - Item Name` | 資料層變數 | `ecommerce.items.0.item_name` | 商品名稱 |
| `DLV - Item Price` | 資料層變數 | `ecommerce.items.0.price` | 商品價格 |
| `DLV - Item Category` | 資料層變數 | `ecommerce.items.0.category` | 商品類別 |
| `DLV - Item Quantity` | 資料層變數 | `ecommerce.items.0.quantity` | 商品數量 |
| `DLV - Ecommerce Value` | 資料層變數 | `ecommerce.value` | 交易總值 |
| `DLV - Currency` | 資料層變數 | `ecommerce.currency` | 幣別 |
| `DLV - Event Name` | 資料層變數 | `event` | 事件名稱 |

### GTM 觸發條件設定

建立以下自訂事件觸發條件：

| 觸發條件名稱 | 觸發條件類型 | 條件設定 |
|-------------|-------------|----------|
| `Trigger - Add to Cart` | 自訂事件 | 事件名稱等於 `add_to_cart` |
| `Trigger - Remove from Cart` | 自訂事件 | 事件名稱等於 `remove_from_cart` |
| `Trigger - View Item` | 自訂事件 | 事件名稱等於 `view_item` |
| `Trigger - Begin Checkout` | 自訂事件 | 事件名稱等於 `begin_checkout` |
| `Trigger - Page View` | 自訂事件 | 事件名稱等於 `page_view` |

### OneAD Pixel 整合

OneAD Pixel 也支援電商事件追蹤，以下是對照表：

| GTM Event | OneAD Pixel Event | 參數格式 |
|-----------|------------------|----------|
| `add_to_cart` | `addToCart` | `{ product_id, value, currency }` |
| `view_item` | `viewContent` | `{ product_id, content_type }` |
| `begin_checkout` | `initiateCheckout` | `{ value, currency, num_items }` |

#### OneAD Pixel 代碼範例：

```html
<!-- AddToCart 事件 -->
<script>
if (typeof onead !== 'undefined') {
  onead('track', 'addToCart', {
    product_id: '{{DLV - Item ID}}',
    value: {{DLV - Item Price}},
    currency: 'USD'
  });
}
</script>

<!-- ViewContent 事件 -->
<script>
if (typeof onead !== 'undefined') {
  onead('track', 'viewContent', {
    product_id: '{{DLV - Item ID}}',
    content_type: 'product'
  });
}
</script>

<!-- InitiateCheckout 事件 -->
<script>
if (typeof onead !== 'undefined') {
  onead('track', 'initiateCheckout', {
    value: {{DLV - Ecommerce Value}},
    currency: 'USD',
    num_items: {{DLV - Cart Items Count}}
  });
}
</script>
```

### Facebook Pixel 事件對照表

本表格整理了 GTM Data Layer 事件與 Facebook Pixel 標準事件的對應關係：

| GTM Event | Facebook Pixel Event | 說明 | 觸發時機 |
|-----------|---------------------|------|----------|
| `add_to_cart` | `AddToCart` | 加入購物車 | 使用者點擊「加入購物車」按鈕 |
| `remove_from_cart` | *(自訂事件)* | 移除購物車 | 使用者在購物車頁面移除商品 |
| `view_item` | `ViewContent` | 查看內容 | 使用者進入產品詳細頁面 |
| `begin_checkout` | `InitiateCheckout` | 開始結帳 | 使用者點擊「結帳」按鈕 |
| `page_view` | `PageView` | 頁面瀏覽 | 自動追蹤頁面載入 |

### Facebook Pixel 參數對照表

| 參數用途 | GTM 變數 | Facebook Pixel 參數 | 資料類型 | 範例值 |
|----------|----------|-------------------|----------|--------|
| 商品 ID | `{{DLV - Item ID}}` | `content_ids` | Array | `['1']` |
| 商品名稱 | `{{DLV - Item Name}}` | `content_name` | String | `'可樂'` |
| 商品類別 | `{{DLV - Item Category}}` | `content_category` | String | `'飲料'` |
| 商品價格 | `{{DLV - Item Price}}` | `value` | Number | `30.00` |
| 幣別 | `'USD'` | `currency` | String | `'USD'` |
| 內容類型 | `'product'` | `content_type` | String | `'product'` |
| 數量 | `{{DLV - Item Quantity}}` | `num_items` | Number | `1` |

### 第三方追蹤代碼範例

#### 1. AddToCart 事件 (加入購物車)
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('track', 'AddToCart', {
    content_ids: ['{{DLV - Item ID}}'],
    content_name: '{{DLV - Item Name}}',
    content_category: '{{DLV - Item Category}}',
    content_type: 'product',
    value: {{DLV - Item Price}},
    currency: 'USD',
    num_items: 1
  });
}
</script>
```

#### 2. ViewContent 事件 (查看商品)
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('track', 'ViewContent', {
    content_ids: ['{{DLV - Item ID}}'],
    content_name: '{{DLV - Item Name}}',
    content_category: '{{DLV - Item Category}}',
    content_type: 'product',
    value: {{DLV - Item Price}},
    currency: 'USD'
  });
}
</script>
```

#### 3. InitiateCheckout 事件 (開始結帳)
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('track', 'InitiateCheckout', {
    content_ids: [{{DLV - Cart Item IDs}}], // 陣列格式: ['1', '2', '3']
    value: {{DLV - Ecommerce Value}},
    currency: 'USD',
    num_items: {{DLV - Cart Items Count}}
  });
}
</script>
```

#### 4. 自訂移除購物車事件
```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('trackCustom', 'RemoveFromCart', {
    content_ids: ['{{DLV - Item ID}}'],
    content_name: '{{DLV - Item Name}}',
    content_category: '{{DLV - Item Category}}',
    content_type: 'product',
    value: {{DLV - Item Price}},
    currency: 'USD'
  });
}
</script>
```

## 🧪 測試與除錯

### 1. 瀏覽器控制台測試

#### 檢查 DataLayer 狀態
```javascript
// 檢查 dataLayer 是否存在
console.log('DataLayer exists:', typeof window.dataLayer !== 'undefined');

// 查看所有 dataLayer 事件
console.log('DataLayer contents:', window.dataLayer);

// 過濾特定事件
window.dataLayer.filter(event => event.event === 'add_to_cart');
```

#### 手動測試事件推送
```javascript
// 測試加入購物車事件
window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 30.00,
    items: [{
      item_id: '1',
      item_name: 'Test Product',
      category: 'Test Category',
      price: 30.00,
      quantity: 1
    }]
  }
});

// 驗證事件是否推送成功
console.log('Last event:', window.dataLayer[window.dataLayer.length - 1]);
```

### 2. GTM Preview 模式測試流程

#### 步驟 1: 啟用 Preview 模式
1. 登入 GTM 後台
2. 點擊右上角「預覽」按鈕
3. 輸入網站 URL 開始除錯

#### 步驟 2: 測試事件觸發
| 測試項目 | 執行動作 | 預期結果 |
|----------|----------|----------|
| 頁面載入 | 重新整理頁面 | 觸發 `page_view` 事件 |
| 商品瀏覽 | 點擊商品進入詳細頁 | 觸發 `view_item` 事件 |
| 加入購物車 | 點擊「加入購物車」按鈕 | 觸發 `add_to_cart` 事件 |
| 移除商品 | 在購物車頁面移除商品 | 觸發 `remove_from_cart` 事件 |
| 開始結帳 | 點擊「結帳」按鈕 | 觸發 `begin_checkout` 事件 |

#### 步驟 3: 驗證變數值
在 GTM Preview 中檢查以下變數是否正確取值：
- `{{DLV - Item ID}}` - 應顯示商品 ID
- `{{DLV - Item Name}}` - 應顯示商品名稱
- `{{DLV - Item Price}}` - 應顯示正確價格
- `{{DLV - Ecommerce Value}}` - 應顯示交易總值

### 3. 第三方工具驗證

#### Facebook Pixel 測試
1. 安裝 [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) 瀏覽器擴充功能
2. 執行購物操作並觀察 Pixel Helper 狀態
3. 檢查 [Facebook Events Manager](https://business.facebook.com/events_manager2) 的測試事件

#### OneAD Pixel 測試
```javascript
// 檢查 OneAD Pixel 是否載入
console.log('OneAD loaded:', typeof onead !== 'undefined');

// 檢查 OneAD 事件歷史
if (typeof onead !== 'undefined') {
  console.log('OneAD events:', onead.getEvents());
}
```

#### Google Analytics 4 測試
1. 開啟 GA4 Real-time 報告
2. 執行購物操作
3. 確認事件出現在即時報告中

### 4. 開發者工具 Network 檢查

#### 檢查追蹤請求
1. 開啟瀏覽器開發者工具 (F12)
2. 切換到 Network 標籤
3. 過濾以下網域的請求：
   - `www.facebook.com` (Facebook Pixel)
   - `googletagmanager.com` (GTM)
   - `google-analytics.com` (GA4)
   - OneAD 相關網域

#### 驗證請求參數
確認追蹤請求包含正確的參數：
```
Facebook Pixel 範例:
- ev=AddToCart
- cd[content_ids]=['1']
- cd[value]=30.00
- cd[currency]=USD

GA4 範例:
- en=add_to_cart (事件名稱)
- ep.currency=USD (事件參數)
- ep.value=30.00 (事件值)
```

### 5. 常見問題故障排除

#### Q: DataLayer 事件沒有觸發
**可能原因與解決方案：**
1. **Vue 組件生命週期問題**
   ```javascript
   // 確保在 DOM 更新後觸發
   this.$nextTick(() => {
     window.dataLayer.push({...});
   });
   ```

2. **GTM 代碼載入順序**
   - 確認 GTM 代碼在 `<head>` 中正確載入
   - 檢查 noscript 版本是否在 `<body>` 開始處

3. **事件名稱拼寫錯誤**
   - 確認 Vue.js 中的事件名稱與 GTM 觸發條件一致

#### Q: 變數值為 undefined
**檢查項目：**
1. DataLayer 推送的資料結構是否正確
2. GTM 變數的資料層變數名稱是否準確
3. 事件觸發時機是否正確

#### Q: 第三方 Pixel 沒有接收到事件
**故障排除步驟：**
1. 檢查 GTM 代碼是否正確發布
2. 確認觸發條件是否符合
3. 檢查瀏覽器廣告攔截器設定
4. 驗證第三方 Pixel 代碼語法

### 6. 效能監控

#### DataLayer 大小監控
```javascript
// 檢查 dataLayer 大小 (建議 < 1MB)
const dataLayerSize = JSON.stringify(window.dataLayer).length;
console.log('DataLayer size (bytes):', dataLayerSize);

// 清理舊事件 (保留最近 100 個)
if (window.dataLayer.length > 100) {
  window.dataLayer.splice(0, window.dataLayer.length - 100);
}
```

#### 事件頻率監控
```javascript
// 追蹤事件推送頻率
let eventCount = 0;
const originalPush = window.dataLayer.push;
window.dataLayer.push = function() {
  eventCount++;
  console.log(`Event #${eventCount}:`, arguments[0]);
  return originalPush.apply(this, arguments);
};
```

## 📝 注意事項與最佳實務

### 🔒 資料合規與隱私

1. **GDPR / CCPA 合規**
   - 在歐盟或加州使用者訪問前，需取得追蹤同意
   - 實作 Consent Management Platform (CMP)
   - 提供資料使用透明度說明

2. **資料最小化原則**
   ```javascript
   // ❌ 避免傳送敏感資料
   window.dataLayer.push({
     event: 'add_to_cart',
     user_email: 'user@example.com', // 不要傳送 PII
     user_phone: '+1234567890'        // 不要傳送 PII
   });

   // ✅ 只傳送必要的商業資料
   window.dataLayer.push({
     event: 'add_to_cart',
     ecommerce: {
       currency: 'USD',
       value: 30.00,
       items: [{ /* 商品資料 */ }]
     }
   });
   ```

### ⚡ 效能優化

1. **資料型別優化**
   ```javascript
   // ✅ 確保數值型別正確
   price: parseFloat(product.price),        // 數字
   item_id: product.id.toString(),          // 字串
   quantity: parseInt(item.qty)             // 整數
   ```

2. **事件去重機制**
   ```javascript
   // 防止重複點擊造成多次事件
   let isEventSent = false;
   const addToCart = (product) => {
     if (!isEventSent) {
       isEventSent = true;
       window.dataLayer.push({...});
       
       // 2秒後重置，允許下次操作
       setTimeout(() => { isEventSent = false; }, 2000);
     }
   };
   ```

3. **條件載入**
   ```javascript
   // 只在必要時載入追蹤代碼
   if (typeof window !== 'undefined' && window.dataLayer) {
     window.dataLayer.push({...});
   }
   ```

### 🏗️ 程式架構建議

1. **統一事件管理**
   ```javascript
   // 建立統一的追蹤管理類別
   class TrackingManager {
     static trackEvent(eventName, eventData) {
       if (typeof window !== 'undefined' && window.dataLayer) {
         window.dataLayer.push({
           event: eventName,
           ...eventData
         });
         console.log(`[Tracking] ${eventName}:`, eventData);
       }
     }

     static trackEcommerce(event, ecommerceData) {
       this.trackEvent(event, { ecommerce: ecommerceData });
     }
   }

   // 使用範例
   TrackingManager.trackEcommerce('add_to_cart', {
     currency: 'USD',
     value: 30.00,
     items: [{ /* 商品資料 */ }]
   });
   ```

2. **Vue.js Mixin 模式**
   ```javascript
   // tracking-mixin.js
   export const trackingMixin = {
     methods: {
       $track(eventName, data) {
         if (typeof window !== 'undefined' && window.dataLayer) {
           window.dataLayer.push({
             event: eventName,
             timestamp: new Date().toISOString(),
             ...data
           });
         }
       }
     }
   };

   // 在組件中使用
   import { trackingMixin } from './mixins/tracking-mixin';
   
   export default {
     mixins: [trackingMixin],
     methods: {
       addToCart(product) {
         this.$track('add_to_cart', {
           ecommerce: { /* 資料 */ }
         });
       }
     }
   };
   ```

### 🚀 部署與維護

1. **環境區分**
   ```javascript
   // 根據環境使用不同的 GTM 容器
   const GTM_ID = process.env.NODE_ENV === 'production' 
     ? 'GTM-PROD-123' 
     : 'GTM-DEV-456';
   ```

2. **版本控制**
   ```javascript
   // 在事件中加入版本資訊
   window.dataLayer.push({
     event: 'add_to_cart',
     tracking_version: '1.2.0',
     ecommerce: { /* 資料 */ }
   });
   ```

3. **錯誤監控**
   ```javascript
   // 追蹤錯誤到 DataLayer
   window.addEventListener('error', (event) => {
     if (window.dataLayer) {
       window.dataLayer.push({
         event: 'javascript_error',
         error_message: event.message,
         error_filename: event.filename,
         error_lineno: event.lineno
       });
     }
   });
   ```

### 📊 成效監控指標

#### 技術指標
- **事件成功率**: 事件觸發數 / 使用者操作數
- **資料完整性**: 包含必要參數的事件百分比
- **延遲時間**: 從使用者操作到事件發送的時間

#### 業務指標
- **轉換漏斗**: PageView → ViewContent → AddToCart → InitiateCheckout → Purchase
- **購物車放棄率**: (AddToCart - Purchase) / AddToCart
- **商品熱門度**: 各商品的 ViewContent 和 AddToCart 次數

### 🔄 持續優化

1. **A/B 測試整合**
   ```javascript
   window.dataLayer.push({
     event: 'add_to_cart',
     ab_test_variant: 'checkout_button_v2',
     ecommerce: { /* 資料 */ }
   });
   ```

2. **使用者旅程追蹤**
   ```javascript
   // 記錄使用者的完整購物旅程
   const userJourney = {
     session_id: 'unique_session_id',
     user_segment: 'returning_customer',
     traffic_source: 'google_ads'
   };

   window.dataLayer.push({
     event: 'add_to_cart',
     user_journey: userJourney,
     ecommerce: { /* 資料 */ }
   });
   ```

## 🔗 相關資源與文件

### 官方文件
- **[Google Tag Manager 開發者指南](https://developers.google.com/tag-manager)**
- **[GA4 電商事件參考](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)**
- **[Facebook Pixel 參考文件](https://developers.facebook.com/docs/meta-pixel/reference)**
- **[Vue.js 生命週期指南](https://vuejs.org/guide/essentials/lifecycle.html)**

### 測試工具
- **[GTM Preview Mode](https://tagmanager.google.com/)**
- **[Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)**
- **[GA4 Real-time 報告](https://analytics.google.com/)**
- **[Tag Assistant Legacy](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by/kejbdjndbnbjgmefkgdddjlbokphdefk)**

### 學習資源
- **[Google Analytics Academy](https://analytics.google.com/analytics/academy/)**
- **[Facebook Blueprint](https://www.facebookblueprint.com/)**
- **[GTM 最佳實務指南](https://support.google.com/tagmanager/answer/6107163)**

### 合規工具
- **[Google Consent Mode](https://developers.google.com/tag-platform/security/consent-mode)**
- **[Facebook Advanced Matching](https://developers.facebook.com/docs/meta-pixel/advanced/advanced-matching)**
- **[GDPR 合規檢查清單](https://gdpr.eu/checklist/)**

---

*此文件基於 Vue.js 3 + Pinia + Vue Router 的電商專案架構編寫*
