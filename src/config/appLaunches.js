export const APP_LAUNCH_STORAGE_KEY = 'privacy-gen:app-launches'

export const launchVersionOptions = [
  { value: 'ios', label: 'iOS', detail: 'Launch Screen / Splash' },
  { value: 'android', label: 'Android', detail: 'drawable / mipmap' },
  { value: 'harmony', label: 'HarmonyOS', detail: 'entry resources' },
  { value: 'webapp', label: 'Web App', detail: 'PWA splash' }
]

export const launchDeviceOptions = [
  {
    value: 'iphone-14',
    label: 'iPhone 14',
    size: '1170 x 2532',
    width: 390,
    height: 844,
    thumbnail: 'linear-gradient(145deg, #dbeafe, #f8fafc 48%, #ef4444)'
  },
  {
    value: 'iphone-13-pro-max',
    label: 'iPhone 13 Pro Max',
    size: '1284 x 2778',
    width: 428,
    height: 926,
    thumbnail: 'linear-gradient(145deg, #f8fafc, #facc15 48%, #0f172a)'
  },
  {
    value: 'iphone-11-pro-max',
    label: 'iPhone 11 Pro Max',
    size: '1242 x 2688',
    width: 414,
    height: 896,
    thumbnail: 'linear-gradient(145deg, #0f172a, #334155 52%, #22c55e)'
  },
  {
    value: 'iphone-xr',
    label: 'iPhone XR',
    size: '828 x 1792',
    width: 414,
    height: 896,
    thumbnail: 'linear-gradient(145deg, #dc2626, #f97316 45%, #111827)'
  },
  {
    value: 'android-1080',
    label: 'Android 1080',
    size: '1080 x 2400',
    width: 360,
    height: 800,
    thumbnail: 'linear-gradient(145deg, #0f766e, #14b8a6 52%, #e0f2fe)'
  }
]

export const defaultAppLaunches = [
  {
    id: 'mall-launch',
    name: '商城启动页',
    resourceKey: 'mall_splash',
    versionSupport: ['ios', 'android'],
    status: '已生成',
    statusTone: 'success',
    updatedAt: '2026-05-08 11:20',
    checked: true,
    backgroundColor: '#ffffff',
    logoColor: '#f52f3e',
    logoScale: 48,
    logoX: 50,
    logoY: 49,
    device: 'iphone-14'
  },
  {
    id: 'member-launch',
    name: '会员中心启动页',
    resourceKey: 'member_splash',
    versionSupport: ['ios', 'android', 'webapp'],
    status: '草稿',
    statusTone: 'processing',
    updatedAt: '2026-05-07 18:42',
    checked: false,
    backgroundColor: '#f8fafc',
    logoColor: '#0052d9',
    logoScale: 42,
    logoX: 50,
    logoY: 52,
    device: 'iphone-13-pro-max'
  },
  {
    id: 'iot-launch',
    name: '智能家居启动页',
    resourceKey: 'iot_splash',
    versionSupport: ['android', 'harmony'],
    status: '待生成',
    statusTone: 'warning',
    updatedAt: '2026-05-06 14:16',
    checked: false,
    backgroundColor: '#ffffff',
    logoColor: '#00a870',
    logoScale: 44,
    logoX: 50,
    logoY: 48,
    device: 'android-1080'
  }
]

export const readAppLaunches = () => {
  if (typeof localStorage === 'undefined') return defaultAppLaunches

  try {
    const stored = JSON.parse(localStorage.getItem(APP_LAUNCH_STORAGE_KEY) || 'null')
    return Array.isArray(stored) && stored.length ? stored : defaultAppLaunches
  } catch {
    return defaultAppLaunches
  }
}

export const writeAppLaunches = (launches) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(APP_LAUNCH_STORAGE_KEY, JSON.stringify(launches))
}

export const findAppLaunch = (id) => {
  return readAppLaunches().find((launch) => launch.id === id) || null
}

export const createAppLaunch = ({ name, resourceKey, versionSupport }) => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const normalizedName = String(name || '').trim()
  const normalizedResourceKey = String(resourceKey || '').trim()
  const selectedVersions = Array.isArray(versionSupport) && versionSupport.length
    ? versionSupport
    : ['ios', 'android']
  const launch = {
    id: `app-launch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: normalizedName,
    resourceKey: normalizedResourceKey,
    versionSupport: selectedVersions,
    status: '草稿',
    statusTone: 'processing',
    updatedAt: now,
    checked: false,
    backgroundColor: '#ffffff',
    logoColor: '#f52f3e',
    logoScale: 48,
    logoX: 50,
    logoY: 49,
    device: 'iphone-14'
  }
  writeAppLaunches([launch, ...readAppLaunches()])
  return launch
}

export const updateAppLaunch = (id, patch) => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  let updatedLaunch = null
  const nextLaunches = readAppLaunches().map((launch) => {
    if (launch.id !== id) return launch
    updatedLaunch = {
      ...launch,
      ...patch,
      updatedAt: now
    }
    return updatedLaunch
  })
  writeAppLaunches(nextLaunches)
  return updatedLaunch
}

export const deleteAppLaunch = (id) => {
  const launches = readAppLaunches()
  const nextLaunches = launches.filter((launch) => launch.id !== id)
  writeAppLaunches(nextLaunches)
  return nextLaunches.length !== launches.length
}
