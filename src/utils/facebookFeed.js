// Facebook Product Data Feed 工具函數

const getProductCategory = (type) => {
  const categoryMap = {
    '飲料': 'Food, Beverages & Tobacco > Beverages',
    '3C': 'Electronics',
    '零食': 'Food, Beverages & Tobacco > Food Items'
  }
  return categoryMap[type] || 'General'
}

const getSpecificCategory = (type, name) => {
  if (type === '3C') {
    if (name.includes('手機')) return 'Electronics > Communications > Telephony'
    if (name.includes('筆電') || name.includes('電腦')) return 'Electronics > Computers'
    return 'Electronics'
  }
  return getProductCategory(type)
}

export const generateFacebookFeed = (products) => {
  const baseUrl = 'https://samchang72.github.io/ecommerce-frontend'
  
  return products.map(product => ({
    id: product.id.toString(),
    title: product.name,
    description: product.name,
    availability: 'in stock',
    condition: 'new',
    price: `${product.price}.00 USD`,
    link: `${baseUrl}/#/product/${product.id}`,
    image_link: `${baseUrl}/${product.image}`,
    brand: 'YourBrand',
    google_product_category: getSpecificCategory(product.type, product.name)
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