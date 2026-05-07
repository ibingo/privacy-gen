export function markdownToHtml(markdown) {
  return markdown
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^\*\*(.+?)\*\*$/gm, '<p><strong>$1</strong></p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul]|<\/|<hr|<p>)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}

export function buildHtmlDocument(title, contentHtml) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      color: #1f2937;
      background: #f6f7fb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      line-height: 1.8;
    }
    main {
      max-width: 880px;
      margin: 0 auto;
      padding: 48px 24px;
      background: #fff;
      min-height: 100vh;
      box-sizing: border-box;
    }
    h2, h3, h4 {
      color: #111827;
      line-height: 1.35;
    }
    h2 {
      margin: 0 0 24px;
      font-size: 28px;
    }
    h3 {
      margin: 28px 0 12px;
      font-size: 20px;
    }
    h4 {
      margin: 20px 0 8px;
      font-size: 16px;
    }
    p {
      margin: 10px 0;
    }
    ul {
      padding-left: 22px;
    }
    li {
      margin: 6px 0;
    }
    hr {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 28px 0;
    }
    @media (max-width: 720px) {
      main {
        padding: 32px 18px;
      }
      h2 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <main>
${contentHtml}
  </main>
</body>
</html>`
}

export function downloadFile(filename, type, content) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
