const STORAGE_KEY = 'privacy-gen:mobile-beta-invite-templates'
export const DEFAULT_BETA_INVITE_TEMPLATE_ID = 'default-beta-invite-template'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const defaultTemplateStyle = {
  pageBackground: '#f5f7fb',
  cardBackground: '#ffffff',
  primaryColor: '#0052d9',
  textColor: '#111827',
  secondaryTextColor: '#6b7280',
  buttonTextColor: '#ffffff',
  cardRadius: 16,
  buttonRadius: 8,
  iconRadius: 18,
  passwordCardWidth: 84
}

export const defaultTemplateLayers = [
  {
    id: 'logo',
    type: 'logo',
    label: '应用图标',
    description: '展示邀请应用的图标',
    x: 50,
    y: 14,
    size: 76,
    visible: true,
    locked: false
  },
  {
    id: 'title',
    type: 'text',
    label: '邀请标题',
    description: '展示邀请名称',
    binding: 'title',
    fallback: '内测邀请',
    x: 50,
    y: 31,
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    visible: true,
    locked: false
  },
  {
    id: 'subtitle',
    type: 'text',
    label: '应用信息',
    description: '展示应用、平台和版本',
    binding: 'subtitle',
    fallback: 'Privacy Gen · iOS · 不限制',
    x: 50,
    y: 40,
    fontSize: 14,
    fontWeight: 400,
    color: '#6b7280',
    visible: true,
    locked: false
  },
  {
    id: 'meta',
    type: 'meta',
    label: '邀请信息',
    description: '展示方式、名额和有效期',
    x: 50,
    y: 55,
    width: 84,
    visible: true,
    locked: false
  },
  {
    id: 'remark',
    type: 'text',
    label: '内测说明',
    description: '展示邀请备注',
    binding: 'remark',
    fallback: '加入后可按当前邀请范围体验指定内测版本。',
    x: 50,
    y: 72,
    fontSize: 14,
    fontWeight: 400,
    color: '#6b7280',
    visible: true,
    locked: false
  },
  {
    id: 'button',
    type: 'button',
    label: '加入按钮',
    description: '展示加入内测按钮',
    binding: 'buttonText',
    fallback: '加入内测',
    x: 50,
    y: 86,
    width: 84,
    height: 44,
    visible: true,
    locked: false
  }
]

const defaultTemplates = [
  {
    id: DEFAULT_BETA_INVITE_TEMPLATE_ID,
    name: '默认邀请模版',
    code: 'DEFAULT_INVITE',
    status: 'enabled',
    isDefault: true,
    platform: '移动端 / PC',
    owner: '移动端测试组',
    updatedAt: '2026-05-26 10:00',
    description: '保存现有内测邀请页面的默认样式，支持移动端和 PC 邀请页面复用。',
    style: clone(defaultTemplateStyle),
    layers: clone(defaultTemplateLayers)
  }
]

function normalizeTemplate (template) {
  return {
    ...template,
    style: {
      ...clone(defaultTemplateStyle),
      ...(template.style || {})
    },
    layers: Array.isArray(template.layers) && template.layers.length
      ? template.layers.map((layer, index) => ({
        visible: true,
        locked: false,
        zIndex: template.layers.length - index,
        ...layer
      }))
      : clone(defaultTemplateLayers)
  }
}

export function readBetaInviteTemplates () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const templates = raw ? JSON.parse(raw) : defaultTemplates
    const normalized = templates.map(normalizeTemplate)
    if (!normalized.some((item) => item.id === DEFAULT_BETA_INVITE_TEMPLATE_ID)) {
      return [...defaultTemplates.map(normalizeTemplate), ...normalized]
    }
    return normalized
  } catch {
    return defaultTemplates.map(normalizeTemplate)
  }
}

export function writeBetaInviteTemplates (templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.map(normalizeTemplate)))
}

export function findBetaInviteTemplate (id) {
  return readBetaInviteTemplates().find((template) => template.id === id) || findDefaultBetaInviteTemplate()
}

export function findDefaultBetaInviteTemplate () {
  return readBetaInviteTemplates().find((template) => template.isDefault) || readBetaInviteTemplates()[0]
}

export function createBetaInviteTemplate (data) {
  const templates = readBetaInviteTemplates()
  const template = normalizeTemplate({
    ...data,
    id: `beta-invite-template-${Date.now()}`,
    status: data.status || 'enabled',
    isDefault: false,
    updatedAt: formatNow()
  })
  writeBetaInviteTemplates([template, ...templates])
  return template
}

export function copyBetaInviteTemplate (id) {
  const source = findBetaInviteTemplate(id)
  const { id: _id, isDefault: _isDefault, updatedAt: _updatedAt, ...copyable } = source
  const name = source?.isDefault ? '默认邀请模版副本' : `${source.name}副本`
  return createBetaInviteTemplate({
    ...copyable,
    name,
    code: `${source.code || 'INVITE_TEMPLATE'}_COPY_${Date.now().toString(36).toUpperCase()}`,
    status: 'enabled',
    style: clone(source.style || defaultTemplateStyle),
    layers: clone(source.layers || defaultTemplateLayers)
  })
}

export function updateBetaInviteTemplate (id, data) {
  let updated = null
  const templates = readBetaInviteTemplates().map((template) => {
    if (template.id !== id) return template
    if (template.id === DEFAULT_BETA_INVITE_TEMPLATE_ID || template.isDefault) return template
    updated = normalizeTemplate({
      ...template,
      ...data,
      updatedAt: formatNow()
    })
    return updated
  })
  writeBetaInviteTemplates(templates)
  return updated
}

export function deleteBetaInviteTemplate (id) {
  writeBetaInviteTemplates(readBetaInviteTemplates().filter((template) => template.id !== id || template.id === DEFAULT_BETA_INVITE_TEMPLATE_ID || template.isDefault))
}

export function setDefaultBetaInviteTemplate (id) {
  writeBetaInviteTemplates(readBetaInviteTemplates().map((template) => ({
    ...template,
    isDefault: template.id === id
  })))
}

function formatNow () {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
