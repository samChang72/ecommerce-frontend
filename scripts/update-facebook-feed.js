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

// 從 data/stock.json 讀取庫存資料的函數
const getStockFromJson = () => {
  try {
    const stockPath = path.join(__dirname, '../data/stock.json')
    const stockContent = fs.readFileSync(stockPath, 'utf8')
    return JSON.parse(stockContent)
  } catch (error) {
    console.error('❌ 讀取庫存資料失敗:', error)
    process.exit(1)
  }
}

// 品牌名稱（Meta 目錄要求的 brand 欄位，需要換品牌時改這裡）
const BRAND = 'Sam Store'

// XML 特殊字元逃逸（分類名稱含有 & 與 >，未逃逸會導致 feed 解析失敗）
const escapeXml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// 生成 Facebook Feed 的函數
const generateFacebookFeed = (products, stock) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'

  return products.map(product => ({
    id: `DB_${product.id}`,
    title: product.name,
    description: product.description,
    availability: (stock[String(product.id)] ?? 0) > 0 ? 'in stock' : 'out of stock',
    quantity_to_sell_on_facebook: stock[String(product.id)] ?? 0,
    condition: 'new',
    price: `${product.price}.00 TWD`,
    link: `${baseUrl}/#/product/${product.id}`,
    image_link: `https://samchang72.github.io${product.image}`,
    brand: BRAND,
    google_product_category: product.googleCategory,
    shipping: {
      country: 'TW',
      service: 'Standard',
      price: '60.00 TWD'
    }
  }))
}

// 生成 Data XML 的函數
const generateDataXml = (products, stock) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'
  
  const xmlHeader = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
	<title>Test Store</title>
	<link rel="self" href="http://www.example.com"/>

`

  const xmlEntries = products.map(product => {
    const qty = stock[String(product.id)] ?? 0
    return `	<entry>
		<g:id>DB_${product.id}</g:id>
		<g:title>${escapeXml(product.name)}</g:title>
		<g:description>${escapeXml(product.description)}</g:description>
		<g:link>${baseUrl}/#/product/${product.id}</g:link>
		<g:image_link>https://samchang72.github.io${product.image}</g:image_link>
		<g:brand>${escapeXml(BRAND)}</g:brand>
		<g:condition>new</g:condition>
		<g:availability>${qty > 0 ? 'in stock' : 'out of stock'}</g:availability>
		<g:quantity_to_sell_on_facebook>${qty}</g:quantity_to_sell_on_facebook>
		<g:price>${product.price}.00 TWD</g:price>
		<g:shipping>
			<g:country>TW</g:country>
			<g:service>Standard</g:service>
			<g:price>60.00 TWD</g:price>
		</g:shipping>
		<g:google_product_category>${escapeXml(product.googleCategory)}</g:google_product_category>
	</entry>
`
  }).join('\n')

  const xmlFooter = `</feed>
`

  return xmlHeader + xmlEntries + xmlFooter
}

// 生成 Meta 官方 RSS 2.0 XML 的函數
const generateRssXml = (products, stock) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'

  const xmlHeader = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Test Store</title>
<link>${baseUrl}/</link>
<description>An example item from the feed</description>
`

  const xmlItems = products.map(product => {
    const qty = stock[String(product.id)] ?? 0
    return `<item>
<g:id>DB_${product.id}</g:id>
<g:title>${escapeXml(product.name)}</g:title>
<g:description>${escapeXml(product.description)}</g:description>
<g:link>${baseUrl}/#/product/${product.id}</g:link>
<g:image_link>https://samchang72.github.io${product.image}</g:image_link>
<g:brand>${escapeXml(BRAND)}</g:brand>
<g:condition>new</g:condition>
<g:availability>${qty > 0 ? 'in stock' : 'out of stock'}</g:availability>
<g:quantity_to_sell_on_facebook>${qty}</g:quantity_to_sell_on_facebook>
<g:price>${product.price}.00 TWD</g:price>
<g:google_product_category>${escapeXml(product.googleCategory)}</g:google_product_category>
</item>`
  }).join('\n')

  const xmlFooter = `
</channel>
</rss>
`

  return xmlHeader + xmlItems + xmlFooter
}

// 更新 Facebook Feed 檔案
const updateFacebookFeed = () => {
  try {
    // 從 products.json 讀取產品資料
    const products = getProductsFromJson()
    console.log(`找到 ${products.length} 個產品`)

    // 從 data/stock.json 讀取庫存資料
    const stock = getStockFromJson()
    const missingStock = products.filter(p => stock[String(p.id)] === undefined)
    if (missingStock.length > 0) {
      console.warn(`⚠️ 缺少庫存資料（視為售完）: ${missingStock.map(p => `DB_${p.id}`).join(', ')}`)
    }

    // 生成 Facebook Feed
    const feedData = generateFacebookFeed(products, stock)
    const jsonString = JSON.stringify(feedData, null, 2)

    // 生成 Data XML
    const xmlData = generateDataXml(products, stock)

    // 生成 RSS 2.0 XML
    const rssData = generateRssXml(products, stock)
    
    // 確保 docs 目錄存在
    const docsDir = path.join(__dirname, '../docs')
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
      console.log('📁 已創建 docs 目錄')
    }
    
    // 寫入 docs/facebook-feed.json
    const jsonPath = path.join(__dirname, '../docs/facebook-feed.json')
    fs.writeFileSync(jsonPath, jsonString, 'utf8')
    console.log('✅ 已更新 docs/facebook-feed.json')
    
    // 寫入 docs/data.xml
    const xmlPath = path.join(__dirname, '../docs/data.xml')
    fs.writeFileSync(xmlPath, xmlData, 'utf8')
    console.log('✅ 已更新 docs/data.xml')

    // 寫入 docs/data-rss.xml
    const rssPath = path.join(__dirname, '../docs/data-rss.xml')
    fs.writeFileSync(rssPath, rssData, 'utf8')
    console.log('✅ 已更新 docs/data-rss.xml')

    // 寫入 docs/stock.json（部署版，供前端 runtime 讀取庫存）
    const stockDeployPath = path.join(__dirname, '../docs/stock.json')
    fs.writeFileSync(stockDeployPath, JSON.stringify(stock, null, 2) + '\n', 'utf8')
    console.log('✅ 已更新 docs/stock.json')

    console.log('🎉 Facebook Product Data Feed 和 XML Feed 同步完成！')
    console.log(`📍 JSON Feed URL: https://samchang72.github.io/ecommerce-frontend/facebook-feed.json`)
    console.log(`📍 XML Feed URL: https://samchang72.github.io/ecommerce-frontend/data.xml`)
    console.log(`📍 RSS Feed URL: https://samchang72.github.io/ecommerce-frontend/data-rss.xml`)
    
  } catch (error) {
    console.error('❌ 更新 Facebook Feed 失敗:', error)
  }
}

// 執行更新
updateFacebookFeed()

module.exports = { updateFacebookFeed }