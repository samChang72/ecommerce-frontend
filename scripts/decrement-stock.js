const fs = require('fs')
const path = require('path')

const STOCK_PATH = path.join(__dirname, '../data/stock.json')

// 解析 GitHub Action 傳入的 client_payload JSON
const parsePayload = (raw) => {
  if (!raw) {
    throw new Error('缺少 payload 參數，用法: node decrement-stock.js \'{"order_id":"...","items":[{"id":1,"qty":2}]}\'')
  }
  const payload = JSON.parse(raw)
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('payload.items 必須是非空陣列')
  }
  return payload
}

const decrementStock = () => {
  try {
    const payload = parsePayload(process.argv[2])
    const stock = JSON.parse(fs.readFileSync(STOCK_PATH, 'utf8'))

    // 以 immutable 方式建立扣減後的新庫存物件
    const newStock = payload.items.reduce((acc, item) => {
      const key = String(item.id)
      if (!(key in acc)) {
        console.warn(`⚠️ 未知商品 id ${item.id}，跳過`)
        return acc
      }
      const qty = Number.isInteger(item.qty) && item.qty > 0 ? item.qty : 0
      const remaining = Math.max(0, acc[key] - qty)
      console.log(`商品 ${key}: ${acc[key]} → ${remaining}（扣 ${qty}）${remaining === 0 ? ' 📦 已售完' : ''}`)
      return { ...acc, [key]: remaining }
    }, stock)

    fs.writeFileSync(STOCK_PATH, JSON.stringify(newStock, null, 2) + '\n', 'utf8')
    console.log(`✅ 已更新 data/stock.json（訂單 ${payload.order_id || '(無編號)'}）`)
  } catch (error) {
    console.error('❌ 扣減庫存失敗:', error.message)
    process.exit(1)
  }
}

decrementStock()
