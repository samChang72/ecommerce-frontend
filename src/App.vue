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
/* Tabs 樣式 */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap; /* 讓按鈕在小螢幕時自動換行 */
}
.tabs button {
  padding: 10px 20px;
  cursor: pointer;
  flex: 1; /* 讓按鈕在小螢幕時平均分配寬度 */
  text-align: center;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
  border: none;
}

/* Products 列表樣式 */
.products ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap; /* 讓產品項目在小螢幕時自動換行 */
  gap: 20px;
  justify-content: center; /* 讓產品在小螢幕時置中 */
}
.product-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: calc(33.333% - 20px); /* 預設每行顯示 3 個產品 */
  text-align: center;
  box-sizing: border-box;
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

/* RWD 媒體查詢 */
@media (max-width: 768px) {
  .product-item {
    width: calc(50% - 20px); /* 平板或小螢幕每行顯示 2 個產品 */
  }
}

@media (max-width: 480px) {
  .product-item {
    width: 100%; /* 手機螢幕每行顯示 1 個產品 */
  }
  .tabs button {
    flex: none; /* 讓按鈕在手機上不平均分配寬度 */
    width: 100%; /* 每個按鈕佔滿一行 */
  }
}
</style>
