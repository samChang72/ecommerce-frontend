<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>會員中心</h1>
      
      <div class="profile-info">
        <div class="info-item">
          <label>帳號：</label>
          <span class="username">{{ userStore.username }}</span>
        </div>
        
        <div class="info-item">
          <label>登入狀態：</label>
          <span class="status online">已登入</span>
        </div>
        
        <div class="info-item">
          <label>會員等級：</label>
          <span class="level">一般會員</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <router-link to="/cart" class="action-btn cart-btn">
          查看購物車
        </router-link>
        
        <router-link to="/" class="action-btn home-btn">
          繼續購物
        </router-link>
        
        <button @click="handleLogout" class="action-btn logout-btn">
          登出帳號
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

export default {
  name: 'ProfilePage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 如果未登入，重新導向到登入頁面
    if (!userStore.isLoggedIn) {
      router.push('/login')
    }
    
    const handleLogout = () => {
      if (confirm('確定要登出嗎？')) {
        userStore.logout()
        router.push('/')
      }
    }
    
    return {
      userStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
}

.profile-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.profile-info {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 500;
  color: #555;
  font-size: 16px;
}

.username {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.status.online {
  color: #28a745;
  font-weight: 600;
}

.level {
  background-color: #fff3cd;
  color: #856404;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.cart-btn {
  background-color: #007bff;
  color: white;
}

.cart-btn:hover {
  background-color: #0056b3;
}

.home-btn {
  background-color: #28a745;
  color: white;
}

.home-btn:hover {
  background-color: #218838;
}

.logout-btn {
  background-color: #6c757d;
  color: white;
}

.logout-btn:hover {
  background-color: #5a6268;
}

/* RWD 響應式設計 */
@media (max-width: 768px) {
  .profile-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .profile-card h1 {
    font-size: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .info-item label {
    font-size: 14px;
  }
  
  .action-btn {
    font-size: 14px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-card {
    padding: 20px 15px;
  }
  
  .profile-card h1 {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .info-item {
    padding: 10px 0;
  }
  
  .username, .level {
    font-size: 12px;
    padding: 3px 8px;
  }
}
</style>