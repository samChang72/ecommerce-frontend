// Lightweight UCP client for the merchant-side order lookup page.
// Reads the UCP API base from VITE_UCP_API_URL (build-time env) with a
// dev fallback. The publisher-side SDK uses its own client; this one
// is consumed by Vue components only.

const UCP_API = import.meta.env.VITE_UCP_API_URL || 'http://localhost:3001'

function authHeaders() {
  return {
    'UCP-Agent': `profile="${location.origin}/profile"`,
    'Request-Id': crypto.randomUUID(),
  }
}

export async function getOrder(id) {
  const r = await fetch(`${UCP_API}/orders/${id}`, { headers: authHeaders() })
  if (!r.ok) {
    let body
    try { body = await r.json() } catch { body = await r.text().catch(() => '') }
    const err = new Error(`getOrder ${id}: ${r.status}`)
    err.status = r.status
    err.body = body
    throw err
  }
  return r.json()
}

export const __ucpApi = UCP_API
