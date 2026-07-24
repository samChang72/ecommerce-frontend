const fs = require('fs')
const path = require('path')

// STOCK_PATH 可用環境變數覆寫（供測試以暫存檔執行）
const STOCK_PATH = process.env.STOCK_PATH || path.join(__dirname, '../data/stock.json')

// 解析 GitHub Action 傳入的 client_payload JSON
const parsePayload = (raw) => {
  if (!raw) {
    throw new Error('缺少 payload 參數，用法: node set-stock.js \'{"updates":[{"id":1,"stock":100}]}\'')
  }
  const payload = JSON.parse(raw)
  if (!Array.isArray(payload.updates) || payload.updates.length === 0) {
    throw new Error('payload.updates 必須是非空陣列')
  }
  return payload
}

const setStock = () => {
  try {
    const payload = parsePayload(process.argv[2])
    const stock = JSON.parse(fs.readFileSync(STOCK_PATH, 'utf8'))

    // 以 immutable 方式建立設定後的新庫存物件
    const newStock = payload.updates.reduce((acc, update) => {
      const key = String(update.id)
      if (!(key in acc)) {
        console.warn(`⚠️ 未知商品 id ${update.id}，跳過`)
        return acc
      }
      if (!Number.isInteger(update.stock) || update.stock < 0) {
        console.warn(`⚠️ 商品 ${key} 的 stock 值無效（${update.stock}），跳過`)
        return acc
      }
      console.log(`商品 ${key}: ${acc[key]} → ${update.stock}${update.stock === 0 ? ' 📦 沒有庫存' : ''}`)
      return { ...acc, [key]: update.stock }
    }, stock)

    fs.writeFileSync(STOCK_PATH, JSON.stringify(newStock, null, 2) + '\n', 'utf8')
    console.log('✅ 已更新 data/stock.json（手動庫存更新）')
  } catch (error) {
    console.error('❌ 更新庫存失敗:', error.message)
    process.exit(1)
  }
}

setStock()
