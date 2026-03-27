import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateHtml } from '../js/html-generator.js'

const mockData = {
  pixelId: '586731500',
  name: 'onead-test',
  initCode: '<script type="text/javascript">\n    onep(\'init\', \'586731500\');\n    onep(\'track\', \'PageView\');\n</script>',
  events: [
    { type: 'Lead', name: 'lead', id: '715841193', code: '<script>\n    onep(\'track\', \'Lead\', { content_name: \'lead\', id: \'715841193\' });\n</script>' },
    { type: 'Purchase', name: 'pp', id: '428882660', code: '<script>\n    onep(\'track\', \'Purchase\', { content_name: \'pp\', id: \'428882660\' });\n</script>' }
  ]
}

describe('generateHtml', () => {
  it('returns valid HTML document', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.startsWith('<!DOCTYPE html>'))
    assert.ok(html.includes('</html>'))
  })

  it('includes client name in title and h1', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.includes('<title>OnePixel 部署說明 – TestBrand</title>'))
    assert.ok(html.includes('OnePixel 部署說明 – TestBrand</h1>'))
  })

  it('includes init code in code block', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.includes('onep(&#x27;init&#x27;, &#x27;586731500&#x27;)') || html.includes("onep('init', '586731500')") || html.includes('586731500'))
  })

  it('includes event sections', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.includes('Lead'))
    assert.ok(html.includes('Purchase'))
  })

  it('includes intro section', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.includes('什麼是 OnePixel'))
  })

  it('escapes HTML in client name to prevent XSS', () => {
    const html = generateHtml(mockData, '<script>alert("xss")</script>')
    assert.ok(!html.includes('<script>alert'))
    assert.ok(html.includes('&lt;script&gt;alert'))
  })

  it('includes embedded styles', () => {
    const html = generateHtml(mockData, 'TestBrand')
    assert.ok(html.includes('<style>'))
    assert.ok(html.includes('.code-block'))
  })
})
