<template>
  <div class="product-page">
    <div v-if="product" class="product-detail">
      <!-- 返回按鈕 -->
      <button @click="goBack" class="back-btn">
        ← 返回商品列表
      </button>
      
      <div class="product-content">
        <!-- 產品圖片 -->
        <div class="product-image-section">
          <img :src="product.image" :alt="product.name" class="product-image" />
        </div>
        
        <!-- 產品資訊 -->
        <div class="product-info-section">
          <div class="product-category">{{ product.type }}</div>
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price">${{ product.price }}</div>
          
          <div class="product-description">
            <h3>商品描述</h3>
            <p>這是一個優質的{{ product.name }}，屬於{{ product.type }}類別商品。</p>
          </div>
          
          <div class="product-actions">
            <button @click="handleAddToCart" class="add-to-cart-btn">
              加入購物車
            </button>
            <router-link to="/cart" class="view-cart-btn">
              查看購物車
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 產品不存在的情況 -->
    <div v-else class="product-not-found">
      <h2>商品不存在</h2>
      <p>抱歉，找不到您要查看的商品。</p>
      <router-link to="/" class="back-home-btn">返回首頁</router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../store/cart'
import productsData from '../assets/products.json'

export default {
  name: 'ProductPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const cartStore = useCartStore()
    
    // 根據路由參數找到對應產品
    const product = computed(() => {
      const productId = parseInt(route.params.id)
      return productsData.find(p => p.id === productId)
    })
    
    // 當組件載入時發送產品查看事件
    onMounted(() => {
      if (product.value && typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            currency: 'USD',
            value: product.value.price,
            items: [{
              item_id: product.value.id.toString(),
              item_name: product.value.name,
              category: product.value.type,
              price: product.value.price,
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
        
        // 發送 GTM 事件 - 加入購物車
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'add_to_cart',
            ecommerce: {
              currency: 'USD',
              value: product.value.price,
              items: [{
                item_id: product.value.id.toString(),
                item_name: product.value.name,
                category: product.value.type,
                price: product.value.price,
                quantity: 1
              }]
            }
          })
          
          console.log('GTM add_to_cart event sent from ProductPage:', {
            item_name: product.value.name,
            item_id: product.value.id,
            price: product.value.price
          })
        }
        
        alert(`${product.value.name} 已加入購物車！`)
      }
    }
    
    // 返回上一頁
    const goBack = () => {
      router.back()
    }
    
    return {
      product,
      handleAddToCart,
      goBack
    }
  }
}
</script>

<style scoped>
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #5a6268;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-category {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.product-name {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.product-price {
  font-size: 24px;
  color: #007bff;
  font-weight: bold;
}

.product-description h3 {
  color: #555;
  margin-bottom: 10px;
  font-size: 18px;
}

.product-description p {
  color: #666;
  line-height: 1.6;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.add-to-cart-btn {
  flex: 1;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

.view-cart-btn {
  flex: 1;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.3s;
}

.view-cart-btn:hover {
  background-color: #0056b3;
}

.product-not-found {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-not-found h2 {
  color: #333;
  margin-bottom: 10px;
}

.product-not-found p {
  color: #666;
  margin-bottom: 20px;
}

.back-home-btn {
  display: inline-block;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-home-btn:hover {
  background-color: #0056b3;
}

/* RWD 響應式設計 */
@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .product-name {
    font-size: 24px;
  }
  
  .product-price {
    font-size: 20px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .product-page {
    padding: 10px;
  }
  
  .product-content {
    padding: 15px;
  }
  
  .product-name {
    font-size: 20px;
  }
  
  .product-price {
    font-size: 18px;
  }
  
  .add-to-cart-btn, .view-cart-btn {
    font-size: 14px;
    padding: 10px 20px;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
