import { parseOnePixelHtml } from './parser.js'
import { generateMarkdown } from './generator.js'
import { generateHtml } from './html-generator.js'
import { generateDocx } from './docx-generator.js'

const APP_VERSION = '1.1.0'

let state = { parsedData: null, clientName: '' }

const dropZone = document.getElementById('drop-zone')
const fileInput = document.getElementById('file-input')
const statusEl = document.getElementById('status')
const summaryEl = document.getElementById('summary')
const nameSection = document.getElementById('name-section')
const clientNameInput = document.getElementById('client-name')
const previewSection = document.getElementById('preview-section')
const previewEl = document.getElementById('preview')
const downloadBtn = document.getElementById('download-btn')
const downloadHtmlBtn = document.getElementById('download-html-btn')
const downloadDocxBtn = document.getElementById('download-docx-btn')
const copyBtn = document.getElementById('copy-btn')

function showStatus(message, type) {
  statusEl.textContent = message
  statusEl.className = `status ${type}`
  statusEl.hidden = false
}

function hideStatus() {
  statusEl.hidden = true
}

function showSummary(data) {
  const eventCount = data.events ? data.events.length : 0
  summaryEl.textContent =
    `Pixel ID: ${data.pixelId} ｜ 名稱: ${data.name} ｜ 事件數: ${eventCount}`
  summaryEl.hidden = false
}

function updatePreview() {
  const markdown = generateMarkdown(state.parsedData, state.clientName)
  previewEl.textContent = markdown
  previewSection.hidden = false
}

function isValidHtmlFile(file) {
  const validTypes = ['text/html', 'application/xhtml+xml']
  const validExtensions = ['.html', '.htm']
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  )
  return validTypes.includes(file.type) || hasValidExtension
}

function processFile(file) {
  if (!isValidHtmlFile(file)) {
    showStatus('請上傳 .html 或 .htm 檔案', 'error')
    return
  }

  showStatus('解析中...', 'loading')
  summaryEl.hidden = true
  nameSection.hidden = true
  previewSection.hidden = true
  downloadBtn.disabled = true

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const htmlString = e.target.result
      const parsedData = parseOnePixelHtml(htmlString)
      const defaultName = parsedData.name || ''

      state = { ...state, parsedData, clientName: defaultName }

      if (parsedData.warnings && parsedData.warnings.length > 0) {
        alert(parsedData.warnings.join('\n'))
      }

      showStatus('解析成功', 'success')
      showSummary(parsedData)

      clientNameInput.value = defaultName
      nameSection.hidden = false

      updatePreview()
      downloadBtn.disabled = false
      downloadHtmlBtn.disabled = false
      downloadDocxBtn.disabled = false
    } catch (error) {
      showStatus(error.message, 'error')
    }
  }

  reader.onerror = () => {
    showStatus('檔案讀取失敗', 'error')
  }

  reader.readAsText(file)
}

function handleDownload() {
  if (!state.parsedData) {
    return
  }

  const markdown = generateMarkdown(state.parsedData, state.clientName)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `OnePixel 部署說明 – ${state.clientName}.md`
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function handleDownloadHtml() {
  if (!state.parsedData) {
    return
  }

  const html = generateHtml(state.parsedData, state.clientName)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `OnePixel 部署說明 – ${state.clientName}.html`
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

async function handleDownloadDocx() {
  if (!state.parsedData) {
    return
  }

  try {
    downloadDocxBtn.textContent = '產生中...'
    downloadDocxBtn.disabled = true

    const blob = await generateDocx(state.parsedData, state.clientName)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `OnePixel 部署說明 – ${state.clientName}.docx`
    anchor.click()

    setTimeout(() => URL.revokeObjectURL(url), 10000)
  } catch (error) {
    showStatus(`DOCX 產生失敗：${error.message}`, 'error')
  } finally {
    downloadDocxBtn.textContent = '下載 .docx 檔案'
    downloadDocxBtn.disabled = false
  }
}

async function handleCopy() {
  if (!state.parsedData) {
    return
  }

  try {
    const markdown = generateMarkdown(state.parsedData, state.clientName)
    await navigator.clipboard.writeText(markdown)
    const originalText = copyBtn.textContent
    copyBtn.textContent = '已複製'
    setTimeout(() => {
      copyBtn.textContent = originalText
    }, 2000)
  } catch (error) {
    showStatus('複製失敗', 'error')
  }
}

dropZone.addEventListener('click', () => {
  fileInput.click()
})

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    fileInput.click()
  }
})

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')

  const files = e.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
})

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    processFile(fileInput.files[0])
  }
})

clientNameInput.addEventListener('input', () => {
  state = { ...state, clientName: clientNameInput.value }

  if (state.parsedData) {
    updatePreview()
  }
})

downloadBtn.addEventListener('click', handleDownload)
downloadHtmlBtn.addEventListener('click', handleDownloadHtml)
downloadDocxBtn.addEventListener('click', handleDownloadDocx)
copyBtn.addEventListener('click', handleCopy)

document.getElementById('version-footer').textContent = `v${APP_VERSION}`
