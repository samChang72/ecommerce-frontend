import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseOnePixelHtml } from '../js/parser.js'

const fixtureNoPageView = readFileSync(
  new URL('../fixtures/onead-testOnePixel.html', import.meta.url),
  'utf-8'
)

const fixtureWithPageView = readFileSync(
  new URL('../fixtures/onead-testOnePixel (1).html', import.meta.url),
  'utf-8'
)

describe('parseOnePixelHtml — without PageView event', () => {
  it('extracts pixel ID', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.pixelId, '586731500')
  })

  it('extracts name', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.name, 'onead-test')
  })

  it('keeps bare PageView in init code when no PageView event', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.ok(result.initCode.includes("onep('init', '586731500')"))
    assert.ok(result.initCode.includes("onep('track', 'PageView')"))
    assert.ok(!result.initCode.includes('content_name'))
  })

  it('returns warning when no PageView event', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.warnings.length, 1)
    assert.ok(result.warnings[0].includes('SuperDSP'))
  })

  it('extracts correct number of events (3)', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.events.length, 3)
  })

  it('extracts event types from parentheses', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.events[0].type, 'Lead')
    assert.equal(result.events[1].type, 'Lead')
    assert.equal(result.events[2].type, 'Purchase')
  })

  it('extracts event names', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.events[0].name, 'lead')
    assert.equal(result.events[1].name, 'lead')
    assert.equal(result.events[2].name, 'pp')
  })

  it('extracts event IDs', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.equal(result.events[0].id, '715841193')
    assert.equal(result.events[1].id, '564467372')
    assert.equal(result.events[2].id, '428882660')
  })

  it('extracts event code with onep track calls', () => {
    const result = parseOnePixelHtml(fixtureNoPageView)
    assert.ok(result.events[0].code.includes("onep('track', 'Lead'"))
    assert.ok(result.events[2].code.includes("onep('track', 'Purchase'"))
  })

  it('throws on invalid HTML without OnePixel data', () => {
    assert.throws(() => parseOnePixelHtml('<html><body></body></html>'), {
      message: /無法解析/
    })
  })
})

describe('parseOnePixelHtml — with PageView event', () => {
  it('merges PageView track call into init code', () => {
    const result = parseOnePixelHtml(fixtureWithPageView)
    assert.ok(result.initCode.includes("onep('track', 'PageView', { content_name: 'PageView', id: '799212711' })"))
    assert.ok(!result.initCode.match(/onep\(\s*['"]track['"]\s*,\s*['"]PageView['"]\s*\)\s*;?\s*$/m))
  })

  it('removes PageView from events list', () => {
    const result = parseOnePixelHtml(fixtureWithPageView)
    const pageViewEvents = result.events.filter(e => e.type === 'PageView')
    assert.equal(pageViewEvents.length, 0)
  })

  it('keeps other events intact', () => {
    const result = parseOnePixelHtml(fixtureWithPageView)
    assert.equal(result.events.length, 3)
    assert.equal(result.events[0].type, 'Lead')
    assert.equal(result.events[1].type, 'Lead')
    assert.equal(result.events[2].type, 'Purchase')
  })

  it('returns no warnings', () => {
    const result = parseOnePixelHtml(fixtureWithPageView)
    assert.equal(result.warnings.length, 0)
  })

  it('preserves init code structure', () => {
    const result = parseOnePixelHtml(fixtureWithPageView)
    assert.ok(result.initCode.includes("onep('init', '586731500')"))
    assert.ok(result.initCode.includes('<script type="text/javascript">'))
    assert.ok(result.initCode.includes('</script>'))
  })
})
