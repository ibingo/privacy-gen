import { readMobileAppGroups } from './mobileApps'
import { defaultI18nSettings, normalizeI18nSettings } from './i18nSettings'

const STORAGE_KEY = 'privacy-gen:i18n-projects'

const defaultProjects = [
  {
    id: 'i18n-project-privacy-gen',
    name: 'Privacy Gen',
    mobileAppId: 'multi-privacy-gen',
    mobileAppName: 'Privacy Gen',
    packageName: 'com.privacygen.app',
    platforms: ['iOS', 'Android'],
    description: '移动端隐私政策与用户协议管理工具的多语言文案库。',
    sourceLocale: 'zh-CN',
    targetLocales: ['de', 'en', 'hu'],
    wordCount: 3842,
    pendingCount: 27,
    coverage: '97%',
    status: '已绑定',
    statusTone: 'success',
    icon: 'PG',
    iconColor: '#0052d9',
    lastUpdated: '2026-05-20'
  },
  {
    id: 'i18n-project-i18n-manager',
    name: 'i18n Manager',
    mobileAppId: 'multi-i18n-manager',
    mobileAppName: 'i18n Manager',
    packageName: 'com.i18n.manager',
    platforms: ['iOS', 'Android'],
    description: '国际化资源管理应用的文案、翻译和导出资源库。',
    sourceLocale: 'zh-CN',
    targetLocales: ['de', 'en', 'hu'],
    wordCount: 1268,
    pendingCount: 18,
    coverage: '94%',
    status: '已绑定',
    statusTone: 'success',
    icon: 'iM',
    iconColor: '#e37318',
    lastUpdated: '2026-05-19'
  }
]

export function readI18nProjects () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const projects = raw ? JSON.parse(raw) : defaultProjects
    return projects.map(normalizeI18nProject)
  } catch {
    return defaultProjects.map(normalizeI18nProject)
  }
}

export function writeI18nProjects (projects) {
  const normalizedProjects = projects.map(normalizeI18nProject)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProjects))
  return normalizedProjects
}

export function createI18nProject (data) {
  const projects = readI18nProjects()
  const project = normalizeI18nProject({
    id: `i18n-project-${Date.now()}`,
    wordCount: 0,
    pendingCount: 0,
    coverage: '0%',
    lastUpdated: new Date().toISOString().slice(0, 10),
    ...data
  })
  writeI18nProjects([project, ...projects])
  return project
}

export function updateI18nProject (id, data) {
  let updatedProject = null
  const projects = readI18nProjects().map((project) => {
    if (project.id !== id) return project
    updatedProject = normalizeI18nProject({
      ...project,
      ...data,
      lastUpdated: new Date().toISOString().slice(0, 10)
    })
    return updatedProject
  })
  writeI18nProjects(projects)
  return updatedProject
}

export function getI18nProject (id) {
  return readI18nProjects().find((project) => project.id === id) || null
}

export function buildI18nProjectFromMobileApp (app) {
  const settings = normalizeI18nSettings(defaultI18nSettings)
  return {
    name: app.name || '未命名应用',
    mobileAppId: app.id,
    mobileAppName: app.name || '',
    packageName: app.apps?.[0]?.packageName || app.packageName || '',
    platforms: app.platforms?.length ? app.platforms : [app.platform].filter(Boolean),
    description: app.description || '从移动应用创建的国际化文案项目。',
    sourceLocale: settings.sourceLocale,
    targetLocales: [...settings.targetLocales],
    status: '已绑定',
    statusTone: 'success',
    icon: app.icon || String(app.name || 'APP').slice(0, 2).toUpperCase(),
    iconColor: app.iconColor || '#0052d9'
  }
}

export function getBindableMobileApps () {
  return readMobileAppGroups()
}

function normalizeI18nProject (project = {}) {
  const settings = normalizeI18nSettings(project)
  const mobileAppId = project.mobileAppId || ''
  const name = project.name || project.mobileAppName || '未命名文案项目'
  return {
    ...project,
    id: project.id || `i18n-project-${Date.now()}`,
    name,
    mobileAppId,
    mobileAppName: project.mobileAppName || '',
    packageName: project.packageName || '',
    platforms: Array.isArray(project.platforms) ? project.platforms : [],
    description: project.description || '维护应用文案 Key、源文案和多语言翻译。',
    sourceLocale: settings.sourceLocale,
    targetLocales: settings.targetLocales,
    wordCount: Number(project.wordCount || 0),
    pendingCount: Number(project.pendingCount || 0),
    coverage: project.coverage || '0%',
    status: project.status || (mobileAppId ? '已绑定' : '未绑定'),
    statusTone: project.statusTone || (mobileAppId ? 'success' : 'warning'),
    icon: project.icon || String(name).slice(0, 2).toUpperCase(),
    iconColor: project.iconColor || '#0052d9',
    lastUpdated: project.lastUpdated || new Date().toISOString().slice(0, 10)
  }
}
