<template>
  <div class="checkout-page">
    <a-card title="結帳" class="checkout-card">
      <!-- 空購物車提示 -->
      <a-alert
        v-if="isCartEmpty"
        message="購物車是空的"
        description="請先加入商品到購物車再進行結帳。"
        type="warning"
        show-icon
        style="margin-bottom: 20px;"
      >
        <template #action>
          <a-button size="small" type="primary" @click="router.push('/')">
            前往購物
          </a-button>
        </template>
      </a-alert>

      <!-- 購物車商品列表 -->
      <div v-else class="cart-summary">
        <h3>訂單摘要</h3>
        <a-list
          item-layout="horizontal"
          :data-source="items"
          class="order-items"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :title="item.name"
                :description="`類別: ${item.type}`"
              >
                <template #avatar>
                  <a-avatar :src="item.image" size="large" shape="square" />
                </template>
              </a-list-item-meta>
              <div class="item-details">
                <div class="price-info">
                  <span class="unit-price">${item.price}</span>
                  <span class="quantity">x ${item.qty}</span>
                  <span class="subtotal">${item.price * item.qty}</span>
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>
        
        <a-divider />
        
        <div class="order-total">
          <a-row justify="space-between" align="middle">
            <a-col>
              <a-statistic title="商品總數" :value="totalItems" suffix="件" />
            </a-col>
            <a-col>
              <a-statistic 
                title="訂單總額" 
                :value="totalPrice" 
                prefix="$" 
                :value-style="{ color: '#3f8600', fontSize: '24px', fontWeight: 'bold' }"
              />
            </a-col>
          </a-row>
        </div>
        
        <a-divider />
      </div>

      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        layout="vertical"
        @finish="submitOrder"
        @finish-failed="onFinishFailed"
      >
        <a-form-item
          label="收件人姓名"
          name="name"
          :validate-status="nameStatus"
          :help="nameHelp"
        >
          <a-input
            v-model:value="formData.name"
            placeholder="請輸入您的姓名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="地址"
          name="address"
          :validate-status="addressStatus"
          :help="addressHelp"
        >
          <a-textarea
            v-model:value="formData.address"
            placeholder="請輸入您的配送地址"
            :rows="3"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-space size="large" class="submit-actions">
            <a-button 
              type="primary" 
              html-type="submit" 
              size="large"
              :loading="loading"
              :disabled="!isFormValid"
            >
              <template #icon><ShoppingCartOutlined /></template>
              完成訂單
            </a-button>
            
            <a-button 
              size="large"
              @click="goBack"
            >
              返回購物車
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cart.js'
import { message } from 'ant-design-vue'
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const cartStore = useCartStore()
const { items, clearCart } = cartStore

// 表單參考和載入狀態
const formRef = ref()
const loading = ref(false)

// 表單資料
const formData = reactive({
  name: '',
  address: ''
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入您的姓名!', trigger: 'blur' },
    { min: 2, message: '姓名至少需要2個字符!', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '請輸入您的地址!', trigger: 'blur' },
    { min: 10, message: '地址至少需要10個字符!', trigger: 'blur' }
  ]
}

// 計算驗證狀態
const nameStatus = computed(() => {
  if (!formData.name) return ''
  return formData.name.length >= 2 ? 'success' : 'error'
})

const nameHelp = computed(() => {
  if (!formData.name) return ''
  return formData.name.length < 2 ? '姓名至少需要2個字符' : ''
})

const addressStatus = computed(() => {
  if (!formData.address) return ''
  return formData.address.length >= 10 ? 'success' : 'error'
})

const addressHelp = computed(() => {
  if (!formData.address) return ''
  return formData.address.length < 10 ? '地址至少需要10個字符' : ''
})

// 計算購物車總額
const totalPrice = computed(() => {
  return items.reduce((total, item) => total + (item.price * item.qty), 0)
})

// 計算商品總數量
const totalItems = computed(() => {
  return items.reduce((total, item) => total + item.qty, 0)
})

// 檢查購物車是否為空
const isCartEmpty = computed(() => {
  return items.length === 0
})

// 表單是否有效
const isFormValid = computed(() => {
  return formData.name.length >= 2 && formData.address.length >= 10 && !isCartEmpty.value
})

// 提交訂單
const submitOrder = async () => {
  try {
    loading.value = true
    
    // 發送 Purchase 事件到 dataLayer
    if (typeof window !== 'undefined' && window.dataLayer) {
      // 生成訂單 ID
      const orderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: orderId,
          currency: 'USD',
          value: totalPrice.value,
          items: items.map(item => ({
            item_id: item.id.toString(),
            item_name: item.name,
            category: item.type,
            price: item.price,
            quantity: item.qty
          }))
        }
      })
      
      console.log('GTM purchase event sent:', {
        transaction_id: orderId,
        total_value: totalPrice.value,
        item_count: items.length,
        customer_name: formData.name
      })
    }
    
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 顯示成功訊息
    message.success(`謝謝 ${formData.name}！您的訂單已成功送出。總金額：$${totalPrice.value}`, 3)
    
    // 清空購物車
    clearCart()
    
    // 重置表單
    formData.name = ''
    formData.address = ''
    
    // 延遲導向成功頁面（如果有的話）
    setTimeout(() => {
      router.push('/')
    }, 2000)
    
  } catch (error) {
    message.error('訂單送出失敗，請稍後再試。')
  } finally {
    loading.value = false
  }
}

// 表單驗證失敗處理
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo)
  message.error('請檢查表單內容並填寫完整。')
}

// 返回購物車
const goBack = () => {
  router.push('/cart')
}
</script>

<style scoped>
.checkout-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-card {
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.checkout-card :deep(.ant-card-head) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}

.checkout-card :deep(.ant-card-head-title) {
  color: white;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.submit-actions {
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}

.submit-actions .ant-btn {
  min-width: 140px;
}

/* 購物車摘要樣式 */
.cart-summary {
  margin-bottom: 30px;
}

.cart-summary h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.order-items {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.item-details {
  text-align: right;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.unit-price {
  color: #666;
  font-size: 14px;
}

.quantity {
  color: #999;
  font-size: 12px;
}

.subtotal {
  color: #3f8600;
  font-weight: 600;
  font-size: 16px;
}

.order-total {
  padding: 16px;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%);
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkout-page {
    padding: 10px;
  }
  
  .submit-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .submit-actions .ant-btn {
    margin-bottom: 10px;
    width: 100%;
  }
  
  .price-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

/* 表單項目樣式優化 */
:deep(.ant-form-item-label) {
  font-weight: 600;
  color: #333;
}

:deep(.ant-input:focus, .ant-input-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}
</style>