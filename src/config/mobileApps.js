const STORAGE_KEY = 'privacy-gen:mobile-apps'
const VERSION_STORAGE_KEY = 'privacy-gen:mobile-app-versions'

const defaultApps = [
  {
    id: 'app-001',
    groupId: 'multi-privacy-gen',
    name: 'Privacy Gen',
    packageName: 'com.privacygen.app',
    platform: 'iOS',
    version: '2.4.1',
    buildNumber: '241',
    status: '已发布',
    statusTone: 'success',
    size: '45.2 MB',
    icon: 'PG',
    iconColor: '#0052d9',
    downloads: 12840,
    rating: 4.8,
    lastUpdated: '2026-05-18',
    createdAt: '2024-03-15',
    description: '移动端隐私政策与用户协议管理工具，支持多语言和多平台。',
    environments: ['Production', 'Staging'],
    team: '法务技术组',
    features: ['隐私政策生成', '用户协议管理', '多语言支持', '版本追踪']
  },
  {
    id: 'app-002',
    groupId: 'multi-privacy-gen',
    name: 'Privacy Gen',
    packageName: 'com.privacygen.app',
    platform: 'Android',
    version: '2.4.0',
    buildNumber: '240',
    status: '已发布',
    statusTone: 'success',
    size: '38.7 MB',
    icon: 'PG',
    iconColor: '#00a870',
    downloads: 8920,
    rating: 4.6,
    lastUpdated: '2026-05-15',
    createdAt: '2024-03-20',
    description: '移动端隐私政策与用户协议管理工具，支持多语言和多平台。',
    environments: ['Production', 'Staging', 'QA'],
    team: '法务技术组',
    features: ['隐私政策生成', '用户协议管理', '多语言支持', '版本追踪']
  },
  {
    id: 'app-003',
    groupId: 'multi-i18n-manager',
    name: 'i18n Manager',
    packageName: 'com.i18n.manager',
    platform: 'iOS',
    version: '1.8.3',
    buildNumber: '183',
    status: '审核中',
    statusTone: 'warning',
    size: '32.1 MB',
    icon: 'iM',
    iconColor: '#e37318',
    downloads: 5430,
    rating: 4.5,
    lastUpdated: '2026-05-20',
    createdAt: '2024-08-10',
    description: '国际化资源管理移动端应用，实时预览多语言文案效果。',
    environments: ['Staging'],
    team: '国际化团队',
    features: ['文案预览', '翻译协作', '导入导出', '覆盖率统计']
  },
  {
    id: 'app-004',
    groupId: 'multi-i18n-manager',
    name: 'i18n Manager',
    packageName: 'com.i18n.manager',
    platform: 'Android',
    version: '1.8.2',
    buildNumber: '182',
    status: '已发布',
    statusTone: 'success',
    size: '28.5 MB',
    icon: 'iM',
    iconColor: '#0052d9',
    downloads: 4210,
    rating: 4.4,
    lastUpdated: '2026-05-12',
    createdAt: '2024-08-15',
    description: '国际化资源管理移动端应用，实时预览多语言文案效果。',
    environments: ['Production', 'Staging'],
    team: '国际化团队',
    features: ['文案预览', '翻译协作', '导入导出', '覆盖率统计']
  },
  {
    id: 'app-005',
    name: 'Icon Studio',
    packageName: 'com.iconstudio.pro',
    platform: 'iOS',
    version: '3.1.0',
    buildNumber: '310',
    status: '开发中',
    statusTone: 'processing',
    size: '52.8 MB',
    icon: 'IS',
    iconColor: '#8b5cf6',
    downloads: 0,
    rating: 0,
    lastUpdated: '2026-05-21',
    createdAt: '2025-01-20',
    description: '移动端图标设计与资源管理工具，支持 Figma 同步和矢量导出。',
    environments: ['Development'],
    team: '设计工程组',
    features: ['图标编辑', 'Figma 同步', '矢量导出', '批量生成']
  },
  {
    id: 'app-006',
    name: 'Compliance Hub',
    packageName: 'compliance.hub.app',
    platform: 'Web App',
    version: '5.2.0',
    buildNumber: '520',
    status: '已发布',
    statusTone: 'success',
    size: 'PWA',
    icon: 'CH',
    iconColor: '#059669',
    downloads: 23100,
    rating: 4.9,
    lastUpdated: '2026-05-19',
    createdAt: '2023-11-05',
    description: '企业合规管理 Web 应用，统一管理法务文档、审计记录和合规流程。',
    environments: ['Production', 'Staging', 'QA'],
    team: '企业合规组',
    features: ['文档管理', '审计追踪', '合规检查', '报表导出']
  }
]

