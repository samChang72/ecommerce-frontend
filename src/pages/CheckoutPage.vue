<template><div><h1>Checkout</h1><form @submit.prevent="submitOrder"><input placeholder="Name" v-model="name" /><input placeholder="Address" v-model="address" /><button type="submit">Submit</button></form></div></template><script setup>import { ref } from 'vue'
import { useCartStore } from '../store/cart.js'

const name = ref('')
const address = ref('')
const { clearCart } = useCartStore()

function submitOrder() {
  alert(`Thanks ${name.value}! Your order has been placed.`)
  clearCart()
}</script>