import { readMobileApps } from './mobileApps'

const STORAGE_KEY = 'privacy-gen:user-agreements'

const defaultAgreements = [
  {
    id: 'ua-001',
    appId: 'app-001',
    appName: 'Privacy Gen',
    companyName: '隐私科技有限公司',
    contactEmail: 'support@example.com',
    effectiveDate: '2026-05-08',
    version: 'V3.2.0',
    platform: 'iOS',
    packageName: 'com.privacygen.app',
    serviceScope: '账号注册、文档生成、模板管理、导出下载及项目协作服务。',
    status: '已存档',
    updatedAt: '2026-05-08 10:32',
    archivedAt: '2026-05-08 10:32',
    additionalInfo: '适用于 Privacy Gen iOS 正式版本。'
  },
  {
    id: 'ua-002',
    appId: 'app-002',
    appName: 'Privacy Gen',
    companyName: '隐私科技有限公司',
    contactEmail: 'support@example.com',
    effectiveDate: '2026-05-07',
    version: 'V2.4.0',
    platform: 'Android',
    packageName: 'com.privacygen.app',
    serviceScope: '账号注册、隐私文档生成、移动端预览、导出下载及消息通知服务。',
    status: '待存档',
    updatedAt: '2026-05-07 19:03',
    archivedAt: '',
    additionalInfo: 'Android 端待发布归档。'
  },
  {
    id: 'ua-003',
    appId: 'app-003',
    appName: 'i18n Manager',
    companyName: '隐私科技有限公司',
    contactEmail: 'support@example.com',
    effectiveDate: '2026-05-07',
    version: 'V1.8.3',
    platform: 'iOS',
    packageName: 'com.i18n.manager',
    serviceScope: '多语言文案管理、翻译任务、资源包导入导出和云端同步服务。',
    status: '待存档',
    updatedAt: '2026-05-07 14:51',
    archivedAt: '',
    additionalInfo: '随国际化资源管理客户端同步维护。'
  }
]

const nowText = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const normalizeAgreement = (agreement) => {
  const apps = readMobileApps()
  const app = apps.find((item) => item.id === agreement.appId)
  return {
    ...agreement,
    appName: agreement.appName || app?.name || '',
    platform: agreement.platform || app?.platform || '',
    packageName: agreement.packageName || app?.packageName || '',
    version: agreement.version || (app?.version ? `V${app.version}` : ''),
    status: ['待存档', '已存档'].includes(agreement.status) ? agreement.status : '待存档'
  }
}

export function readUserAgreements () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const agreements = raw ? JSON.parse(raw) : defaultAgreements
    return agreements.map(normalizeAgreement)
  } catch {
    return defaultAgreements.map(normalizeAgreement)
  }
}

export function writeUserAgreements (agreements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agreements.map(normalizeAgreement)))
}

export function findUserAgreement (id) {
  return readUserAgreements().find((agreement) => agreement.id === id) || null
}

export function saveUserAgreement (payload) {
  const agreements = readUserAgreements()
  const timestamp = nowText()
  const id = payload.id || `ua-${Date.now()}`
  const next = normalizeAgreement({
    ...payload,
    id,
    status: payload.status || '待存档',
    updatedAt: timestamp
  })
  const index = agreements.findIndex((agreement) => agreement.id === id)
  if (index >= 0) {
    agreements.splice(index, 1, next)
  } else {
    agreements.unshift(next)
  }
  writeUserAgreements(agreements)
  return next
}

export function archiveUserAgreement (id) {
  const agreements = readUserAgreements()
  const timestamp = nowText()
  const nextAgreements = agreements.map((agreement) => {
    if (agreement.id !== id) return agreement
    return {
      ...agreement,
      status: '已存档',
      archivedAt: timestamp,
      updatedAt: timestamp
    }
  })
  writeUserAgreements(nextAgreements)
  return nextAgreements.find((agreement) => agreement.id === id) || null
}

export function deleteUserAgreement (id) {
  writeUserAgreements(readUserAgreements().filter((agreement) => agreement.id !== id))
}