export const platformOptions = [
  { value: 'iOS', label: 'iOS' },
  { value: 'Android', label: 'Android' },
  { value: 'Web App', label: 'Web App' },
  { value: 'HarmonyOS', label: 'HarmonyOS' }
]

export const statusOptions = [
  { value: '开发中', label: '开发中', tone: 'processing' },
  { value: '测试中', label: '测试中', tone: 'warning' },
  { value: '审核中', label: '审核中', tone: 'warning' },
  { value: '已发布', label: '已发布', tone: 'success' },
  { value: '已下架', label: '已下架', tone: 'default' }
]

export function readMobileApps () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : [...defaultApps]
  } catch {
    return [...defaultApps]
  }
}

export function readMobileAppGroups () {
  const apps = readMobileApps()
  const grouped = apps.reduce((acc, app) => {
    const key = app.groupId || app.id
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: app.name,
        description: app.description,
        icon: app.icon,
        iconColor: app.iconColor,
        status: app.status,
        statusTone: app.statusTone,
        version: app.version,
        packageName: app.packageName,
        lastUpdated: app.lastUpdated,
        downloads: 0,
        ratingTotal: 0,
        ratingCount: 0,
        platforms: [],
        apps: []
      }
    }
    acc[key].apps.push(app)
    acc[key].platforms.push(app.platform)
    acc[key].downloads += app.downloads || 0
    if (app.rating) {
      acc[key].ratingTotal += app.rating
      acc[key].ratingCount += 1
    }
    if (String(app.lastUpdated || '') > String(acc[key].lastUpdated || '')) {
      acc[key].lastUpdated = app.lastUpdated
      acc[key].status = app.status
      acc[key].statusTone = app.statusTone
      acc[key].version = app.version
    }
    return acc
  }, {})

  return Object.values(grouped).map((group) => ({
    ...group,
    type: group.apps.length > 1 ? 'multi' : 'single',
    platform: group.apps.length > 1 ? '多端 App' : group.apps[0]?.platform,
    size: group.apps.length > 1 ? `${group.apps.length} 端` : group.apps[0]?.size,
    rating: group.ratingCount ? Number((group.ratingTotal / group.ratingCount).toFixed(1)) : 0,
    packageName: group.apps.length > 1 ? `${group.name} · ${group.platforms.join(' / ')}` : group.packageName
  }))
}

export function writeMobileApps (apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
}

function buildDefaultVersions () {
  return defaultApps.reduce((acc, app) => {
    const build = Number(app.buildNumber) || 100
    acc[app.id] = [
      {
        id: `${app.id}-version-${app.buildNumber}`,
        version: app.version,
        buildNumber: app.buildNumber,
        size: app.size,
        status: app.status,
        statusTone: app.statusTone,
        downloads: app.downloads,
        channel: app.environments?.includes('Production') ? '正式版' : '测试版',
        packageType: app.platform === 'iOS' ? 'Adhoc' : app.platform === 'Android' ? 'APK' : 'PWA',
        updatedAt: `${app.lastUpdated} 12:08`,
        publisher: app.team,
        releaseNotes: app.features?.length ? `更新 ${app.features.slice(0, 2).join('、')} 等能力。` : '优化应用稳定性与基础体验。'
      },
      {
        id: `${app.id}-version-${Math.max(build - 1, 1)}`,
        version: decrementPatchVersion(app.version),
        buildNumber: String(Math.max(build - 1, 1)),
        size: app.size,
        status: '历史版本',
        statusTone: 'default',
        downloads: Math.max(Math.floor(app.downloads * 0.42), 0),
        channel: '历史归档',
        packageType: app.platform === 'iOS' ? 'Adhoc' : app.platform === 'Android' ? 'APK' : 'PWA',
        updatedAt: app.createdAt,
        publisher: app.team,
        releaseNotes: '归档版本，用于回滚和下载记录追踪。'
      }
    ]
    return acc
  }, {})
}

