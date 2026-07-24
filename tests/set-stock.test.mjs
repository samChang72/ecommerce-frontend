import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '../scripts/set-stock.js')

// 以暫存 stock 檔執行腳本，回傳 exit code 與執行後的庫存內容
const runScript = (payload, stockData) => {
  const dir = mkdtempSync(join(tmpdir(), 'set-stock-test-'))
  const stockPath = join(dir, 'stock.json')
  writeFileSync(stockPath, JSON.stringify(stockData))
  const args = payload === undefined ? [SCRIPT] : [SCRIPT, payload]
  const result = spawnSync(process.execPath, args, {
    env: { ...process.env, STOCK_PATH: stockPath },
    encoding: 'utf8'
  })
  return {
    status: result.status,
    stock: JSON.parse(readFileSync(stockPath, 'utf8'))
  }
}

const payload = (updates) => JSON.stringify({ updates })

test('設定庫存為指定值', () => {
  const r = runScript(payload([{ id: 1, stock: 55 }]), { 1: 20, 2: 10 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 55)
  assert.equal(r.stock['2'], 10)
})

test('設定為 0（沒有庫存）', () => {
  const r = runScript(payload([{ id: 1, stock: 0 }]), { 1: 20 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 0)
})

test('多筆更新各自生效', () => {
  const r = runScript(payload([{ id: 1, stock: 5 }, { id: 2, stock: 300 }]), { 1: 20, 2: 10 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 5)
  assert.equal(r.stock['2'], 300)
})

test('未知商品跳過且不中斷其他更新', () => {
  const r = runScript(payload([{ id: 99, stock: 5 }, { id: 1, stock: 7 }]), { 1: 20 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 7)
  assert.equal(r.stock['99'], undefined)
})

test('stock 值無效（負數／非整數）時保留原值', () => {
  const r = runScript(payload([{ id: 1, stock: -5 }, { id: 2, stock: 1.5 }]), { 1: 20, 2: 10 })
  assert.equal(r.status, 0)
  assert.equal(r.stock['1'], 20)
  assert.equal(r.stock['2'], 10)
})

test('空 updates 失敗 exit 1 且庫存不變', () => {
  const r = runScript(payload([]), { 1: 20 })
  assert.equal(r.status, 1)
  assert.equal(r.stock['1'], 20)
})

test('缺 payload 參數失敗 exit 1', () => {
  const r = runScript(undefined, { 1: 20 })
  assert.equal(r.status, 1)
  assert.equal(r.stock['1'], 20)
})
