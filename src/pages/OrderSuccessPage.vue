<template>
  <div class="order-success-container">
    <div class="success-card">
      <div class="success-icon">
        ✅
      </div>
      
      <h1>訂單已完成！</h1>
      <p class="success-message">感謝您的購買，您的訂單已成功提交。</p>
      
      <div class="order-info">
        <div class="info-item">
          <span class="label">訂單編號：</span>
          <span class="value">{{ orderId }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">下單時間：</span>
          <span class="value">{{ orderTime }}</span>
        </div>
        
        <div v-if="userStore.isLoggedIn" class="info-item">
          <span class="label">會員帳號：</span>
          <span class="value">{{ userStore.username }}</span>
        </div>
      </div>
      
      <div class="success-actions">
        <router-link to="/" class="action-btn primary-btn">
          繼續購物
        </router-link>
        
        <router-link v-if="userStore.isLoggedIn" to="/profile" class="action-btn secondary-btn">
          會員中心
        </router-link>
        
        <button @click="printOrder" class="action-btn secondary-btn">
          列印訂單
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useCartStore } from '../store/cart'

export default {
  name: 'OrderSuccessPage',
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    
    const orderId = ref('')
    const orderTime = ref('')
    
    // 生成訂單編號和時間
    onMounted(() => {
      // 生成隨機訂單編號
      orderId.value = 'ORD' + Date.now() + Math.floor(Math.random() * 1000)
      
      // 格式化當前時間
      const now = new Date()
      orderTime.value = now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      // 清空購物車
      cartStore.clearCart()
    })
    
    const printOrder = () => {
      window.print()
    }
    
    return {
      userStore,
      orderId,
      orderTime,
      printOrder
    }
  }
}
</script>

<style scoped>
.order-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.success-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: block;
}

.success-card h1 {
  color: #28a745;
  font-size: 28px;
  margin-bottom: 10px;
}

.success-message {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
  line-height: 1.5;
}

.order-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  color: #333;
  font-weight: 600;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: block;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background-color: #5a6268;
}

/* RWD 響應式設計 */
@media (max-width: 768px) {
  .success-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .success-card h1 {
    font-size: 24px;
  }
  
  .success-icon {
    font-size: 48px;
  }
  
  .success-message {
    font-size: 14px;
  }
  
  .order-info {
    padding: 15px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .action-btn {
    font-size: 14px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .order-success-container {
    padding: 10px;
  }
  
  .success-card {
    padding: 20px 15px;
  }
  
  .success-card h1 {
    font-size: 20px;
  }
  
  .success-icon {
    font-size: 40px;
    margin-bottom: 15px;
  }
  
  .success-message {
    font-size: 13px;
    margin-bottom: 20px;
  }
  
  .order-info {
    padding: 12px;
    margin-bottom: 20px;
  }
  
  .info-item {
    padding: 6px 0;
  }
  
  .label, .value {
    font-size: 14px;
  }
}

/* 列印樣式 */
@media print {
  .success-actions {
    display: none;
  }
  
  .success-card {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .success-icon {
    color: #000;
  }
}
</style>