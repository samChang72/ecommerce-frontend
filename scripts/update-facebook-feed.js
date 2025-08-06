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
    if (type === '衣著') {
      if (name.includes('短褲') || name.includes('長褲')) return 'Apparel & Accessories > Clothing > Pants'
      if (name.includes('鞋') || name.includes('淼鞋') || name.includes('高跟')) return 'Apparel & Accessories > Shoes'
      if (name.includes('外套') || name.includes('西裝')) return 'Apparel & Accessories > Clothing > Outerwear'
      return 'Apparel & Accessories > Clothing'
    }
    if (type === '飲料') return 'Food, Beverages & Tobacco > Beverages'
    if (type === '零食') return 'Food, Beverages & Tobacco > Food Items'
    return 'General'
  }
  
  return products.map(product => ({
    id: `DB_${product.id}`,
    title: product.name,
    description: product.name,
    availability: 'in stock',
    condition: 'new',
    price: `${product.price}.00 TWD`,
    link: `${baseUrl}/#/product/${product.id}`,
    image_link: `https://samchang72.github.io${product.image}`,
    brand: 'Example',
    google_product_category: 'Animals > Pet Supplies',
    shipping: {
      country: 'UK',
      service: 'Standard',
      price: '4.95 GBP'
    },
    ios_url: 'example-ios://electronic',
    ios_app_store_id: '42',
    ios_app_name: 'Electronic Example iOS',
    iphone_url: 'example-iphone://electronic',
    iphone_app_store_id: '43',
    iphone_app_name: 'Electronic Example iPhone',
    ipad_url: 'example-ipad://electronic',
    ipad_app_store_id: '44',
    ipad_app_name: 'Electronic Example iPad',
    android_url: 'example-android://electronic',
    android_package: 'com.electronic',
    android_app_name: 'Electronic Example Android',
    windows_phone_url: 'example-windows://electronic',
    windows_phone_app_id: '64ec0d1b-5b3b-4c77-a86b-5e12d465edc0',
    windows_phone_app_name: 'Electronic Example Windows'
  }))
}

// 生成 Data XML 的函數
const generateDataXml = (products) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'
  
  const xmlHeader = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
	<title>Test Store</title>
	<link rel="self" href="http://www.example.com"/>

`

  const xmlEntries = products.map(product => `	<entry>
		<g:id>DB_${product.id}</g:id>
		<g:title>${product.name}</g:title>
		<g:description>${product.name}</g:description>
		<g:link>${baseUrl}/#/product/${product.id}</g:link>
		<g:image_link>https://samchang72.github.io${product.image}</g:image_link>
		<g:brand>Example</g:brand>
		<g:condition>new</g:condition>
		<g:availability>in stock</g:availability>
		<g:price>${product.price}.00 TWD</g:price>
		<g:shipping>
			<g:country>UK</g:country>
			<g:service>Standard</g:service>
			<g:price>4.95 GBP</g:price>
		</g:shipping>
		<g:google_product_category>Animals &gt; Pet Supplies</g:google_product_category>
		<applink property="ios_url" content="example-ios://electronic" />
		<applink property="ios_app_store_id" content="42" />
		<applink property="ios_app_name" content="Electronic Example iOS" />
		<applink property="iphone_url" content="example-iphone://electronic" />
		<applink property="iphone_app_store_id" content="43" />
		<applink property="iphone_app_name" content="Electronic Example iPhone" />
		<applink property="ipad_url" content="example-ipad://electronic" />
		<applink property="ipad_app_store_id" content="44" />
		<applink property="ipad_app_name" content="Electronic Example iPad" />
		<applink property="android_url" content="example-android://electronic" />
		<applink property="android_package" content="com.electronic" />
		<applink property="android_app_name" content="Electronic Example Android" />
		<applink property="windows_phone_url" content="example-windows://electronic" />
		<applink property="windows_phone_app_id" content="64ec0d1b-5b3b-4c77-a86b-5e12d465edc0" />
		<applink property="windows_phone_app_name" content="Electronic Example Windows" />
	</entry>
`).join('\n')

  const xmlFooter = `</feed>
`

  return xmlHeader + xmlEntries + xmlFooter
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
    
    // 生成 Data XML
    const xmlData = generateDataXml(products)
    
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
    
    console.log('🎉 Facebook Product Data Feed 和 XML Feed 同步完成！')
    console.log(`📍 JSON Feed URL: https://samchang72.github.io/ecommerce-frontend/facebook-feed.json`)
    console.log(`📍 XML Feed URL: https://samchang72.github.io/ecommerce-frontend/data.xml`)
    
  } catch (error) {
    console.error('❌ 更新 Facebook Feed 失敗:', error)
  }
}

// 執行更新
updateFacebookFeed()

module.exports = { updateFacebookFeed }