// Facebook Product Data Feed 工具函數

const getProductCategory = (type) => {
  const categoryMap = {
    '飲料': 'Food, Beverages & Tobacco > Beverages',
    '3C': 'Electronics',
    '零食': 'Food, Beverages & Tobacco > Food Items',
    '衣著': 'Apparel & Accessories > Clothing'
  }
  return categoryMap[type] || 'General'
}

const getSpecificCategory = (type, name) => {
  if (type === '3C') {
    if (name.includes('手機')) return 'Electronics > Communications > Telephony'
    if (name.includes('筆電') || name.includes('電腦')) return 'Electronics > Computers'
    return 'Electronics'
  }
  if (type === '衣著') {
    if (name.includes('短褲') || name.includes('長褲')) return 'Apparel & Accessories > Clothing > Pants'
    if (name.includes('鞋') || name.includes('涼鞋') || name.includes('高跟')) return 'Apparel & Accessories > Shoes'
    if (name.includes('外套') || name.includes('西裝')) return 'Apparel & Accessories > Clothing > Outerwear'
    return 'Apparel & Accessories > Clothing'
  }
  return getProductCategory(type)
}

export const generateFacebookFeed = (products) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'
  
  return products.map(product => ({
    id: `DB_${product.id}`,
    title: product.name,
    description: product.name,
    availability: 'in stock',
    condition: 'new',
    price: `${product.price}.00 TWD`,
    link: `${baseUrl}/#/product/${product.id}`,
    image_link: `${baseUrl}/${product.image}`,
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

export const updateFacebookFeedFile = async (products) => {
  const feedData = generateFacebookFeed(products)
  const jsonString = JSON.stringify(feedData, null, 2)
  
  try {
    // 在開發環境中，我們無法直接寫入文件
    // 但可以提供下載功能或在控制台輸出
    console.log('Facebook Feed 已更新:', jsonString)
    
    // 創建下載功能
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 自動下載檔案
    const link = document.createElement('a')
    link.href = url
    link.download = 'facebook-feed.json'
    
    // 提示開發者需要手動複製到正確位置
    console.log('請將生成的 JSON 複製到以下位置:')
    console.log('- docs/facebook-feed.json')
    console.log('或執行: npm run update-facebook-feed')
    
    return jsonString
  } catch (error) {
    console.error('更新 Facebook Feed 失敗:', error)
    return null
  }
}