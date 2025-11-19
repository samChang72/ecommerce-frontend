<template>
  <transition name="slide-up">
    <div v-if="consentStore.showBanner" class="cookie-banner">
      <div class="cookie-content">
        <div class="cookie-text">
          <h3>🍪 我們重視您的隱私</h3>
          <p>
            我們使用 Cookie 來改善您的瀏覽體驗並進行網站流量分析。
            點擊「接受」即表示您同意我們使用 Cookie。
            您可以隨時在設定中更改您的選擇。
          </p>
        </div>
        <div class="cookie-actions">
          <a-button @click="consentStore.declineConsent" class="btn-decline">
            拒絕
          </a-button>
          <a-button type="primary" @click="consentStore.acceptConsent" class="btn-accept">
            接受
          </a-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useConsentStore } from '../store/consent'

const consentStore = useConsentStore()
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border-radius: 16px;
  padding: 24px;
  z-index: 9999;
}

.cookie-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cookie-text h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.cookie-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
}

.cookie-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-decline {
  color: #666;
}

.btn-accept {
  background: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* Dark mode support if needed */
@media (prefers-color-scheme: dark) {
  .cookie-banner {
    background: rgba(30, 30, 30, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .cookie-text h3 {
    color: #fff;
  }
  
  .cookie-text p {
    color: #ccc;
  }
  
  .btn-decline {
    background: transparent;
    border-color: #666;
    color: #ccc;
  }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .cookie-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .cookie-text {
    flex: 1;
    padding-right: 24px;
  }
}
</style>
