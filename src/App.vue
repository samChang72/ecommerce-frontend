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
    <h1 id="uuidDisplay">等待 UUID...</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabs: ['飲料', '3C', '零食'],
      activeTab: '飲料',
      products: [
        { id: 1, name: '可樂', price: 30, type: '飲料', image: './image/coke.jpg' },
        { id: 2, name: '綠茶', price: 25, type: '飲料', image: './image/green.jpg' },
        { id: 3, name: '手機', price: 15000, type: '3C', image: './image/phone.jpg' },
        { id: 4, name: '筆電', price: 45000, type: '3C', image: './image/notebook.jpg' },
        { id: 5, name: '洋芋片', price: 50, type: '零食', image: './image/chips.jpg' },
        { id: 6, name: '巧克力', price: 60, type: '零食', image: './image/chocolate.jpg' },
      ],
      cart: [],
    };
  },
  mounted() {
    // 動態創建 iframe 並設置 URL
    const iframe = document.createElement('iframe');
    iframe.src = 'http://rd-dev.onead.tw/test_demo/sam/250422/index.html';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 監聽 postMessage 事件
    window.addEventListener('message', (event) => {
      if (event.data?.uuid) {
        document.getElementById('uuidDisplay').textContent = event.data.uuid;
      }
    });
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

/* 手機 RWD 調整 */
@media (max-width: 480px) {
  .tabs button {
    width: 100%; /* 按鈕佔滿整行 */
    margin-bottom: 10px; /* 增加按鈕間距 */
  }

  .products ul {
    flex-direction: column; /* 產品列表改為垂直排列 */
    gap: 15px; /* 增加產品間距 */
  }

  .product-item {
    width: 100%; /* 產品項目佔滿整行 */
    padding: 15px; /* 增加內邊距 */
  }

  .product-image {
    width: 80px; /* 縮小圖片尺寸 */
    height: 80px;
    margin: 0 auto 10px; /* 置中圖片並增加下方間距 */
  }

  .product-info {
    text-align: center; /* 文字置中 */
  }

  button {
    font-size: 14px; /* 調整按鈕字體大小 */
    padding: 8px 12px; /* 增加按鈕內邊距 */
  }
}
</style>
