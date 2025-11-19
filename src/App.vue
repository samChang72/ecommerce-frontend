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
      <!-- 路由視圖 -->
      <router-view />
    </main>
    
    <!-- UUID 顯示 (保留原有功能) -->
    <div class="uuid-display">
      <span id="uuidDisplay">等待 UUID...</span>
    </div>
    <!-- Cookie Consent Banner -->
    <CookieBanner />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'
import { useCartStore } from './store/cart'
import { useConsentStore } from './store/consent'
import CookieBanner from './components/CookieBanner.vue'
import { updateFacebookFeedFile } from './utils/facebookFeed.js'
import productsData from './assets/products.json'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const cartStore = useCartStore()
    const consentStore = useConsentStore()
    
    // 購物車商品數量
    const cartItems = computed(() => cartStore.items)
    
    // 登出處理
    const handleLogout = () => {
      userStore.logout()
      router.push('/')
    }
    
    onMounted(() => {
      // 調試日誌
      console.log('App.vue mounted')
      
      // 初始化隱私權同意狀態
      consentStore.initConsent()
      
      // 初始化 GTM dataLayer (如果尚未存在)
      if (typeof window !== 'undefined' && !window.dataLayer) {
        window.dataLayer = []
      }
      
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
      handleLogout
    }
  },
  components: {
    CookieBanner
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
</style>
