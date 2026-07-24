<template>
  <div class="homepage">
    <h1>產品分類</h1>
    
    <!-- 分類標籤 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    
    <!-- 產品列表 -->
    <div class="products">
      <h2>{{ activeTab }}</h2>
      <ul>
        <li v-for="product in filteredProducts" :key="product.id" class="product-item">
          <router-link :to="`/product/${product.id}`" class="product-link">
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <strong>{{ product.name }}</strong>
              <p class="price">價格: ${{ product.price }}</p>
              <p
                v-if="getStock(product.id) !== null"
                class="stock"
                :class="{ 'no-stock': getStock(product.id) < 1 }"
              >
                {{ getStock(product.id) < 1 ? '沒有庫存' : `庫存: ${getStock(product.id)} 件` }}
              </p>
            </div>
          </router-link>
          <button
            @click="addToCart(product)"
            class="add-to-cart-btn"
            :disabled="isSoldOut(product.id)"
          >
            {{ isSoldOut(product.id) ? '已售完' : '加入購物車' }}
          </button>
          <!-- 白名單帳號限定：手動更新庫存 -->
          <div v-if="isAuthorized" class="stock-editor">
            <input
              v-model.number="stockEdits[product.id]"
              type="number"
              min="0"
              placeholder="數量"
              class="stock-input"
            />
            <button
              @click="updateStock(product)"
              class="update-stock-btn"
              :disabled="updating[product.id]"
            >
              {{ updating[product.id] ? '更新中…' : '更新庫存' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useCartStore } from '../store/cart'
import { useUserStore } from '../store/user'
import { useStock } from '../composables/useStock'
import { ORDER_API_URL } from '../config/order-api.js'
import productsData from '../assets/products.json'

export default {
  name: 'HomePage',
  setup() {
    const cartStore = useCartStore()
    const userStore = useUserStore()
    const { stock, loadStock, isSoldOut, getStock } = useStock()

    // 白名單帳號才能改庫存
    const isAuthorized = computed(() => userStore.isAuthorized)

    // 各商品的庫存編輯狀態
    const stockEdits = reactive({})
    const updating = reactive({})

    // 手動更新庫存：送交 Worker → GitHub Action → 重產 feed
    const updateStock = async (product) => {
      const newStock = stockEdits[product.id]
      if (!Number.isInteger(newStock) || newStock < 0) {
        alert('請輸入 0 或以上的整數')
        return
      }
      if (!ORDER_API_URL) {
        alert('尚未設定庫存 API')
        return
      }
      updating[product.id] = true
      try {
        const response = await fetch(`${ORDER_API_URL}/stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: [{ id: product.id, stock: newStock }] })
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          alert(`更新失敗: ${body.error || response.status}`)
          return
        }
        // 樂觀更新本地顯示（feed 與全站由同步管線於約 1 分鐘內更新）
        if (stock.value) {
          stock.value = { ...stock.value, [String(product.id)]: newStock }
        }
        alert(`${product.name} 庫存已送出更新為 ${newStock}（約 1 分鐘後全站生效）`)
      } catch (error) {
        console.warn('庫存更新失敗:', error)
        alert('更新失敗，請稍後再試')
      } finally {
        updating[product.id] = false
      }
    }

    // 載入部署版庫存資料（失敗時 fallback 為可購買）
    onMounted(loadStock)

    const tabs = ref(['飲料', '3C', '零食', '衣著'])
    const activeTab = ref('飲料')
    const products = ref(productsData)
    
    // 篩選產品
    const filteredProducts = computed(() => {
      return products.value.filter(product => product.type === activeTab.value)
    })
    
    // 加入購物車
    const addToCart = (product) => {
      cartStore.addToCart(product)
      
      // 發送 GTM 事件 - 加入購物車
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'add_to_cart',
          ecommerce: {
            currency: 'TWD',
            value: product.price,
            items: [{
              item_id: 'DB_' + product.id,
              item_name: product.name,
              category: product.type,
              price: product.price,
              quantity: 1
            }]
          }
        })
        
        console.log('GTM add_to_cart event sent:', {
          item_name: product.name,
          item_id: product.id,
          price: product.price
        })
      }
      
      // 顯示提示訊息
      alert(`${product.name} 已加入購物車！`)
    }
    
    return {
      tabs,
      activeTab,
      products,
      filteredProducts,
      addToCart,
      isSoldOut,
      getStock,
      isAuthorized,
      stockEdits,
      updating,
      updateStock
    }
  }
}
</script>

<style scoped>
.homepage {
  max-width: 1200px;
  margin: 0 auto;
}

.homepage h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

/* 分類標籤樣式 */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.tabs button {
  padding: 10px 20px;
  cursor: pointer;
  border: 2px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s;
}

.tabs button:hover {
  background-color: #f8f9fa;
}

.tabs button.active {
  background-color: #007bff;
  color: white;
}

/* 產品區域 */
.products h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #495057;
  font-size: 24px;
}

.products ul {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
  margin-bottom: 10px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-bottom: 10px;
  border-radius: 4px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-info strong {
  font-size: 16px;
  color: #333;
}

.price {
  color: #007bff;
  font-weight: 600;
  font-size: 14px;
}

.stock {
  color: #6c757d;
  font-size: 13px;
}

.stock.no-stock {
  color: #dc3545;
  font-weight: 600;
}

.stock-editor {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.stock-input {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.update-stock-btn {
  padding: 6px 10px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.update-stock-btn:hover {
  background-color: #5a6268;
}

.update-stock-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}

.add-to-cart-btn {
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

.add-to-cart-btn:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
}

/* RWD 響應式設計 */
@media (max-width: 768px) {
  .products ul {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .product-item {
    padding: 12px;
  }
  
  .product-image {
    width: 80px;
    height: 80px;
  }
  
  .tabs button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .homepage h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .products h2 {
    font-size: 20px;
  }
  
  .products ul {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .tabs button {
    width: 200px;
    margin-bottom: 5px;
  }
  
  .product-item {
    padding: 15px;
  }
  
  .product-image {
    width: 80px;
    height: 80px;
    margin: 0 auto 10px;
  }
  
  .product-info {
    text-align: center;
  }
  
  .add-to-cart-btn {
    font-size: 14px;
    padding: 10px;
  }
}
</style>
