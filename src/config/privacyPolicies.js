import { readMobileApps } from './mobileApps'

const STORAGE_KEY = 'privacy-gen:privacy-policies'

const defaultPolicies = [
  {
    id: 'pp-001',
    appId: 'app-001',
    appName: 'Privacy Gen',
    companyName: '隐私科技有限公司',
    contactEmail: 'privacy@example.com',
    effectiveDate: '2026-05-08',
    version: 'V3.2.0',
    platform: 'iOS',
    packageName: 'com.privacygen.app',
    status: '已存档',
    updatedAt: '2026-05-08 09:20',
    archivedAt: '2026-05-08 09:20',
    sdkList: [
      {
        name: '阿里云推送',
        company: '阿里云计算有限公司',
        purpose: '用于向用户发送服务通知和安全提醒。',
        dataTypes: '设备信息、推送标识符',
        processing: '加密传输',
        privacyUrl: 'https://www.aliyun.com/privacy'
      }
    ],
    additionalInfo: '适用于 Privacy Gen iOS 正式版本。'
  },
  {
    id: 'pp-002',
    appId: 'app-002',
    appName: 'Privacy Gen',
    companyName: '隐私科技有限公司',
    contactEmail: 'privacy@example.com',
    effectiveDate: '2026-05-07',
    version: 'V2.4.0',
    platform: 'Android',
    packageName: 'com.privacygen.app',
    status: '待存档',
    updatedAt: '2026-05-07 18:10',
    archivedAt: '',
    sdkList: [],
    additionalInfo: 'Android 端待发布归档。'
  },
  {
    id: 'pp-003',
    appId: 'app-003',
    appName: 'i18n Manager',
    companyName: '隐私科技有限公司',
    contactEmail: 'privacy@example.com',
    effectiveDate: '2026-05-07',
    version: 'V1.8.3',
    platform: 'iOS',
    packageName: 'com.i18n.manager',
    status: '待存档',
    updatedAt: '2026-05-07 15:44',
    archivedAt: '',
    sdkList: [],
    additionalInfo: '随国际化资源管理客户端同步维护。'
  }
]

const nowText = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const normalizePolicy = (policy) => {
  const apps = readMobileApps()
  const app = apps.find((item) => item.id === policy.appId)
  return {
    ...policy,
    appName: policy.appName || app?.name || '',
    platform: policy.platform || app?.platform || '',
    packageName: policy.packageName || app?.packageName || '',
    version: policy.version || (app?.version ? `V${app.version}` : ''),
    status: ['待存档', '已存档'].includes(policy.status) ? policy.status : '待存档',
    sdkList: Array.isArray(policy.sdkList) ? policy.sdkList : []
  }
}

export function readPrivacyPolicies () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const policies = raw ? JSON.parse(raw) : defaultPolicies
    return policies.map(normalizePolicy)
  } catch {
    return defaultPolicies.map(normalizePolicy)
  }
}

export function writePrivacyPolicies (policies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies.map(normalizePolicy)))
}

export function findPrivacyPolicy (id) {
  return readPrivacyPolicies().find((policy) => policy.id === id) || null
}

export function savePrivacyPolicy (payload) {
  const policies = readPrivacyPolicies()
  const timestamp = nowText()
  const id = payload.id || `pp-${Date.now()}`
  const next = normalizePolicy({
    ...payload,
    id,
    status: payload.status || '待存档',
    updatedAt: timestamp
  })
  const index = policies.findIndex((policy) => policy.id === id)
  if (index >= 0) {
    policies.splice(index, 1, next)
  } else {
    policies.unshift(next)
  }
  writePrivacyPolicies(policies)
  return next
}

export function archivePrivacyPolicy (id) {
  const policies = readPrivacyPolicies()
  const timestamp = nowText()
  const nextPolicies = policies.map((policy) => {
    if (policy.id !== id) return policy
    return {
      ...policy,
      status: '已存档',
      archivedAt: timestamp,
      updatedAt: timestamp
    }
  })
  writePrivacyPolicies(nextPolicies)
  return nextPolicies.find((policy) => policy.id === id) || null
}

export function deletePrivacyPolicy (id) {
  writePrivacyPolicies(readPrivacyPolicies().filter((policy) => policy.id !== id))
}
