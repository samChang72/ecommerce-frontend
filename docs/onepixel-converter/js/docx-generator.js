import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType
} from 'docx'
import { getIntroSection, getEcommerceTable, getEventExample, getPropertiesTable } from './template.js'

const FONT = 'Calibri'
const CODE_FONT = 'Consolas'
const COLORS = {
  text: '1E293B',
  muted: '475569',
  codeBg: 'F1F5F9',
  border: 'E2E8F0',
  white: 'FFFFFF'
}

function textRun(text, options = {}) {
  return new TextRun({
    text,
    font: options.code ? CODE_FONT : FONT,
    size: options.size || 22,
    bold: options.bold || false,
    color: options.color || COLORS.text,
    ...options
  })
}

function heading(text, level) {
  return new Paragraph({
    children: [textRun(text, { bold: true, size: level === 1 ? 32 : 26 })],
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { before: level === 1 ? 0 : 300, after: 120 }
  })
}

function bodyParagraph(text, options = {}) {
  return new Paragraph({
    children: [textRun(text, options)],
    spacing: { after: 80 }
  })
}

function bulletPoint(text) {
  return new Paragraph({
    children: [textRun(text)],
    bullet: { level: 0 },
    spacing: { after: 40 }
  })
}

function codeBlock(code) {
  const lines = code.split('\n')
  const codeParagraphs = lines.map(line =>
    new Paragraph({
      children: [textRun(line || ' ', { code: true, size: 18, color: COLORS.text })],
      spacing: { after: 0, line: 276 }
    })
  )

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border }
  }

  return [new Table({
    rows: [new TableRow({
      children: [new TableCell({
        children: codeParagraphs,
        borders: cellBorder,
        shading: { type: ShadingType.CLEAR, fill: COLORS.codeBg },
        width: { size: 9026, type: WidthType.DXA }
      })]
    })],
    width: { size: 9026, type: WidthType.DXA }
  })]
}

function emptyLine() {
  return new Paragraph({ children: [], spacing: { after: 80 } })
}

function mdTableToDocxTable(mdText) {
  const lines = mdText.trim().split('\n')
  const dataRows = lines.filter(line =>
    line.trim().startsWith('|') && !line.trim().match(/^\|\s*:?-+/)
  )

  if (dataRows.length === 0) return []

  const parseRow = (row) =>
    row.split('|').slice(1, -1).map(cell => cell.trim())

  const headerCells = parseRow(dataRows[0])
  const colCount = headerCells.length

  // Distribute column widths evenly in DXA (1/20 of a point, A4 ~= 9026 DXA usable)
  const totalWidth = 9026
  const colWidth = Math.floor(totalWidth / colCount)

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border }
  }

  const headerRow = new TableRow({
    children: headerCells.map(cell =>
      new TableCell({
        children: [new Paragraph({
          children: [textRun(cell.replace(/\*\*/g, ''), { bold: true, size: 20 })],
          alignment: AlignmentType.CENTER
        })],
        width: { size: colWidth, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: COLORS.codeBg },
        borders: cellBorder
      })
    )
  })

  const bodyRows = dataRows.slice(1).map(row => {
    const cells = parseRow(row)
    return new TableRow({
      children: Array.from({ length: colCount }, (_, i) =>
        new TableCell({
          children: [new Paragraph({
            children: [textRun((cells[i] || '').replace(/\*\*/g, ''), { size: 20 })],
            alignment: AlignmentType.CENTER
          })],
          width: { size: colWidth, type: WidthType.DXA },
          borders: cellBorder
        })
      )
    })
  })

  return [new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth)
  })]
}

function parseMdSection(md) {
  const paragraphs = []
  const lines = md.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      i++
      const codeLines = []
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      paragraphs.push(...codeBlock(codeLines.join('\n')))
      paragraphs.push(emptyLine())
      continue
    }

    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      paragraphs.push(...mdTableToDocxTable(tableLines.join('\n')))
      paragraphs.push(emptyLine())
      continue
    }

    if (line.startsWith('* ')) {
      paragraphs.push(bulletPoint(line.slice(2)))
      i++
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    const boldMatch = line.match(/^\*\*(.+)\*\*$/)
    if (boldMatch) {
      paragraphs.push(bodyParagraph(boldMatch[1], { bold: true }))
    } else {
      paragraphs.push(bodyParagraph(line.replace(/\*\*(.+?)\*\*/g, '$1')))
    }
    i++
  }

  return paragraphs
}

function buildEventExampleParagraphs(events) {
  const seen = new Set()
  const paragraphs = []

  for (const event of events) {
    if (seen.has(event.type)) continue
    seen.add(event.type)
    const md = getEventExample(event.type, event.id)
    if (md) {
      paragraphs.push(...parseMdSection(md))
    }
  }

  return paragraphs
}

export async function generateDocx(data, clientName) {
  const title = `OnePixel 部署說明 – ${clientName}`

  const children = [
    heading(title, 1),
    ...parseMdSection(getIntroSection()),
    heading('初始化程式碼（必要）', 2),
    bodyParagraph('請將以下程式碼放入網站所有頁面的 <body> 中：'),
    ...codeBlock(data.initCode),
    emptyLine()
  ]

  if (data.events && data.events.length > 0) {
    children.push(heading('標準事件程式碼', 2))
    children.push(bodyParagraph('請依照需求將以下事件程式碼加在適當的位置（必須在初始化程式碼後）：'))

    for (const event of data.events) {
      children.push(bodyParagraph(`${event.type}（${event.name}）：`, { bold: true }))
      children.push(...codeBlock(event.code))
      children.push(emptyLine())
    }
  }

  children.push(...parseMdSection(getEcommerceTable()))
  children.push(...buildEventExampleParagraphs(data.events))
  children.push(...parseMdSection(getPropertiesTable()))

  const doc = new Document({
    sections: [{ children }]
  })

  return Packer.toBlob(doc)
}
