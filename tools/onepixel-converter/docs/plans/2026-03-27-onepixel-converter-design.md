# OnePixel Converter - Design Document

## Overview

Internal tool for AM/PM to convert OneAD-exported OnePixel HTML deployment pages into structured Markdown documents for client delivery.

## Target Users

Internal AM/PM staff who export HTML from the OneAD platform and need to quickly produce client-facing deployment guides.

## Requirements

- Upload a single HTML file (drag & drop or click)
- Parse HTML to extract: Pixel ID, name, init code, event codes (type/name/ID)
- Client name auto-populated from HTML, editable by user
- Generate Markdown following the standard deployment guide template
- Only output events that exist in the source HTML
- Fixed sections (e-commerce parameter examples, property reference) always included
- Matching parameter examples shown only for event types present in source
- Download as `.md` file named `OnePixel 部署說明 – {客戶名稱}.md`

## Tech Stack

- Vanilla HTML + CSS + JavaScript (ES Modules)
- Zero dependencies
- Local development with `npx serve`

## Architecture

```
dev-cloud-run1/
├── index.html              # Main page: upload + preview + download
├── css/
│   └── style.css           # Flat design, Inter font
├── js/
│   ├── parser.js           # HTML → structured data object
│   ├── generator.js        # Structured data + template → Markdown string
│   ├── template.js         # Fixed template content (descriptions, tables)
│   └── app.js              # UI: file upload, preview, download
└── docs/
    └── plans/
```

## Data Flow

```
HTML file → FileReader → DOMParser → parser.js (structured object)
    → generator.js + template.js → Markdown string
    → Preview display + Blob download
```

## Core Data Structure (parser.js output)

```js
{
  pixelId: '586731500',
  name: 'onead-test',
  initCode: '<script>...</script>',
  events: [
    { type: 'Lead', name: 'lead', id: '715841193', code: '<script>...</script>' },
    { type: 'Purchase', name: 'pp', id: '428882660', code: '<script>...</script>' }
  ]
}
```

## Parsing Strategy

- `DOMParser` to convert HTML string to DOM
- Regex `onep('init', 'XXXXX')` to extract Pixel ID
- Find `<p>` containing "名稱：" for name
- First `<code>` element for init code (HTML decoded)
- Iterate `<div>` blocks containing "類型：" to extract events:
  - Regex on parentheses for English event type (e.g., `Lead`)
  - Next `<p>` for event name
  - `<code>` content for event code and regex for event ID

## Markdown Generation

Output structure:
1. Title: `OnePixel 部署說明 – {客戶名稱}`
2. Fixed: What is OnePixel
3. Fixed: Required items
4. Fixed: opi explanation
5. Dynamic: Init code (with actual pixel ID)
6. Dynamic: Event codes (only events present in source HTML)
7. Fixed: E-commerce event recommendation table
8. Conditional: Parameter examples (only for event types present)
9. Fixed: Object properties reference table

## UI Design

- **Style:** Flat Design, no shadows, clean lines
- **Font:** Inter
- **Colors:** Primary `#3B82F6`, Background `#F8FAFC`, Text `#1E293B`, CTA `#F97316`
- **Layout:** Single column, centered `max-w-3xl`
- **Sections:**
  1. Upload area (drag & drop, dashed border)
  2. Client name input (auto-populated, editable, with `<label>`)
  3. Markdown preview (`<pre>` block) + orange download button
- **Interactions:**
  - Upload triggers instant parse with loading → success/error feedback
  - `cursor-pointer` on all clickable elements
  - Hover transitions 150ms
  - Download button disabled when no data

## Future Considerations

- Batch upload (multiple HTML → multiple MD)
- Deployment to Cloud Run or static hosting
