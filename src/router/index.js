import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ProductPage from '../pages/ProductPage.vue'
import CartPage from '../pages/CartPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import OrderSuccessPage from '../pages/OrderSuccessPage.vue'
import { useUserStore } from '../store/user'

console.log('Router configuration loading...')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { 
      path: '/', 
      component: HomePage,
      name: 'Home'
    },
    { path: '/product/:id', component: ProductPage },
    { path: '/cart', component: CartPage },
    { 
      path: '/checkout', 
      component: CheckoutPage,
      meta: { requiresAuth: true }
    },
    { path: '/login', component: LoginPage },
    { 
      path: '/profile', 
      component: ProfilePage,
      meta: { requiresAuth: true }
    },
    { path: '/order-success', component: OrderSuccessPage }
  ]
})

// 路由守衛
router.beforeEach((to) => {
  console.log('Router beforeEach:', to.path, to.name)
  
  try {
    const userStore = useUserStore()
    console.log('UserStore loaded successfully')
    
    // 檢查是否需要登入
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      console.log('Redirecting to login due to auth requirement')
      // 儲存原本要前往的路由
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }
  } catch (error) {
    console.error('Error in router guard:', error)
  }
  
  console.log('Route allowed:', to.path)
})

console.log('Router created:', router)

export default router