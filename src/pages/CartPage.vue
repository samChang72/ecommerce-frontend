<template>
  <div class="cart-page">
    <h1>購物車</h1>
    
    <div v-if="items.length === 0" class="empty-cart">
      <p>您的購物車是空的</p>
      <router-link to="/" class="continue-shopping">繼續購物</router-link>
    </div>
    
    <div v-else>
      <div class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="item-image" />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-price">單價: ${{ item.price }}</p>
            <p class="item-quantity">數量: {{ item.qty }}</p>
            <p class="item-total">小計: ${{ item.price * item.qty }}</p>
          </div>
          <button @click="removeFromCart(item.id)" class="remove-btn">移除</button>
        </div>
      </div>
      
      <div class="cart-summary">
        <h3>總計: ${{ totalPrice }}</h3>
        <router-link to="/checkout" class="checkout-btn">結帳</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../store/cart.js'

const cartStore = useCartStore()
const { items, removeFromCart } = cartStore

const totalPrice = computed(() => {
  return items.reduce((total, item) => total + (item.price * item.qty), 0)
})
</script>

<style scoped>
.cart-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.cart-page h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 50px 0;
}

.empty-cart p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.continue-shopping {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.continue-shopping:hover {
  background-color: #0056b3;
}

.cart-items {
  margin-bottom: 30px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: white;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.item-info p {
  margin: 5px 0;
  color: #666;
}

.item-price, .item-total {
  font-weight: 600;
  color: #007bff;
}

.remove-btn {
  padding: 8px 15px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background-color: #c82333;
}

.cart-summary {
  text-align: center;
  padding: 20px;
  border: 2px solid #007bff;
  border-radius: 10px;
  background-color: #f8f9fa;
}

.cart-summary h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.checkout-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 18px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.checkout-btn:hover {
  background-color: #218838;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
  
  .item-image {
    width: 100px;
    height: 100px;
  }
}
</style>