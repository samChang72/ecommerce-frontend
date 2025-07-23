const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    console.log('🧪 測試本地開發環境與線上環境的一致性...\n');
    
    // 測試本地環境
    console.log('📍 測試本地環境：http://localhost:3000/ecommerce-frontend/');
    try {
      await page.goto('http://localhost:3000/ecommerce-frontend/', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      
      const localTitle = await page.title();
      const localUrl = page.url();
      
      console.log(`✅ 本地環境測試成功`);
      console.log(`   標題: ${localTitle}`);
      console.log(`   URL: ${localUrl}`);
      
    } catch (error) {
      console.log(`❌ 本地環境測試失敗: ${error.message}`);
      console.log(`💡 請確保已運行 'npm run dev' 啟動開發服務器`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 測試線上環境
    console.log('📍 測試線上環境：https://samchang72.github.io/ecommerce-frontend/');
    try {
      await page.goto('https://samchang72.github.io/ecommerce-frontend/', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      const remoteTitle = await page.title();
      const remoteUrl = page.url();
      
      console.log(`✅ 線上環境測試成功`);
      console.log(`   標題: ${remoteTitle}`);  
      console.log(`   URL: ${remoteUrl}`);
      
    } catch (error) {
      console.log(`❌ 線上環境測試失敗: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎯 環境配置完成！');
    console.log('📝 使用方式：');
    console.log('   開發：npm run dev');
    console.log('   建置：npm run build');
    console.log('   預覽：npm run preview');
    console.log('   測試：npm run test:local');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();