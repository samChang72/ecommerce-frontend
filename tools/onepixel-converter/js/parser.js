/**
 * Parses OneAD-exported OnePixel HTML and extracts structured pixel data.
 * @param {string} htmlString - Raw HTML string from OneAD export
 * @returns {{ pixelId: string, name: string, initCode: string, events: Array<{ type: string, name: string, id: string, code: string }> }}
 */
export function parseOnePixelHtml(htmlString) {
  const doc = new DOMParser().parseFromString(htmlString, 'text/html')

  const pixelId = extractPixelId(doc)
  const name = extractName(doc)
  const rawInitCode = extractInitCode(doc)
  const allEvents = extractEvents(doc)

  const { initCode, events, warnings } = mergePageViewEvent(rawInitCode, allEvents)

  return { pixelId, name, initCode, events, warnings }
}

/**
 * Checks if a PageView event exists in the event list.
 * If yes: merges its full onep call into initCode, replacing the bare onep('track', 'PageView').
 * If no: adds a warning that the user needs to create a PageView event in SuperDSP.
 */
function mergePageViewEvent(initCode, allEvents) {
  const pageViewIndex = allEvents.findIndex(e => e.type === 'PageView')

  if (pageViewIndex === -1) {
    return {
      initCode,
      events: allEvents,
      warnings: ['此 OnePixel 尚未設定「全站進站 (Page View)」事件，請先至 SuperDSP 新增 PageView 事件後再重新匯出。']
    }
  }

  const pageViewEvent = allEvents[pageViewIndex]
  const pageViewTrackLine = extractScriptBody(pageViewEvent.code).trim()

  const updatedInitCode = initCode.replace(
    /onep\(\s*['"]track['"]\s*,\s*['"]PageView['"]\s*\)\s*;?/,
    pageViewTrackLine
  )

  const remainingEvents = [
    ...allEvents.slice(0, pageViewIndex),
    ...allEvents.slice(pageViewIndex + 1)
  ]

  return {
    initCode: updatedInitCode,
    events: remainingEvents,
    warnings: []
  }
}

/**
 * Extracts the OnePixel ID from a <p> element containing "OnePixel ID：".
 */
function extractPixelId(doc) {
  const paragraphs = [...doc.querySelectorAll('p')]
  const idParagraph = paragraphs.find(p =>
    p.textContent.includes('OnePixel ID：')
  )

  if (!idParagraph) {
    throw new Error('無法解析：找不到 OnePixel ID')
  }

  const match = idParagraph.textContent.match(/OnePixel ID：(\d+)/)
  if (!match) {
    throw new Error('無法解析：OnePixel ID 格式不正確')
  }

  return match[1]
}

/**
 * Extracts the pixel name from the <p> element immediately following the ID paragraph.
 * Looks for the first "名稱：" that is a sibling of the OnePixel ID paragraph.
 */
function extractName(doc) {
  const paragraphs = [...doc.querySelectorAll('p')]
  const idParagraph = paragraphs.find(p =>
    p.textContent.includes('OnePixel ID：')
  )

  if (!idParagraph) {
    throw new Error('無法解析：找不到 OnePixel ID 段落')
  }

  const parent = idParagraph.parentElement
  const siblingParagraphs = [...parent.querySelectorAll('p')]
  const nameParagraph = siblingParagraphs.find(p =>
    p.textContent.includes('名稱：')
  )

  if (!nameParagraph) {
    throw new Error('無法解析：找不到名稱')
  }

  const match = nameParagraph.textContent.match(/名稱：(.+)/)
  return match[1].trim()
}

/**
 * Extracts the init code from the first <code> element in the document.
 * The code element contains HTML-entity-encoded script; textContent decodes it.
 */
function extractInitCode(doc) {
  const codeElements = doc.querySelectorAll('code')
  if (codeElements.length === 0) {
    throw new Error('無法解析：找不到程式碼區塊')
  }

  const rawCode = codeElements[0].textContent.trim()
  return `<script type="text/javascript">\n${extractScriptBody(rawCode)}\n</script>`
}

/**
 * Strips surrounding <script> tags from decoded code text, returning inner body.
 */
function extractScriptBody(codeText) {
  const scriptMatch = codeText.match(
    /^<script[^>]*>\s*([\s\S]*?)\s*<\/script>$/
  )
  return scriptMatch ? scriptMatch[1] : codeText
}

/**
 * Extracts all event blocks from the document.
 * Event blocks are <div> elements with class "mb-4" and "font-bold" that contain
 * a "類型：" paragraph and a <code> element.
 */
function extractEvents(doc) {
  const eventDivs = [...doc.querySelectorAll('div.mb-4.font-bold')]

  return eventDivs.map(div => {
    const paragraphs = [...div.querySelectorAll('p')]

    const typeParagraph = paragraphs.find(p =>
      p.textContent.includes('類型：')
    )
    const nameParagraph = paragraphs.find(p =>
      p.textContent.includes('名稱：')
    )
    const codeElement = div.querySelector('code')

    if (!typeParagraph || !nameParagraph || !codeElement) {
      throw new Error('無法解析：事件區塊結構不完整')
    }

    const type = extractEventType(typeParagraph.textContent)
    const name = extractEventName(nameParagraph.textContent)
    const rawCode = codeElement.textContent.trim()
    const id = extractEventId(rawCode)
    const code = `<script>\n${extractScriptBody(rawCode)}\n</script>`

    return { type, name, id, code }
  })
}

/**
 * Extracts the English event type from parentheses, e.g. "按鈕點擊 (Lead)" -> "Lead".
 */
function extractEventType(text) {
  const match = text.match(/\((.+?)\)/)
  if (!match) {
    throw new Error('無法解析：事件類型格式不正確')
  }
  return match[1].replace(/\s+/g, '')
}

/**
 * Extracts the event name after "名稱：".
 */
function extractEventName(text) {
  const match = text.match(/名稱：(.+)/)
  if (!match) {
    throw new Error('無法解析：事件名稱格式不正確')
  }
  return match[1].trim()
}

/**
 * Extracts the event ID from the code text, matching id: 'XXXXX' or id: "XXXXX".
 */
function extractEventId(codeText) {
  const match = codeText.match(/id:\s*['"](\d+)['"]/)
  if (!match) {
    throw new Error('無法解析：事件 ID 格式不正確')
  }
  return match[1]
}
