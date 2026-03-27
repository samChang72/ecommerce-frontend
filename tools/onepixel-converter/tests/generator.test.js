import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateMarkdown } from '../js/generator.js'

const mockData = {
  pixelId: '586731500',
  name: 'onead-test',
  initCode: '<script type="text/javascript">\n    onep(\'init\', \'586731500\');\n    onep(\'track\', \'PageView\');\n</script>',
  events: [
    { type: 'Lead', name: 'lead', id: '715841193', code: '<script>\n    onep(\'track\', \'Lead\', { content_name: \'lead\', id: \'715841193\' });\n</script>' },
    { type: 'Purchase', name: 'pp', id: '428882660', code: '<script>\n    onep(\'track\', \'Purchase\', { content_name: \'pp\', id: \'428882660\' });\n</script>' }
  ]
}

describe('generateMarkdown', () => {
  it('includes client name in title', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('OnePixel 部署說明 – TestBrand'))
  })

  it('includes intro section', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('什麼是 OnePixel'))
  })

  it('includes init code in fenced code block', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes("onep('init', '586731500')"))
    assert.ok(md.includes('```'))
  })

  it('includes only events present in data', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('Lead'))
    assert.ok(md.includes('Purchase'))
  })

  it('includes e-commerce recommendation table', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('PageView'))
    assert.ok(md.includes('ViewContent'))
    assert.ok(md.includes('建議觸發時機'))
  })

  it('includes example for each event type present', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('按鈕點擊（Lead）為例'))
    assert.ok(md.includes('以完成購買（Purchase）為例'))
  })

  it('does NOT include examples for event types not present', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(!md.includes('以加入購物車'))
    assert.ok(!md.includes('以點擊結帳'))
  })

  it('includes properties table', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('content_category'))
    assert.ok(md.includes('content_ids'))
    assert.ok(md.includes('屬性名稱'))
  })

  it('shows only one example per event type for duplicates', () => {
    const dataWithDuplicates = {
      ...mockData,
      events: [
        { type: 'Lead', name: 'lead1', id: '111', code: 'code1' },
        { type: 'Lead', name: 'lead2', id: '222', code: 'code2' }
      ]
    }
    const md = generateMarkdown(dataWithDuplicates, 'TestBrand')
    const matches = md.match(/按鈕點擊（Lead）為例/g)
    assert.equal(matches.length, 1)
  })
})
