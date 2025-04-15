<template>
  <div>
    <h1>產品分類</h1>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div class="products">
      <h2>{{ activeTab }}</h2>
      <ul>
        <li v-for="product in filteredProducts" :key="product.id" class="product-item">
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <strong>{{ product.name }}</strong>
            <p>價格: ${{ product.price }}</p>
            <button @click="addToCart(product)">加入購物車</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: ['飲料', '3C', '零食'],
      activeTab: '飲料',
      products: [
        { id: 1, name: '可樂', price: 30, type: '飲料', image: '/ecommerce-frontend/image/coke.png' },
        { id: 2, name: '綠茶', price: 25, type: '飲料', image: '/ecommerce-frontend/image/green.png' },
        { id: 3, name: '手機', price: 15000, type: '3C', image: '/ecommerce-frontend/image/phone.png' },
        { id: 4, name: '筆電', price: 45000, type: '3C', image: '/ecommerce-frontend/image/notebook.png' },
        { id: 5, name: '洋芋片', price: 50, type: '零食', image: '/ecommerce-frontend/image/chips.png' },
        { id: 6, name: '巧克力', price: 60, type: '零食', image: '/ecommerce-frontend/image/chocolate.png' },
      ],
      cart: [],
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => product.type === this.activeTab);
    },
  },
  methods: {
    addToCart(product) {
      // 暫存產品資料到 cart 陣列
      this.cart.push(product);

      // 在控制台輸出產品的完整資料
      console.log('加入購物車的產品資料:', product);

      // 顯示提示訊息
      alert(`${product.name} 已加入購物車！`);
    },
  },
};
</script>

<style>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  cursor: pointer;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
  border: none;
}
.products ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.product-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: 200px;
  text-align: center;
}
.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-bottom: 10px;
}
.product-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
}
button:hover {
  background-color: #0056b3;
}
</style>
