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
            </div>
          </router-link>
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
    
    const tabs = ref(['飲料', '3C', '零食'])
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
            currency: 'USD',
            value: product.price,
            items: [{
              item_id: product.id.toString(),
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
      addToCart
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
