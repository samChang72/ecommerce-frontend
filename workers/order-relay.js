// Cloudflare Worker：接收前端訂單，轉發 repository_dispatch 給 GitHub Actions
// 部署與 Token 設定方式見 specs/inventory-sync-spec.md 第 5 節
// 需設定 Worker Secret：GITHUB_TOKEN（fine-grained PAT，僅本 repo、僅 Contents: Read and write）

const ALLOWED_ORIGIN = 'https://samchang72.github.io'
const GITHUB_DISPATCH_URL = 'https://api.github.com/repos/samChang72/ecommerce-frontend/dispatches'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })

// 驗證訂單 payload，回傳錯誤訊息；null 表示通過
// order_id 限制為英數/底線/連字號，避免進入 commit message 時的注入風險
// export 供單元測試使用
export const validateOrder = (order) => {
  if (!order || typeof order !== 'object') return 'payload 必須是物件'
  if (typeof order.order_id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(order.order_id)) {
    return 'order_id 格式錯誤'
  }
  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 50) {
    return 'items 必須是 1-50 筆的陣列'
  }
  for (const item of order.items) {
    if (!item || typeof item !== 'object') return 'items 內容格式錯誤'
    if (!Number.isInteger(item.id) || item.id < 1) return 'items[].id 必須是正整數'
    if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99) {
      return 'items[].qty 必須是 1-99 的整數'
    }
  }
  return null
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    if (request.method !== 'POST') {
      return jsonResponse(405, { error: 'method not allowed' })
    }

    // 速率限制（在解析 payload 前執行，惡意流量不進入後續邏輯）
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'
    const { success } = await env.ORDER_RATE_LIMITER.limit({ key: clientIp })
    if (!success) {
      return jsonResponse(429, { error: '請求過於頻繁，請稍後再試' })
    }

    let order
    try {
      order = await request.json()
    } catch {
      return jsonResponse(400, { error: 'JSON 解析失敗' })
    }

    const validationError = validateOrder(order)
    if (validationError) {
      return jsonResponse(400, { error: validationError })
    }

    const githubResponse = await fetch(GITHUB_DISPATCH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ecommerce-frontend-order-relay',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'purchase',
        client_payload: {
          order_id: order.order_id,
          items: order.items.map(item => ({ id: item.id, qty: item.qty }))
        }
      })
    })

    // GitHub dispatches API 成功時回 204
    if (githubResponse.status !== 204) {
      console.error('GitHub dispatch 失敗:', githubResponse.status, await githubResponse.text())
      return jsonResponse(502, { error: 'dispatch 失敗' })
    }

    return jsonResponse(202, { accepted: true })
  }
}
