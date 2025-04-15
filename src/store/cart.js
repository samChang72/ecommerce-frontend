import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  function addToCart(product) {
    const found = items.value.find(i => i.id === product.id)
    if (found) found.qty++
    else items.value.push({ ...product, qty: 1 })
  }

  function removeFromCart(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value = []
  }

  return { items, addToCart, removeFromCart, clearCart }
})