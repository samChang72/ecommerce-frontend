import { getIntroSection, getEcommerceTable, getEventExample, getPropertiesTable } from './template.js'

function buildTitle(clientName) {
  return `**OnePixel 部署說明 – ${clientName}**`
}

function buildInitCodeSection(initCode) {
  return `**初始化程式碼（必要）：**
請將以下程式碼放入網站所有頁面的 <body> 中：

\`\`\`
${initCode}
\`\`\``
}

function buildEventsSection(events) {
  if (!events || events.length === 0) {
    return ''
  }

  const eventBlocks = events.map((event) =>
    `**${event.type}（${event.name}）：**

\`\`\`
${event.code}
\`\`\``
  )

  return `**標準事件程式碼：**
請依照需求將以下事件程式碼加在適當的位置（必須在初始化程式碼後）：

${eventBlocks.join('\n\n')}`
}

function buildEventExamples(events) {
  const seen = new Set()

  const examples = events
    .filter((event) => {
      if (seen.has(event.type)) return false
      seen.add(event.type)
      return true
    })
    .map((event) => getEventExample(event.type, event.id))
    .filter(Boolean)

  if (examples.length === 0) {
    return ''
  }

  return examples.join('\n\n')
}

export function generateMarkdown(data, clientName) {
  const sections = [
    buildTitle(clientName),
    getIntroSection(),
    buildInitCodeSection(data.initCode),
    buildEventsSection(data.events),
    getEcommerceTable(),
    buildEventExamples(data.events),
    getPropertiesTable()
  ]

  return sections.filter(Boolean).join('\n\n')
}
