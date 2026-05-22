import { isPathData, normalizePathItems } from './pathData'

const slugify = (value) => {
  const slug = String(value || 'untitled-icon')
    .replace(/\.(fig|json|svg)$/i, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .toLowerCase()

  return slug || 'untitled-icon'
}

const inferIconType = (value) => {
  const name = String(value || '').replace(/\.(fig|json|svg)$/i, '')
  const normalized = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
  if (/(^|[-_\s.])(filled|fill|solid|bold)([-_\s.]|$)/i.test(normalized)) return 'fill'
  return 'stroke'
}

const uniquePaths = (paths) => {
  const seen = new Set()
  return normalizePathItems(paths).filter((item) => {
    const key = item.d.trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const iconFromPaths = ({ name, frame, paths, category = '' }) => ({
  id: `${slugify(name)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: slugify(name),
  category,
  iconType: inferIconType(name),
  updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  status: '草稿',
  statusTone: 'processing',
  figmaFrame: frame || `Imported / ${name}`,
  paths: uniquePaths(paths)
})

export const parseSvgIcons = (content, fileName = 'imported.svg') => {
  const documentMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
  if (!documentMatch) return []

  const title = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()
  const matches = [...content.matchAll(/<path[^>]+d=["']([^"']+)["']/gi)]
  const paths = matches.map((match) => ({ d: match[1], stroke: true }))

  if (!paths.length) return []

  return [
    iconFromPaths({
      name: title || fileName,
      frame: `SVG / ${fileName}`,
      paths
    })
  ]
}

const collectGeometryPaths = (node) => {
  const paths = []
  const geometryFields = ['vectorPaths', 'fillGeometry', 'strokeGeometry']

  geometryFields.forEach((field) => {
    if (!Array.isArray(node?.[field])) return
    node[field].forEach((geometry) => {
      const value = geometry?.path || geometry?.d || geometry?.pathData
      if (isPathData(value)) {
        paths.push({ d: value, stroke: field !== 'fillGeometry' })
      }
    })
  })

  if (isPathData(node?.d)) {
    paths.push({ d: node.d, stroke: true })
  }

  if (isPathData(node?.path)) {
    paths.push({ d: node.path, stroke: true })
  }

  return paths
}

const walkFigmaNode = (node, parentFrame, icons) => {
  if (!node || typeof node !== 'object') return

  const nodeName = node.name || parentFrame || 'figma-icon'
  const nodeType = String(node.type || '').toUpperCase()
  const nextFrame = ['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP'].includes(nodeType)
    ? nodeName
    : parentFrame
  const paths = collectGeometryPaths(node)

  if (paths.length) {
    icons.push(iconFromPaths({
      name: nodeName,
      frame: nextFrame ? `Figma / ${nextFrame}` : 'Figma / Imported',
      paths
    }))
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => walkFigmaNode(child, nextFrame, icons))
  }

  if (node.nodes && typeof node.nodes === 'object') {
    Object.values(node.nodes).forEach((child) => walkFigmaNode(child?.document || child, nextFrame, icons))
  }
}

export const parseFigmaJsonIcons = (content, fileName = 'imported.json') => {
  const data = JSON.parse(content)
  const root = data.document || data
  const icons = []
  walkFigmaNode(root, fileName.replace(/\.(fig|json)$/i, ''), icons)
  return icons
}

export const parseIconImportFile = async (file) => {
  const content = await file.text()
  const trimmed = content.trim()
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name) || trimmed.startsWith('<svg')

  if (isSvg) {
    return parseSvgIcons(content, file.name)
  }

  if (/\.fig$/i.test(file.name) && !/^[{[]/.test(trimmed)) {
    throw new Error('当前 .fig 文件不是可解析的 JSON 文本。请从 Figma 导出 SVG，或使用 Figma API 返回的 JSON 文件导入。')
  }

  if (/^[{[]/.test(trimmed) || /\.json$/i.test(file.name) || /\.fig$/i.test(file.name)) {
    return parseFigmaJsonIcons(content, file.name)
  }

  throw new Error('未识别的文件格式，请导入 SVG 或 Figma JSON。')
}
