import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateOrder } from '../workers/order-relay.js'

const validOrder = () => ({ order_id: 'ORDER_123_abc', items: [{ id: 1, qty: 2 }] })

test('合法 payload 通過（回傳 null）', () => {
  assert.equal(validateOrder(validOrder()), null)
})

test('非物件 payload 被拒', () => {
  assert.notEqual(validateOrder(null), null)
  assert.notEqual(validateOrder('string'), null)
})

test('order_id 缺少或型別錯誤被拒', () => {
  assert.notEqual(validateOrder({ items: [{ id: 1, qty: 1 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), order_id: 123 }), null)
})

test('order_id 含特殊字元被拒（commit message 注入防禦）', () => {
  assert.notEqual(validateOrder({ ...validOrder(), order_id: 'a;rm -rf /' }), null)
  assert.notEqual(validateOrder({ ...validOrder(), order_id: 'a"b' }), null)
  assert.notEqual(validateOrder({ ...validOrder(), order_id: 'a b' }), null)
})

test('order_id 超過 64 字元被拒', () => {
  assert.notEqual(validateOrder({ ...validOrder(), order_id: 'A'.repeat(65) }), null)
  assert.equal(validateOrder({ ...validOrder(), order_id: 'A'.repeat(64) }), null)
})

test('items 空陣列或超過 50 筆被拒', () => {
  assert.notEqual(validateOrder({ ...validOrder(), items: [] }), null)
  const tooMany = Array.from({ length: 51 }, (_, i) => ({ id: i + 1, qty: 1 }))
  assert.notEqual(validateOrder({ ...validOrder(), items: tooMany }), null)
  assert.equal(validateOrder({ ...validOrder(), items: tooMany.slice(0, 50) }), null)
})

test('items[].id 非正整數被拒', () => {
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: 0, qty: 1 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: -1, qty: 1 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: 1.5, qty: 1 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: '1', qty: 1 }] }), null)
})

test('items[].qty 超出 1-99 或非整數被拒', () => {
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: 1, qty: 0 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: 1, qty: 100 }] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: [{ id: 1, qty: 1.5 }] }), null)
  assert.equal(validateOrder({ ...validOrder(), items: [{ id: 1, qty: 99 }] }), null)
})

test('items 內含非物件被拒', () => {
  assert.notEqual(validateOrder({ ...validOrder(), items: [null] }), null)
  assert.notEqual(validateOrder({ ...validOrder(), items: ['x'] }), null)
})
