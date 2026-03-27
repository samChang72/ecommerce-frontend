# OnePixel Converter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pure frontend tool that converts OneAD-exported OnePixel HTML into client deployment Markdown documents.

**Architecture:** Vanilla HTML + CSS + JS (ES Modules), zero dependencies. Parser extracts structured data from HTML via DOMParser, generator combines dynamic data with fixed template content to produce Markdown. Tests use Node.js built-in test runner for pure logic modules.

**Tech Stack:** Vanilla JS (ES Modules), CSS, Node.js `node:test` for unit tests.

---

### Task 1: Project scaffolding

**Files:**
- Create: `css/style.css`
- Create: `js/parser.js`
- Create: `js/template.js`
- Create: `js/generator.js`
- Create: `js/app.js`
- Create: `index.html`
- Create: `tests/parser.test.js`
- Create: `tests/generator.test.js`

**Step 1: Create empty module files with exports**

`js/parser.js`:
```js
export function parseOnePixelHtml(htmlString) {
  throw new Error('Not implemented')
}
```

`js/template.js`:
```js
export function getFixedSections() {
  throw new Error('Not implemented')
}

export function getEventExample(eventType) {
  throw new Error('Not implemented')
}
```

`js/generator.js`:
```js
export function generateMarkdown(data, clientName) {
  throw new Error('Not implemented')
}
```

`js/app.js`:
```js
// UI controller — implemented in Task 5
```

`css/style.css`:
```css
/* Styles — implemented in Task 6 */
```

`index.html`:
```html
<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="UTF-8">
  <title>OnePixel Converter</title>
</head>
<body>
  <p>Scaffolding</p>
</body>
</html>
```

**Step 2: Commit**

```bash
git add index.html css/ js/ tests/
git commit -m "chore: scaffold project structure with empty modules"
```

---

### Task 2: parser.js — Extract structured data from HTML

**Files:**
- Modify: `js/parser.js`
- Create: `tests/parser.test.js`
- Reference: `onead-testOnePixel.html` (test fixture)

**Step 1: Write failing tests**

`tests/parser.test.js`:
```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseOnePixelHtml } from '../js/parser.js'

const fixtureHtml = readFileSync(
  new URL('../onead-testOnePixel.html', import.meta.url),
  'utf-8'
)

describe('parseOnePixelHtml', () => {
  it('extracts pixel ID', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.pixelId, '586731500')
  })

  it('extracts name', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.name, 'onead-test')
  })

  it('extracts init code containing onep init call', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.ok(result.initCode.includes("onep('init', '586731500')"))
    assert.ok(result.initCode.includes("onep('track', 'PageView')"))
  })

  it('extracts correct number of events', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.events.length, 3)
  })

  it('extracts event type from parentheses', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.events[0].type, 'Lead')
    assert.equal(result.events[2].type, 'Purchase')
  })

  it('extracts event name', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.events[0].name, 'lead')
    assert.equal(result.events[2].name, 'pp')
  })

  it('extracts event IDs', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.equal(result.events[0].id, '715841193')
    assert.equal(result.events[1].id, '564467372')
    assert.equal(result.events[2].id, '428882660')
  })

  it('extracts event code containing onep track call', () => {
    const result = parseOnePixelHtml(fixtureHtml)
    assert.ok(result.events[0].code.includes("onep('track', 'Lead'"))
    assert.ok(result.events[2].code.includes("onep('track', 'Purchase'"))
  })

  it('returns error for invalid HTML', () => {
    assert.throws(() => parseOnePixelHtml('<html><body></body></html>'), {
      message: /無法解析/
    })
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
node --experimental-vm-modules --test tests/parser.test.js
```
Expected: FAIL with "Not implemented"

**Step 3: Implement parser.js**

