export const APP_ICON_STORAGE_KEY = 'privacy-gen:app-icons'

export const appIconPlatformOptions = [
  { value: 'ios', label: 'iOS', folder: 'AppIcon.appiconset' },
  { value: 'android', label: 'Android', folder: 'res/mipmap-*' },
  { value: 'webapp', label: 'Web App', folder: 'webapp' },
  { value: 'cordova', label: 'Cordova', folder: 'phonegap' },
  { value: 'macos', label: 'macOS', folder: 'AppIcon.appiconset' },
  { value: 'watchos', label: 'watchOS', folder: 'AppIcon.appiconset' },
  { value: 'quasar', label: 'Quasar', folder: 'quasar' }
]

export const gradientDirectionOptions = [
  { value: '135deg', label: '左上到右下' },
  { value: '90deg', label: '左到右' },
  { value: '180deg', label: '上到下' },
  { value: '45deg', label: '左下到右上' }
]

export const gradientModeOptions = [
  { value: 'linear', label: '线性' },
  { value: 'radial', label: '径向' }
]

export const buildGradient = ({ start, end, direction = '135deg', mode = 'linear' }) => {
  const startColor = start || '#0052d9'
  const endColor = end || '#35c2ff'
  if (mode === 'radial') {
    return `radial-gradient(circle at center, ${startColor}, ${endColor})`
  }
  return `linear-gradient(${direction || '135deg'}, ${startColor}, ${endColor})`
}

export const defaultAppIcons = [
  {
    id: 'mall-app-icon',
    name: '小米商城 App 图标',
    appName: '小米商城',
    bundleId: 'com.mi.shop',
    sourceSize: '1024 x 1024',
    version: 'V5.0.2',
    platforms: ['ios', 'android', 'webapp'],
    status: '已生成',
    statusTone: 'success',
    updatedAt: '2026-05-08 10:32',
    checked: true,
    sourceFileName: 'mall-app-icon.png',
    sourceType: 'text',
    iconText: '商',
    gradientStart: '#ff6a00',
    gradientEnd: '#ffd166',
    gradientDirection: '135deg',
    gradientMode: 'linear',
    colors: ['#ff6a00', '#ffd166']
  },
  {
    id: 'member-app-icon',
    name: '会员中心 App 图标',
    appName: '会员中心',
    bundleId: 'com.mi.member',
    sourceSize: '1024 x 1024',
    version: 'V2.3.1',
    platforms: ['ios', 'android', 'cordova'],
    status: '待生成',
    statusTone: 'warning',
    updatedAt: '2026-05-07 19:03',
    checked: true,
    sourceFileName: 'member-icon-1024.png',
    sourceType: 'text',
    iconText: '会',
    gradientStart: '#0052d9',
    gradientEnd: '#35c2ff',
    gradientDirection: '135deg',
    gradientMode: 'linear',
    colors: ['#0052d9', '#35c2ff']
  },
  {
    id: 'iot-app-icon',
    name: '智能家居 App 图标',
    appName: '智能家居',
    bundleId: 'com.mi.home',
    sourceSize: '1024 x 1024',
    version: 'V3.1.8',
    platforms: ['ios', 'android', 'webapp', 'quasar'],
    status: '审核中',
    statusTone: 'processing',
    updatedAt: '2026-05-07 14:51',
    checked: false,
    sourceFileName: 'home-icon.png',
    sourceType: 'text',
    iconText: '家',
    gradientStart: '#00a870',
    gradientEnd: '#78e08f',
    gradientDirection: '135deg',
    gradientMode: 'linear',
    colors: ['#00a870', '#78e08f']
  },
  {
    id: 'global-app-icon',
    name: '国际站 App 图标',
    appName: '国际站',
    bundleId: 'com.mi.global',
    sourceSize: '1024 x 1024',
    version: 'V2.4.0',
    platforms: ['ios', 'android', 'macos'],
    status: '审核失败',
    statusTone: 'danger',
    updatedAt: '2026-05-06 12:28',
    checked: false,
    sourceFileName: 'global-icon.png',
    sourceType: 'text',
    iconText: 'G',
    gradientStart: '#7c3aed',
    gradientEnd: '#f472b6',
    gradientDirection: '135deg',
    gradientMode: 'linear',
    colors: ['#7c3aed', '#f472b6']
  }
]

export const readAppIcons = () => {
  if (typeof localStorage === 'undefined') return defaultAppIcons

  try {
    const stored = JSON.parse(localStorage.getItem(APP_ICON_STORAGE_KEY) || 'null')
    return Array.isArray(stored) && stored.length ? stored : defaultAppIcons
  } catch {
    return defaultAppIcons
  }
}

export const writeAppIcons = (icons) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(APP_ICON_STORAGE_KEY, JSON.stringify(icons))
}

export const findAppIcon = (id) => {
  return readAppIcons().find((icon) => icon.id === id) || null
}

export const updateAppIcon = (id, patch) => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const icons = readAppIcons()
  let updatedIcon = null
  const nextIcons = icons.map((icon) => {
    if (icon.id !== id) return icon
    updatedIcon = {
      ...icon,
      ...patch,
      updatedAt: now
    }
    return updatedIcon
  })
  writeAppIcons(nextIcons)
  return updatedIcon
}

export const createAppIcon = ({
  appName,
  bundleId,
  version,
  platforms,
  sourceSize,
  sourceFileName,
  sourcePreview,
  sourceType,
  iconText,
  gradientStart,
  gradientEnd,
  gradientDirection,
  gradientMode
}) => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const normalizedAppName = String(appName || '').trim()
  const normalizedBundleId = String(bundleId || '').trim()
  const normalizedVersion = String(version || '').trim() || 'V1.0.0'
  const selectedPlatforms = Array.isArray(platforms) && platforms.length ? platforms : ['ios', 'android']
  const normalizedSourceFileName = String(sourceFileName || '').trim()
  const normalizedSourceType = sourceType === 'image' ? 'image' : 'text'
  const normalizedIconText = String(iconText || '').trim().slice(0, 4) || 'A'
  const hue = Math.floor(Math.random() * 360)
  const startColor = gradientStart || `hsl(${hue} 78% 46%)`
  const endColor = gradientEnd || `hsl(${(hue + 46) % 360} 86% 62%)`
  const normalizedGradientDirection = gradientDirection || '135deg'
  const normalizedGradientMode = gradientMode === 'radial' ? 'radial' : 'linear'
  const icon = {
    id: `app-icon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${normalizedAppName} App 图标`,
    appName: normalizedAppName,
    bundleId: normalizedBundleId,
    sourceSize: String(sourceSize || '').trim() || '1024 x 1024',
    version: normalizedVersion,
    platforms: selectedPlatforms,
    status: '草稿',
    statusTone: 'processing',
    updatedAt: now,
    checked: false,
    sourceFileName: normalizedSourceFileName,
    sourcePreview: sourcePreview || '',
    sourceType: normalizedSourceType,
    iconText: normalizedIconText,
    gradientStart: startColor,
    gradientEnd: endColor,
    gradientDirection: normalizedGradientDirection,
    gradientMode: normalizedGradientMode,
    colors: [startColor, endColor]
  }
  writeAppIcons([icon, ...readAppIcons()])
  return icon
}

export const deleteAppIcon = (id) => {
  const icons = readAppIcons()
  const nextIcons = icons.filter((icon) => icon.id !== id)
  writeAppIcons(nextIcons)
  return nextIcons.length !== icons.length
}
