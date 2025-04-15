const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
  publicPath: '/ecommerce-frontend/', // 設定基底路徑
  configureWebpack: {
    plugins: [
      new webpack.BannerPlugin({
        banner: `Version: ${packageJson.version} - Build Date: ${new Date().toISOString()}`,
        raw: false, // 插入為註解
        entryOnly: true, // 僅在入口文件中插入
      }),
    ],
  },
};

const packageJsonContent = {
  "name": "ecommerce-frontend",
  "version": "1.0.0",
};