import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ProductPage from '../pages/ProductPage.vue'
import CartPage from '../pages/CartPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import OrderSuccessPage from '../pages/OrderSuccessPage.vue'
import { useUserStore } from '../store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
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
  const userStore = useUserStore()
  
  // 檢查是否需要登入
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 儲存原本要前往的路由
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }
})

export default router