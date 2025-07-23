import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const isLoggedIn = ref(false)

  // 帳號格式驗證 - 只允許英文和數字
  const validateUsername = (input) => {
    const validPattern = /^[a-zA-Z0-9]+$/
    return {
      isValid: validPattern.test(input) && input.length >= 3,
      message: input.length < 3 
        ? '帳號至少需要 3 個字符' 
        : validPattern.test(input) 
          ? '' 
          : '帳號只能包含英文字母和數字'
    }
  }

  // 過濾輸入，只保留英文和數字
  const filterUsername = (input) => {
    return input.replace(/[^a-zA-Z0-9]/g, '')
  }

  // 登入功能
  const login = (inputUsername) => {
    const filteredUsername = filterUsername(inputUsername)
    const validation = validateUsername(filteredUsername)
    
    if (validation.isValid) {
      username.value = filteredUsername
      isLoggedIn.value = true
      
      // 儲存到第一方 Cookie (7天過期)
      const expires = new Date()
      expires.setDate(expires.getDate() + 7)
      document.cookie = `ecommerce_user=${filteredUsername}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
      
      return { success: true, message: '登入成功！' }
    } else {
      return { success: false, message: validation.message }
    }
  }

  // 登出功能
  const logout = () => {
    username.value = ''
    isLoggedIn.value = false
    
    // 清除 Cookie
    document.cookie = 'ecommerce_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }

  // 檢查登入狀態 (從 Cookie 讀取)
  const checkAuthStatus = () => {
    const cookies = document.cookie.split(';')
    const userCookie = cookies.find(cookie => 
      cookie.trim().startsWith('ecommerce_user=')
    )
    
    if (userCookie) {
      const cookieUsername = userCookie.split('=')[1]
      if (cookieUsername && validateUsername(cookieUsername).isValid) {
        username.value = cookieUsername
        isLoggedIn.value = true
        return true
      } else {
        // Cookie 中的帳號格式不正確，清除
        logout()
      }
    }
    return false
  }

  // 初始化時檢查登入狀態
  checkAuthStatus()

  return {
    username,
    isLoggedIn,
    validateUsername,
    filterUsername,
    login,
    logout,
    checkAuthStatus
  }
})