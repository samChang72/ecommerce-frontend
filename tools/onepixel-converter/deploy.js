import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = __dirname
const TARGET_DIR = resolve(__dirname, '../../docs/onepixel-converter')

const FILES = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/parser.js',
  'js/generator.js',
  'js/html-generator.js',
  'js/docx-generator.js',
  'js/template.js'
]

function sha256(filePath) {
  const content = readFileSync(filePath)
  return createHash('sha256').update(content).digest('hex')
}

console.log('=== OnePixel Converter Deploy ===')
console.log(`Source: ${SOURCE_DIR}`)
console.log(`Target: ${TARGET_DIR}`)
console.log('')

let changed = 0

for (const file of FILES) {
  const src = resolve(SOURCE_DIR, file)
  const dst = resolve(TARGET_DIR, file)

  if (!existsSync(src)) {
    console.log(`  SKIP: ${file} (not found)`)
    continue
  }

  const dstDir = dirname(dst)
  if (!existsSync(dstDir)) {
    mkdirSync(dstDir, { recursive: true })
  }

  const srcHash = sha256(src)
  const dstHash = existsSync(dst) ? sha256(dst) : ''

  if (srcHash === dstHash) {
    console.log(`  OK: ${file} (unchanged)`)
  } else {
    writeFileSync(dst, readFileSync(src))
    console.log(`  CP: ${file}`)
    changed++
  }
}

console.log('')
if (changed === 0) {
  console.log('No files changed.')
} else {
  console.log(`${changed} file(s) updated.`)
}
