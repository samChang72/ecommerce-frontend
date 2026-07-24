// 庫存同步中繼 API（Cloudflare Worker）URL
// 部署 workers/order-relay.js 後填入，例如 'https://order-relay.xxx.workers.dev'
// 留空時前端不會發送庫存同步請求（結帳流程不受影響）
export const ORDER_API_URL = 'https://order-relay.samchang-bf9.workers.dev'
