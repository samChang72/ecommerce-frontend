<template>
  <div class="login-container">
    <div class="login-card">
      <h1>會員登入</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">帳號</label>
          <input
            id="username"
            v-model="usernameInput"
            @input="handleUsernameInput"
            type="text"
            placeholder="請輸入帳號（英文和數字）"
            class="form-input"
            :class="{ 'error': errorMessage }"
            maxlength="20"
          />
          <div class="input-hint">
            帳號僅限英文字母和數字，至少 3 個字符
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-if="!errorMessage && usernameInput && validation.isValid" class="success-message">
            ✓ 帳號格式正確
          </div>
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="!canSubmit"
          :class="{ 'disabled': !canSubmit }"
        >
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/user'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    
    const usernameInput = ref('')
    const errorMessage = ref('')
    const isLoading = ref(false)
    
    // 如果已經登入，重新導向到首頁
    if (userStore.isLoggedIn) {
      router.push('/')
    }
    
    // 即時驗證
    const validation = computed(() => 
      userStore.validateUsername(usernameInput.value)
    )
    
    // 是否可以提交
    const canSubmit = computed(() => 
      validation.value.isValid && !isLoading.value
    )
    
    // 處理輸入事件
    const handleUsernameInput = (event) => {
      // 過濾輸入，只保留英文和數字
      const filtered = userStore.filterUsername(event.target.value)
      usernameInput.value = filtered
      
      // 如果輸入被過濾了，更新輸入框的值
      if (event.target.value !== filtered) {
        event.target.value = filtered
      }
      
      // 清除之前的錯誤訊息
      errorMessage.value = ''
    }
    
    // 處理登入
    const handleLogin = async () => {
      if (!canSubmit.value) return
      
      isLoading.value = true
      errorMessage.value = ''
      
      // 模擬登入延遲
      setTimeout(() => {
        const result = userStore.login(usernameInput.value)
        
        if (result.success) {
          // 登入成功，導向回原來的頁面或首頁
          const redirectTo = route.query.redirect || '/'
          router.push(redirectTo)
        } else {
          errorMessage.value = result.message
        }
        
        isLoading.value = false
      }, 500)
    }
    
    return {
      usernameInput,
      errorMessage,
      isLoading,
      validation,
      canSubmit,
      handleUsernameInput,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-input.error {
  border-color: #dc3545;
}

.input-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
}

.success-message {
  color: #28a745;
  font-size: 14px;
  margin-top: 4px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(.disabled) {
  background-color: #0056b3;
}

.login-button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* RWD 調整 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .login-card h1 {
    font-size: 20px;
  }
  
  .form-input, .login-button {
    font-size: 14px;
  }
}
</style>