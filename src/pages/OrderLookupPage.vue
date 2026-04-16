<template>
  <div class="order-page">
    <h1>訂單詳情</h1>

    <div v-if="loading" class="state">載入中…</div>

    <div v-else-if="error" class="state error">
      載入失敗：{{ error }}
      <div class="hint">訂單編號：{{ route.params.id }}</div>
    </div>

    <div v-else-if="order" class="order">
      <section>
        <p><span class="label">訂單編號：</span><strong>{{ order.id }}</strong></p>
        <p v-if="order.checkout_id"><span class="label">結帳編號：</span>{{ order.checkout_id }}</p>
      </section>

      <section v-if="order.line_items && order.line_items.length">
        <h3>商品</h3>
        <ul class="lines">
          <li v-for="li in order.line_items" :key="li.id">
            <span class="title">{{ li.item?.title || li.item?.id }}</span>
            <span class="qty">× {{ li.quantity?.total ?? 1 }}</span>
            <span class="amount">NT${{ formatAmount(lineSubtotal(li)) }}</span>
          </li>
        </ul>
      </section>

      <section v-if="shippingDestination">
        <h3>配送</h3>
        <p>
          {{ fulfillmentMethod }} →
          {{ shippingDestination.recipient }} /
          {{ shippingDestination.line1 }},
          {{ shippingDestination.city }}
          {{ shippingDestination.postal_code }}
        </p>
      </section>

      <section v-if="order.totals && order.totals.length">
        <h3>金額</h3>
        <ul class="totals">
          <li v-for="t in order.totals" :key="t.type">
            <span class="label">{{ totalsLabel(t.type) }}</span>
            <span class="amount">NT${{ formatAmount(t.amount) }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrder } from '../utils/ucpClient.js'

const TOTALS_LABEL = {
  subtotal: '小計',
  tax: '稅金',
  shipping: '運費',
  total: '合計',
}

export default {
  name: 'OrderLookupPage',
  setup() {
    const route = useRoute()
    const order = ref(null)
    const loading = ref(true)
    const error = ref(null)

    const fulfillmentMethod = computed(() => {
      const exp = order.value?.fulfillment?.expectations?.[0]
      return exp?.method_type || 'shipping'
    })

    const shippingDestination = computed(() => {
      return order.value?.fulfillment?.expectations?.[0]?.destination || null
    })

    function lineSubtotal(li) {
      const t = li.totals?.find((x) => x.type === 'subtotal')
      return t ? t.amount : 0
    }

    function totalsLabel(type) {
      return TOTALS_LABEL[type] || type
    }

    function formatAmount(n) {
      return Number(n || 0).toLocaleString()
    }

    onMounted(async () => {
      try {
        order.value = await getOrder(route.params.id)
      } catch (e) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    })

    return {
      route,
      order,
      loading,
      error,
      fulfillmentMethod,
      shippingDestination,
      lineSubtotal,
      totalsLabel,
      formatAmount,
    }
  },
}
</script>

<style scoped>
.order-page {
  max-width: 720px;
  margin: 24px auto;
  padding: 16px;
  font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;
  color: #222;
}
.state {
  padding: 24px;
  text-align: center;
  color: #555;
}
.state.error {
  color: #b91c1c;
}
.state .hint {
  margin-top: 8px;
  font-size: 13px;
  color: #888;
}
section {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
section:last-child {
  border-bottom: 0;
}
.label {
  color: #666;
  margin-right: 6px;
}
ul.lines, ul.totals {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}
ul.lines li, ul.totals li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}
ul.lines .qty {
  color: #555;
}
ul.lines .amount, ul.totals .amount {
  font-variant-numeric: tabular-nums;
}
</style>
