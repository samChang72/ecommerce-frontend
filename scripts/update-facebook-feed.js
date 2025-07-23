const fs = require('fs')
const path = require('path')

// 從 products.json 中讀取產品資料的函數
const getProductsFromJson = () => {
  try {
    const productsPath = path.join(__dirname, '../src/assets/products.json')
    const productsContent = fs.readFileSync(productsPath, 'utf8')
    const products = JSON.parse(productsContent)
    
    return products
  } catch (error) {
    console.error('讀取產品資料失敗:', error)
    return []
  }
}

// 生成 Facebook Feed 的函數
const generateFacebookFeed = (products) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'
  
  const getSpecificCategory = (type, name) => {
    if (type === '3C') {
      if (name.includes('手機')) return 'Electronics > Communications > Telephony'
      if (name.includes('筆電') || name.includes('電腦')) return 'Electronics > Computers'
      return 'Electronics'
    }
    if (type === '飲料') return 'Food, Beverages & Tobacco > Beverages'
    if (type === '零食') return 'Food, Beverages & Tobacco > Food Items'
    return 'General'
  }
  
  return products.map(product => ({
    id: product.id.toString(),
    title: product.name,
    description: product.name,
    availability: 'in stock',
    condition: 'new',
    price: `${product.price}.00 USD`,
    link: `${baseUrl}/#/product/${product.id}`,
    image_link: `https://samchang72.github.io${product.image}`,
    brand: 'YourBrand',
    google_product_category: getSpecificCategory(product.type, product.name)
  }))
}

// 更新 Facebook Feed 檔案
const updateFacebookFeed = () => {
  try {
    // 從 products.json 讀取產品資料
    const products = getProductsFromJson()
    console.log(`找到 ${products.length} 個產品`)
    
    // 生成 Facebook Feed
    const feedData = generateFacebookFeed(products)
    const jsonString = JSON.stringify(feedData, null, 2)
    
    // 確保 docs 目錄存在
    const docsDir = path.join(__dirname, '../docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
      console.log('📁 已創建 docs 目錄')
    }
    
    // 寫入 docs/facebook-feed.json
    const docsPath = path.join(__dirname, '../docs/facebook-feed.json')
    fs.writeFileSync(docsPath, jsonString, 'utf8')
    console.log('✅ 已更新 docs/facebook-feed.json')
    
    console.log('🎉 Facebook Product Data Feed 同步完成！')
    console.log(`📍 Feed URL: https://samchang72.github.io/ecommerce-frontend/facebook-feed.json`)
    
  } catch (error) {
    console.error('❌ 更新 Facebook Feed 失敗:', error)
  }
}

// 執行更新
updateFacebookFeed()

module.exports = { updateFacebookFeed }