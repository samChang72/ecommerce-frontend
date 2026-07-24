import { defineStore } from 'pinia'
import { ref } from 'vue'

// 單品項數量上限（與 order-relay Worker 的 items[].qty 驗證一致）
const MAX_QTY = 99

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  function addToCart(product) {
    const found = items.value.find(i => i.id === product.id)
    if (found) {
      if (found.qty < MAX_QTY) found.qty++
    } else {
      items.value.push({ ...product, qty: 1 })
    }
  }

  function removeFromCart(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value = []
  }

  return { items, addToCart, removeFromCart, clearCart }
})