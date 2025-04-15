<template><div v-if="product"><img :src="product.image" width="150" /><h2>{{ product.name }}</h2><p>${{ product.price }}</p><button @click="addToCart(product)">Add to Cart</button></div></template><script setup>import { useRoute } from 'vue-router'
import products from '../assets/products.json'
import { useCartStore } from '../store/cart.js'

const route = useRoute()
const product = products.find(p => p.id === parseInt(route.params.id))
const { addToCart } = useCartStore()</script>