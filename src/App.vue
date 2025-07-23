<template>
  <div id="app">
    <!-- 導航欄 -->
    <nav class="navbar">
      <div class="nav-container">
        <!-- 品牌/Logo -->
        <router-link to="/" class="nav-brand">
          電商網站
        </router-link>
        
        <!-- 導航連結 -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">首頁</router-link>
          <router-link to="/cart" class="nav-link cart-link">
            購物車
            <span v-if="cartItems.length > 0" class="cart-badge">
              {{ cartItems.length }}
            </span>
          </router-link>
          
          <!-- 用戶狀態 -->
          <div v-if="userStore.isLoggedIn" class="user-info">
            <router-link to="/profile" class="nav-link">{{ userStore.username }}</router-link>
            <button @click="handleLogout" class="logout-btn">登出</button>
          </div>
          <router-link v-else to="/login" class="nav-link login-link">登入</router-link>
        </div>
      </div>
    </nav>
    
    <!-- 主要內容區域 -->
    <main class="main-content">
      <!-- 直接顯示產品列表測試 -->
      <div class="homepage">
        <h1>產品分類</h1>
        <p>這是測試內容 - 如果你能看到這個，說明 Vue 正在工作</p>
        
        <!-- 分類標籤 -->
        <div class="tabs">
          <button class="active">飲料</button>
          <button>3C</button>
          <button>零食</button>
        </div>
        
        <!-- 產品列表 -->
        <div class="products">
          <h2>飲料</h2>
          <ul>
            <li class="product-item">
              <div class="product-link">
                <div class="product-image" style="background: #007bff; color: white; display: flex; align-items: center; justify-content: center;">可樂</div>
                <div class="product-info">
                  <strong>可樂</strong>
                  <p class="price">價格: $30</p>
                </div>
              </div>
              <button class="add-to-cart-btn">
                加入購物車
              </button>
            </li>
            <li class="product-item">
              <div class="product-link">
                <div class="product-image" style="background: #28a745; color: white; display: flex; align-items: center; justify-content: center;">綠茶</div>
                <div class="product-info">
                  <strong>綠茶</strong>
                  <p class="price">價格: $25</p>
                </div>
              </div>
              <button class="add-to-cart-btn">
                加入購物車
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 原本的 router-view 保留但暫時隱藏 -->
      <div style="display: none;">
        <router-view />
      </div>
    </main>
    
    <!-- UUID 顯示 (保留原有功能) -->
    <div class="uuid-display">
      <span id="uuidDisplay">等待 UUID...</span>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'
import { useCartStore } from './store/cart'
import { updateFacebookFeedFile } from './utils/facebookFeed.js'
import productsData from './assets/products.json'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const cartStore = useCartStore()
    
    // 購物車商品數量
    const cartItems = computed(() => cartStore.items)
    
    // 產品列表相關（直接在 App.vue 中實現）
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
      
      // 顯示提示訊息
      alert(`${product.name} 已加入購物車！`)
    }
    
    // 登出處理
    const handleLogout = () => {
      userStore.logout()
      router.push('/')
    }
    
    onMounted(() => {
      // 調試日誌
      console.log('App.vue mounted')
      console.log('Products data:', productsData)
      console.log('Filtered products:', filteredProducts.value)
      console.log('Active tab:', activeTab.value)
      
      // 初始化 Facebook Feed 同步
      updateFacebookFeedFile(productsData)
      
      // 動態創建 iframe 並設置 URL (保留原有功能)
      const iframe = document.createElement('iframe')
      iframe.src = 'https://rd-dev.onead.tw/test_demo/sam/250422/index.html'
      iframe.style.width = '1px'
      iframe.style.height = '1px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      // 監聽 postMessage 事件 (保留原有功能)
      window.addEventListener('message', (event) => {
        if (event.data?.uuid) {
          document.getElementById('uuidDisplay').textContent = event.data.uuid
        }
      })
    })
    
    return {
      userStore,
      cartItems,
      handleLogout,
      tabs,
      activeTab,
      products,
      filteredProducts,
      addToCart
    }
  }
}
</script>

<style>
/* 全域樣式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 導航欄樣式 */
.navbar {
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
}

.nav-brand:hover {
  color: #0056b3;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #f8f9fa;
}

.nav-link.router-link-active {
  color: #007bff;
  background-color: #e3f2fd;
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: 5px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #5a6268;
}

.login-link {
  background-color: #007bff;
  color: white !important;
}

.login-link:hover {
  background-color: #0056b3 !important;
}

/* 主要內容區域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

/* UUID 顯示區域 */
.uuid-display {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
}

/* RWD 響應式設計 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    height: auto;
    min-height: 60px;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .main-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 10px;
  }
  
  .nav-brand {
    font-size: 18px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
  
  .user-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .logout-btn {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .uuid-display {
    bottom: 5px;
    right: 5px;
    font-size: 10px;
    padding: 3px 6px;
  }
}

/* 首頁產品列表樣式 */
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
</style>