`js/parser.js`:
```js
/**
 * Parse OneAD-exported OnePixel HTML into structured data.
 * Uses JSDOM in Node.js tests, DOMParser in browser.
 */
export function parseOnePixelHtml(htmlString) {
  const doc = parseToDom(htmlString)

  const pixelId = extractPixelId(doc, htmlString)
  const name = extractName(doc)
  const initCode = extractInitCode(doc)
  const events = extractEvents(doc)

  if (!pixelId) {
    throw new Error('無法解析：找不到 OnePixel ID')
  }

  return { pixelId, name, initCode, events }
}

function parseToDom(htmlString) {
  if (typeof DOMParser !== 'undefined') {
    return new DOMParser().parseFromString(htmlString, 'text/html')
  }
  // Node.js environment — use linkedom
  throw new Error('需要瀏覽器環境或 linkedom')
}

function extractPixelId(doc, htmlString) {
  const match = htmlString.match(/onep\(\s*['"]init['"]\s*,\s*['"](\d+)['"]\s*\)/)
  return match ? match[1] : null
}

function extractName(doc) {
  const paragraphs = doc.querySelectorAll('p')
  for (const p of paragraphs) {
    const text = p.textContent.trim()
    const match = text.match(/名稱[：:](.+)/)
    if (match && !text.includes('類型')) {
      return match[1].trim()
    }
  }
  return ''
}

function extractInitCode(doc) {
  const codeElements = doc.querySelectorAll('code')
  if (codeElements.length === 0) return ''

  const firstCode = codeElements[0].textContent.trim()
  return firstCode
}

function extractEvents(doc) {
  const events = []
  const containers = doc.querySelectorAll('.mb-4.font-bold, [class*="mb-4"][class*="font-bold"]')

  for (const container of containers) {
    const paragraphs = container.querySelectorAll('p')
    let type = ''
    let name = ''
    let id = ''
    let code = ''

    for (const p of paragraphs) {
      const text = p.textContent.trim()

      const typeMatch = text.match(/類型[：:].*\((\w+)\)/)
      if (typeMatch) {
        type = typeMatch[1]
      }

      const nameMatch = text.match(/^名稱[：:](.+)/)
      if (nameMatch && !text.includes('類型')) {
        name = nameMatch[1].trim()
      }
    }

    const codeEl = container.querySelector('code')
    if (codeEl) {
      code = codeEl.textContent.trim()
      const idMatch = code.match(/id\s*:\s*['"](\d+)['"]/)
      if (idMatch) {
        id = idMatch[1]
      }
    }

    if (type && code) {
      events.push({ type, name, id, code })
    }
  }

  return events
}
```

**Note:** `parseToDom` 在 Node.js 環境需要 DOM polyfill。測試檔需要加入 linkedom 或改用正則。由於零依賴原則，測試改用 `JSDOM`-free 方式：在測試中使用 `globalThis.DOMParser` polyfill（透過 linkedom devDependency），或改為瀏覽器測試。

**替代方案：** 測試中用 `--experimental-vm-modules` 搭配一個輕量 test helper 提供 DOMParser，或接受 `linkedom` 作為 devDependency。

**Step 4: Run tests to verify they pass**

```bash
node --experimental-vm-modules --test tests/parser.test.js
```
Expected: All 9 tests PASS

**Step 5: Commit**

```bash
git add js/parser.js tests/parser.test.js
git commit -m "feat: implement HTML parser for OnePixel data extraction"
```

---

### Task 3: template.js — Fixed Markdown template content

**Files:**
- Modify: `js/template.js`

**Step 1: Implement template.js with all fixed content**

Extract all fixed content from `OnePixel 部署說明 – Skechers.md`:
- `getIntroSection()` — What is OnePixel + required items + opi explanation
- `getEcommerceTable()` — Event recommendation table
- `getEventExample(eventType)` — Parameter examples per event type (AddToCart, InitiateCheckout, Purchase, ViewContent)
- `getPropertiesTable()` — Object properties reference

Each function returns a Markdown string. Content is copied verbatim from the Skechers template with dynamic placeholders where IDs should go.

**Step 2: Commit**

```bash
git add js/template.js
git commit -m "feat: add fixed Markdown template content sections"
```

---

### Task 4: generator.js — Combine data + template into Markdown

**Files:**
- Modify: `js/generator.js`
- Create: `tests/generator.test.js`

**Step 1: Write failing tests**

`tests/generator.test.js`:
```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateMarkdown } from '../js/generator.js'

const mockData = {
  pixelId: '586731500',
  name: 'onead-test',
  initCode: `<script type="text/javascript">
    !function (w, d, e, v) {
        if (w.onep) return;
        w.onep = function () {
            (w.onep_queue = w.onep_queue || []).push(arguments);
        };
        var n = d.createElement(e);
        n.async = !0;
        n.src = v;
        var t = d.getElementsByTagName(e)[0];
        t.parentNode.insertBefore(n, t);
    }(window, document, 'script', 'https://pixel.onead.com.tw/static/js/onead-pixel-v2.min.js');
    onep('init', '586731500');
    onep('track', 'PageView');
