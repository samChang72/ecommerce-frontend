import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '../scripts/decrement-stock.js')

// 以暫存 stock 檔執行腳本，回傳 exit code 與執行後的庫存內容
const runScript = (payload, stockData) => {
  const dir = mkdtempSync(join(tmpdir(), 'stock-test-'))
  const stockPath = join(dir, 'stock.json')
  writeFileSync(stockPath, JSON.stringify(stockData))
  const args = payload === undefined ? [SCRIPT] : [SCRIPT, payload]
  const result = spawnSync(process.execPath, args, {
    env: { ...process.env, STOCK_PATH: stockPath },
    encoding: 'utf8'
  })
  return {
    status: result.status,
    stock: JSON.parse(readFileSync(stockPath, 'utf8')),
    stderr: result.stderr
  }
}

const payload = (items) => JSON.stringify({ order_id: 'TEST_1', items })

test('正常扣減', () => {
  const r = runScript(payload([{ id: 1, qty: 3 }]), { 1: 20, 2: 10 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 17)
  assert.equal(r.stock['2'], 10)
})

test('同一訂單多品項各自扣減', () => {
  const r = runScript(payload([{ id: 1, qty: 2 }, { id: 2, qty: 5 }]), { 1: 20, 2: 10 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 18)
  assert.equal(r.stock['2'], 5)
})

test('扣超過庫存 clamp 到 0 不為負數', () => {
  const r = runScript(payload([{ id: 1, qty: 999 }]), { 1: 20 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 0)
})

test('未知商品跳過且不中斷其他品項', () => {
  const r = runScript(payload([{ id: 99, qty: 1 }, { id: 1, qty: 1 }]), { 1: 20 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 19)
  assert.equal(r.stock['99'], undefined)
})

test('qty 非整數視為 0（不扣減）', () => {
  const r = runScript(payload([{ id: 1, qty: 1.5 }]), { 1: 20 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 20)
})

test('空 items 失敗 exit 1 且庫存不變', () => {
  const r = runScript(payload([]), { 1: 20 })
  assert.equal(r.status, 1)
  assert.equal(r.stock['1'], 20)
})

test('缺 payload 參數失敗 exit 1', () => {
  const r = runScript(undefined, { 1: 20 })
  assert.equal(r.status, 1)
  assert.equal(r.stock['1'], 20)
})

test('payload 非合法 JSON 失敗 exit 1', () => {
  const r = runScript('{not json', { 1: 20 })
  assert.equal(r.status, 1)
  assert.equal(r.stock['1'], 20)
})
