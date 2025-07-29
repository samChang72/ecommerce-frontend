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

### 在 GTM 後台建立以下變數：

1. **DLV - Item ID**: `ecommerce.items.0.item_id`
2. **DLV - Item Name**: `ecommerce.items.0.item_name`  
3. **DLV - Item Price**: `ecommerce.items.0.price`
4. **DLV - Item Category**: `ecommerce.items.0.category`
5. **DLV - Ecommerce Value**: `ecommerce.value`

### 建立觸發條件：

1. **Add to Cart Trigger**: 自訂事件 `add_to_cart`
2. **Remove from Cart Trigger**: 自訂事件 `remove_from_cart`
3. **View Item Trigger**: 自訂事件 `view_item`
4. **Begin Checkout Trigger**: 自訂事件 `begin_checkout`

### 第三方追蹤代碼範例 (Facebook Pixel):

```html
<script>
if (typeof fbq !== 'undefined') {
  fbq('track', 'AddToCart', {
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
```javascript
// 檢查 dataLayer 內容
console.log(dataLayer);

// 手動推送測試事件
dataLayer.push({
  event: 'add_to_cart',
  ecommerce: {
    currency: 'USD',
    value: 30,
    items: [{
      item_id: '1',
      item_name: 'Test Product',
      category: 'Test',
      price: 30,
      quantity: 1
    }]
  }
});
```

### 2. GTM Preview 模式
1. 在 GTM 中啟用 Preview 模式
2. 在網站上執行購物操作
3. 檢查事件是否正確觸發
4. 驗證變數值是否正確

### 3. 第三方工具驗證
- **Facebook Pixel**: 使用 Facebook Events Manager 的測試事件功能
- **Google Analytics**: 檢查 Real-time 報告中的事件
- **Browser DevTools**: 查看 Network 標籤中的追蹤請求

## 📝 注意事項

1. **資料型別**: 確保 `price` 和 `value` 為數字型別 (使用 `parseFloat()`)
2. **ID 格式**: 商品 ID 應為字串格式 (使用 `.toString()`)
3. **錯誤處理**: 檢查 `window.dataLayer` 是否存在
4. **除錯**: 在開發環境中使用 `console.log` 來追蹤事件
5. **效能**: 避免在短時間內大量推送事件到 dataLayer

## 🔗 相關資源

- [Google Tag Manager 官方文件](https://developers.google.com/tag-manager)
- [GA4 電商事件參考](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [Facebook Pixel 事件參考](https://developers.facebook.com/docs/facebook-pixel/reference)

---

*此文件基於 Vue.js 3 + Pinia + Vue Router 的電商專案架構編寫*