</script>`,
  events: [
    { type: 'Lead', name: 'lead', id: '715841193', code: "onep('track', 'Lead', { content_name: 'lead', id: '715841193' });" },
    { type: 'Purchase', name: 'pp', id: '428882660', code: "onep('track', 'Purchase', { content_name: 'pp', id: '428882660' });" }
  ]
}

describe('generateMarkdown', () => {
  it('includes client name in title', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('OnePixel 部署說明 – TestBrand'))
  })

  it('includes init code section', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes("onep('init', '586731500')"))
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
  })

  it('includes Purchase parameter example when Purchase event exists', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('transaction_id'))
  })

  it('does NOT include AddToCart example when not in events', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(!md.includes('加入購物車（Add To Cart）為例'))
  })

  it('includes properties table', () => {
    const md = generateMarkdown(mockData, 'TestBrand')
    assert.ok(md.includes('content_category'))
    assert.ok(md.includes('content_ids'))
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
node --experimental-vm-modules --test tests/generator.test.js
```
Expected: FAIL

**Step 3: Implement generator.js**

```js
import { getIntroSection, getEcommerceTable, getEventExample, getPropertiesTable } from './template.js'

export function generateMarkdown(data, clientName) {
  const sections = []

  sections.push(`**OnePixel 部署說明 – ${clientName}**`)
  sections.push(getIntroSection())
  sections.push(buildInitCodeSection(data.initCode))
  sections.push(buildEventsSection(data.events))
  sections.push(getEcommerceTable())
  sections.push(buildConditionalExamples(data.events))
  sections.push(getPropertiesTable())

  return sections.join('\n\n')
}

function buildInitCodeSection(initCode) {
  return [
    '**初始化程式碼**（必要）**：**',
    '',
    '* 程式放在 < body > < /body > 之間，如透過 Tag Manager 工具，請依工具設定說明。',
    '* 優先設定執行初始化程式碼',
    '',
    `| ${escapeTableContent(initCode)} |`,
    '| :---- |'
  ].join('\n')
}

function buildEventsSection(events) {
  if (events.length === 0) return ''

  const lines = ['**標準事件程式碼：**', '', '* 轉換事件，依照需求加在特定頁面或按鈕上（必須在初始化程式碼後）']

  for (const event of events) {
    lines.push('')
    lines.push(`${event.name} (${event.type})`)
    lines.push('')
    lines.push(`| <script>`)
    lines.push(`    // 轉換事件，依照需求加在適當的位置（必須在初始化程式碼後）`)
    lines.push(`    ${event.code}`)
    lines.push(`</script> |`)
    lines.push('| :---- |')
  }

  return lines.join('\n')
}

function buildConditionalExamples(events) {
  const eventTypes = new Set(events.map(e => e.type))
  const examples = []

  for (const type of ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase']) {
    if (eventTypes.has(type)) {
      const event = events.find(e => e.type === type)
      examples.push(getEventExample(type, event ? event.id : ''))
    }
  }

  return examples.length > 0 ? examples.join('\n\n') : ''
}

function escapeTableContent(text) {
  return text.replace(/\n/g, '     ').replace(/\|/g, '\\|')
}
```

**Step 4: Run tests to verify they pass**

```bash
node --experimental-vm-modules --test tests/generator.test.js
```
Expected: All 7 tests PASS

**Step 5: Commit**

```bash
git add js/generator.js tests/generator.test.js
git commit -m "feat: implement Markdown generator with conditional event examples"
```

---

### Task 5: app.js — UI controller (file upload, preview, download)

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`

**Step 1: Implement app.js**

