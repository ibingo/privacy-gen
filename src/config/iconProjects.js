export const ICON_PROJECT_STORAGE_KEY = 'privacy-gen:active-icon-project'
export const ICON_PROJECT_LIST_STORAGE_KEY = 'privacy-gen:icon-projects'

export const defaultIconProjects = [
  {
    id: 'mall-prod',
    name: '小米商城 App 图标库',
    status: '已完成',
    statusTone: 'success',
    version: 'V5.0.2',
    environment: '生产',
    updatedAt: '2026-05-08 10:32',
    checked: true
  },
  {
    id: 'member-staging',
    name: '会员中心图标库',
    status: '待发布',
    statusTone: 'warning',
    version: 'V2.3.1',
    environment: '预发',
    updatedAt: '2026-05-07 19:03',
    checked: true
  },
  {
    id: 'iot-test',
    name: '智能家居图标库',
    status: '审核中',
    statusTone: 'processing',
    version: 'V3.1.8',
    environment: '测试',
    updatedAt: '2026-05-07 14:51',
    checked: false
  },
  {
    id: 'after-sales-dev',
    name: '售后服务图标库',
    status: '已完成',
    statusTone: 'success',
    version: 'V1.7.4',
    environment: '开发',
    updatedAt: '2026-05-06 21:15',
    checked: false
  },
  {
    id: 'global-prod',
    name: '国际站图标库',
    status: '审核失败',
    statusTone: 'danger',
    version: 'V2.4.0',
    environment: '生产',
    updatedAt: '2026-05-06 12:28',
    checked: false
  },
  {
    id: 'cloud-staging',
    name: '设备云图标库',
    status: '待发布',
    statusTone: 'warning',
    version: 'V1.2.9',
    environment: '预发',
    updatedAt: '2026-05-05 17:40',
    checked: false
  },
  {
    id: 'retail-prod',
    name: '门店会员图标库',
    status: '已完成',
    statusTone: 'success',
    version: 'V4.1.6',
    environment: '生产',
    updatedAt: '2026-05-05 08:56',
    checked: false
  }
]

export const readIconProjects = () => {
  if (typeof localStorage === 'undefined') return defaultIconProjects

  try {
    const stored = JSON.parse(localStorage.getItem(ICON_PROJECT_LIST_STORAGE_KEY) || 'null')
    return Array.isArray(stored) && stored.length ? stored : defaultIconProjects
  } catch {
    return defaultIconProjects
  }
}

export const writeIconProjects = (projects) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ICON_PROJECT_LIST_STORAGE_KEY, JSON.stringify(projects))
}

export const createIconProject = ({ name, environment, version }) => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const normalizedName = String(name || '').trim()
  const normalizedEnvironment = String(environment || '').trim()
  const normalizedVersion = String(version || '').trim() || 'V1.0.0'
  const project = {
    id: `icon-project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: normalizedName,
    status: '草稿',
    statusTone: 'processing',
    version: normalizedVersion,
    environment: normalizedEnvironment,
    updatedAt: now,
    checked: false
  }
  const projects = [project, ...readIconProjects()]
  writeIconProjects(projects)
  return project
}

export const iconProjects = defaultIconProjects

export const defaultIconProjectId = defaultIconProjects[0]?.id || 'default'

export const getActiveIconProjectId = () => {
  if (typeof localStorage === 'undefined') return defaultIconProjectId
  return localStorage.getItem(ICON_PROJECT_STORAGE_KEY) || defaultIconProjectId
}

export const setActiveIconProjectId = (projectId) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ICON_PROJECT_STORAGE_KEY, projectId || defaultIconProjectId)
}

export const findIconProject = (projectId) => {
  const projects = readIconProjects()
  return projects.find((project) => project.id === projectId) || projects[0]
}