function decrementPatchVersion (version) {
  const parts = String(version || '1.0.0').split('.').map((item) => Number(item))
  if (parts.length < 3 || parts.some(Number.isNaN)) return version || '1.0.0'
  parts[2] = Math.max(parts[2] - 1, 0)
  return parts.join('.')
}

export function readMobileAppVersions (appId) {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY)
    const versions = raw ? JSON.parse(raw) : buildDefaultVersions()
    return versions[appId] || []
  } catch {
    return buildDefaultVersions()[appId] || []
  }
}

export function writeMobileAppVersions (appId, versions) {
  let allVersions = {}
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY)
    allVersions = raw ? JSON.parse(raw) : buildDefaultVersions()
  } catch {
    allVersions = buildDefaultVersions()
  }
  allVersions[appId] = versions
  localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(allVersions))
}

export function createMobileAppVersion (appId, data) {
  const versions = readMobileAppVersions(appId)
  const version = {
    id: `${appId}-version-${Date.now()}`,
    downloads: 0,
    status: '测试中',
    statusTone: 'warning',
    channel: '测试版',
    updatedAt: new Date().toISOString().slice(0, 10),
    ...data
  }
  writeMobileAppVersions(appId, [version, ...versions])
  return version
}

export function updateMobileAppVersion (appId, versionId, data) {
  const versions = readMobileAppVersions(appId)
  let updatedVersion = null
  const nextVersions = versions.map((version) => {
    if (version.id !== versionId) return version
    updatedVersion = {
      ...version,
      ...data,
      updatedAt: new Date().toISOString().slice(0, 10)
    }
    return updatedVersion
  })
  writeMobileAppVersions(appId, nextVersions)
  return updatedVersion
}

export function createMobileApp (data) {
  const apps = readMobileApps()
  const app = {
    id: `app-${Date.now()}`,
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString().slice(0, 10),
    environments: ['Development'],
    features: [],
    ...data
  }
  apps.unshift(app)
  writeMobileApps(apps)
  return app
}

export function createMultiPlatformMobileApp (data) {
  const platforms = data.platforms?.length ? data.platforms : [data.platform || 'iOS']
  const groupId = `multi-${Date.now()}`
  const iconColors = ['#0052d9', '#00a870', '#e37318', '#8b5cf6', '#059669']
  const apps = readMobileApps()
  const { platforms: ignoredPlatforms, isMultiPlatform, ...appData } = data
  const created = platforms.map((platform, index) => ({
    id: `app-${Date.now()}-${index}`,
    groupId,
    downloads: 0,
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 10),
    lastUpdated: new Date().toISOString().slice(0, 10),
    environments: ['Development'],
    features: [],
    ...appData,
    platform,
    packageName: `${data.packageName || 'com.example.app'}.${platform.toLowerCase().replace(/\s+/g, '-')}`,
    icon: data.icon || data.name.slice(0, 2).toUpperCase(),
    iconColor: iconColors[index % iconColors.length]
  }))
  writeMobileApps([...created, ...apps])
  return { id: groupId, apps: created }
}

export function updateMobileApp (id, data) {
  const apps = readMobileApps()
  const index = apps.findIndex((a) => a.id === id)
  if (index === -1) return null
  apps[index] = { ...apps[index], ...data, lastUpdated: new Date().toISOString().slice(0, 10) }
  writeMobileApps(apps)
  return apps[index]
}

export function deleteMobileApp (id) {
  const apps = readMobileApps().filter((a) => a.id !== id)
  writeMobileApps(apps)
}

export function findMobileApp (id) {
  return readMobileApps().find((a) => a.id === id) || null
}

export function findMobileAppGroup (id) {
  return readMobileAppGroups().find((group) => group.id === id) || null
}

export function getMobileAppStats () {
  const apps = readMobileApps()
  const totalApps = apps.length
  const published = apps.filter((a) => a.status === '已发布').length
  const inReview = apps.filter((a) => a.status === '审核中').length
  const inDevelopment = apps.filter((a) => a.status === '开发中').length
  const totalDownloads = apps.reduce((sum, a) => sum + a.downloads, 0)
  const avgRating = apps.filter((a) => a.rating > 0).reduce((sum, a, _, arr) => sum + a.rating / arr.length, 0)
  const platforms = [...new Set(apps.map((a) => a.platform))]

  return { totalApps, published, inReview, inDevelopment, totalDownloads, avgRating, platforms }
}