```js
import { parseOnePixelHtml } from './parser.js'
import { generateMarkdown } from './generator.js'

const state = {
  parsedData: null,
  clientName: ''
}

export function init() {
  const dropZone = document.getElementById('drop-zone')
  const fileInput = document.getElementById('file-input')
  const clientNameInput = document.getElementById('client-name')
  const previewEl = document.getElementById('preview')
  const downloadBtn = document.getElementById('download-btn')
  const statusEl = document.getElementById('status')

  dropZone.addEventListener('click', () => fileInput.click())
  dropZone.addEventListener('dragover', handleDragOver)
  dropZone.addEventListener('dragleave', handleDragLeave)
  dropZone.addEventListener('drop', handleDrop)
  fileInput.addEventListener('change', handleFileSelect)
  clientNameInput.addEventListener('input', handleNameChange)
  downloadBtn.addEventListener('click', handleDownload)
}

function handleDragOver(e) {
  e.preventDefault()
  e.currentTarget.classList.add('drag-over')
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over')
}

function handleDrop(e) {
  e.preventDefault()
  e.currentTarget.classList.remove('drag-over')
  const file = e.dataTransfer.files[0]
  if (file) processFile(file)
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function processFile(file) {
  const statusEl = document.getElementById('status')
  const summaryEl = document.getElementById('summary')

  statusEl.textContent = '解析中...'
  statusEl.className = 'status loading'

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      state.parsedData = parseOnePixelHtml(e.target.result)

      document.getElementById('client-name').value = state.parsedData.name
      state.clientName = state.parsedData.name

      summaryEl.textContent = `Pixel ID: ${state.parsedData.pixelId} | 事件數: ${state.parsedData.events.length}`
      statusEl.textContent = '解析成功'
      statusEl.className = 'status success'

      updatePreview()
    } catch (err) {
      statusEl.textContent = `解析失敗：${err.message}`
      statusEl.className = 'status error'
    }
  }
  reader.readAsText(file)
}

function handleNameChange(e) {
  state.clientName = e.target.value
  if (state.parsedData) updatePreview()
}

function updatePreview() {
  const previewEl = document.getElementById('preview')
  const downloadBtn = document.getElementById('download-btn')
  const name = state.clientName || state.parsedData.name

  const markdown = generateMarkdown(state.parsedData, name)
  previewEl.textContent = markdown
  downloadBtn.disabled = false
}

function handleDownload() {
  const name = state.clientName || 'Unknown'
  const markdown = document.getElementById('preview').textContent
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OnePixel 部署說明 – ${name}.md`
  a.click()
  URL.revokeObjectURL(url)
}

document.addEventListener('DOMContentLoaded', init)
```

**Step 2: Implement index.html**

Full HTML with semantic structure, all IDs matching app.js selectors.

**Step 3: Verify in browser**

```bash
npx serve . -l 3000
```
Open http://localhost:3000, upload `onead-testOnePixel.html`, verify:
- Status shows "解析成功"
- Summary shows Pixel ID and event count
- Client name auto-populated
- Preview shows Markdown
- Download button enabled and produces correct .md file

**Step 4: Commit**

```bash
git add js/app.js index.html
git commit -m "feat: implement UI with file upload, preview, and download"
```

---

### Task 6: style.css — Flat design styling

**Files:**
- Modify: `css/style.css`

**Step 1: Implement styles**

Flat design with:
- Inter font from Google Fonts (link in index.html)
- Colors: `#F8FAFC` bg, `#1E293B` text, `#3B82F6` primary, `#F97316` CTA
- Single column layout, max-width 720px, centered
- Dashed border drop zone with drag-over highlight
- `<pre>` preview with light border, overflow auto
- Orange download button with hover opacity transition 150ms
- Disabled button style (opacity 0.5, cursor not-allowed)
- Responsive padding: 16px mobile, 24px tablet, 32px desktop
- All interactive elements: cursor-pointer
- Focus visible outlines for keyboard nav

**Step 2: Verify in browser**

Visual check at 375px, 768px, 1024px widths.

**Step 3: Commit**

```bash
git add css/style.css index.html
git commit -m "feat: add flat design styling with responsive layout"
```

---

### Task 7: Node.js test environment setup

**Files:**
- Create: `package.json` (minimal, for test script only)
- Modify: `tests/parser.test.js` (add linkedom for DOMParser polyfill)

**Step 1: Init package.json and add linkedom as devDependency**

```bash
npm init -y
npm install --save-dev linkedom
```

**Step 2: Add test helper**

Create `tests/setup.js`:
```js
import { parseHTML } from 'linkedom'

const { document, DOMParser } = parseHTML('<!DOCTYPE html><html></html>')
globalThis.DOMParser = DOMParser
```

**Step 3: Add test script to package.json**

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules --import ./tests/setup.js --test tests/*.test.js"
  }
}
```

**Step 4: Run all tests**

```bash
npm test
```
Expected: All tests PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json tests/setup.js
git commit -m "chore: add test environment with linkedom for DOMParser polyfill"
```

---

### Task 8: End-to-end verification

**Step 1: Run all unit tests**

```bash
npm test
```
Expected: All PASS

**Step 2: Manual browser test**

```bash
npx serve . -l 3000
```

Checklist:
- [ ] Upload `onead-testOnePixel.html` via drag & drop
- [ ] Upload via file picker click
- [ ] Pixel ID shows `586731500`
- [ ] Client name auto-populated as `onead-test`
- [ ] Change client name → preview updates
- [ ] Preview contains init code + 3 events (2 Lead, 1 Purchase)
- [ ] Download produces correct filename
- [ ] Downloaded .md content matches expected format
- [ ] Upload invalid HTML → shows error message
- [ ] Download button disabled before upload

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: OnePixel Converter v1.0 complete"
```
