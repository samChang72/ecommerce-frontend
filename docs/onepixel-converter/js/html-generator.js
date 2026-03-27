import { getIntroSection, getEcommerceTable, getEventExample, getPropertiesTable } from './template.js'

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function mdToHtml(md) {
  const lines = md.split('\n')
  const htmlParts = []
  let i = 0
  let inList = false

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (inList) { htmlParts.push('</ul>'); inList = false }
      i++
      const codeLines = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      htmlParts.push(`<div class="code-block"><pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre></div>`)
      continue
    }

    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      if (inList) { htmlParts.push('</ul>'); inList = false }
      htmlParts.push(mdTableToHtmlTable(tableLines))
      continue
    }

    if (line.startsWith('* ')) {
      if (!inList) { htmlParts.push('<ul>'); inList = true }
      htmlParts.push(`<li>${inlineMd(line.slice(2))}</li>`)
      i++
      continue
    }

    if (inList) { htmlParts.push('</ul>'); inList = false }

    if (line.trim() === '') {
      i++
      continue
    }

    htmlParts.push(`<p>${inlineMd(line)}</p>`)
    i++
  }

  if (inList) htmlParts.push('</ul>')
  return htmlParts.join('\n')
}

function mdTableToHtmlTable(lines) {
  const dataRows = lines.filter(line =>
    line.trim().startsWith('|') && !line.trim().match(/^\|\s*:?-+/)
  )

  if (dataRows.length === 0) return ''

  const parseRow = (row) =>
    row.split('|').slice(1, -1).map(cell => cell.trim())

  const headerCells = parseRow(dataRows[0])
  const headerHtml = headerCells.map(c => `<th>${c}</th>`).join('')
  const bodyRows = dataRows.slice(1).map(row => {
    const cells = parseRow(row)
    return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`
  }).join('\n')

  return `<table>
<thead><tr>${headerHtml}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>`
}

function inlineMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function buildInitCodeHtml(initCode) {
  return `<h2>初始化程式碼（必要）</h2>
<p>請將以下程式碼放入網站所有頁面的 &lt;body&gt; 中：</p>
<div class="code-block"><pre><code>${escapeHtml(initCode)}</code></pre></div>`
}

function buildEventsHtml(events) {
  if (!events || events.length === 0) return ''

  const blocks = events.map(event =>
    `<h3>${escapeHtml(event.type)}（${escapeHtml(event.name)}）</h3>
<div class="code-block"><pre><code>${escapeHtml(event.code)}</code></pre></div>`
  ).join('\n')

  return `<h2>標準事件程式碼</h2>
<p>請依照需求將以下事件程式碼加在適當的位置（必須在初始化程式碼後）：</p>
${blocks}`
}

function buildEventExamplesHtml(events) {
  const seen = new Set()

  const examples = events
    .filter((event) => {
      if (seen.has(event.type)) return false
      seen.add(event.type)
      return true
    })
    .map((event) => {
      const md = getEventExample(event.type, event.id)
      return md ? mdToHtml(md) : ''
    })
    .filter(Boolean)

  return examples.length > 0 ? examples.join('\n') : ''
}

export function generateHtml(data, clientName) {
  const title = `OnePixel 部署說明 – ${clientName}`
  const introHtml = mdToHtml(getIntroSection())
  const initHtml = buildInitCodeHtml(data.initCode)
  const eventsHtml = buildEventsHtml(data.events)
  const ecommerceHtml = mdToHtml(getEcommerceTable())
  const examplesHtml = buildEventExamplesHtml(data.events)
  const propertiesHtml = mdToHtml(getPropertiesTable())

  return `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1E293B;
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      line-height: 1.6;
    }
    h1 { font-size: 22px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; }
    h2 { font-size: 18px; margin-top: 28px; color: #334155; }
    h3 { font-size: 15px; margin-top: 20px; color: #475569; }
    p { margin: 8px 0; }
    ul { padding-left: 20px; }
    li { margin: 4px 0; }
    .code-block {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 16px;
      margin: 12px 0;
      overflow-x: auto;
    }
    .code-block pre { margin: 0; }
    .code-block code {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 13px;
      line-height: 1.8;
      white-space: pre;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #E2E8F0;
      padding: 8px 12px;
      text-align: left;
    }
    th { background: #F1F5F9; font-weight: 600; }
    tr:nth-child(even) { background: #F8FAFC; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${introHtml}
  ${initHtml}
  ${eventsHtml}
  ${ecommerceHtml}
  ${examplesHtml}
  ${propertiesHtml}
</body>
</html>`
}
