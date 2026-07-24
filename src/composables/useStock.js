import { ref } from 'vue'

// 讀取部署版庫存資料（docs/stock.json，由庫存同步管線更新）
export function useStock() {
  const stock = ref(null) // null = 尚未載入或載入失敗（fallback 為可購買）

  const loadStock = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}stock.json?t=${Date.now()}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      stock.value = await response.json()
    } catch (error) {
      console.warn('讀取庫存失敗，視為可購買:', error)
      stock.value = null
    }
  }

  const isSoldOut = (productId) => {
    if (!stock.value) return false
    return (stock.value[String(productId)] ?? 0) === 0
  }

  return { stock, loadStock, isSoldOut }
}
