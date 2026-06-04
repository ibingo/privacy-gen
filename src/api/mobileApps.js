import http from '../utils/http'

export const createMobileAppApi = (data) => http.post('/mobile-app/create', data)
export const listMobileAppsApi = (data) => http.post('/mobile-apps/list', data)
export const listMobileAppMultiPlatformsApi = (id) => http.post('/mobile-app/multi-platforms', { id })
export const updateMobileAppInstallSettingsApi = (id, data) => http.post('/mobile-app/install-detail/update-settings', { id, ...data })
export const getMobileAppInstallDetailApi = async (id) => {
  try {
    return await http.post('/mobile-app/install-detail', { id })
  } catch (error) {
    if (error?.status === 404 || error?.response?.status === 404) return null
    throw error
  }
}

export const distributionModeLabels = {
  internal: '内测模式(下载次数受限制)',
  public: '公开分发',
  password: '密码访问'
}

const installModeLabels = {
  public: '公开',
  password: '密码安装',
  invite: '邀请安装'
}

const downloadValidityLabels = {
  'long-term': '长期有效',
  '7-days': '7 天有效',
  '30-days': '30 天有效',
  '90-days': '90 天有效'
}

const fileNameRuleLabels = {
  'app-name-version': '应用名_版本',
  original: '原始文件名',
  'app-name-build': '应用名_Build'
}

const languageLabels = {
  auto: '自动',
  zh: '中文',
  en: '英文'
}

const reverseMap = (map) => Object.entries(map).reduce((acc, [value, label]) => {
  acc[label] = value
  return acc
}, {})

const distributionModeValues = Object.entries(distributionModeLabels).reduce((acc, [value, label]) => {
  acc[label] = value
  return acc
}, {})
const installModeValues = reverseMap(installModeLabels)
const downloadValidityValues = reverseMap(downloadValidityLabels)
const fileNameRuleValues = reverseMap(fileNameRuleLabels)
const languageValues = reverseMap(languageLabels)

export const normalizeDistributionMode = (value, fallback = 'internal') => {
  if (!value) return fallback
  return distributionModeLabels[value] ? value : distributionModeValues[value] || fallback
}

export const formatDistributionMode = (value) => {
  const mode = normalizeDistributionMode(value)
  return distributionModeLabels[mode] || value || distributionModeLabels.internal
}

export const isPasswordDistributionMode = (value) => normalizeDistributionMode(value) === 'password'

export const normalizeInstallMode = (value, fallback = 'public') => {
  if (!value) return fallback
  return installModeLabels[value] ? value : installModeValues[value] || fallback
}

export const normalizeDownloadValidity = (value, fallback = 'long-term') => {
  if (!value) return fallback
  return downloadValidityLabels[value] ? value : downloadValidityValues[value] || fallback
}

export const normalizeDownloadFileNameRule = (value, fallback = 'app-name-version') => {
  if (!value) return fallback
  return fileNameRuleLabels[value] ? value : fileNameRuleValues[value] || fallback
}

export const normalizeDownloadLanguage = (value, fallback = 'auto') => {
  if (!value) return fallback
  return languageLabels[value] ? value : languageValues[value] || fallback
}

const labelOf = (map, value, fallback) => map[value] || value || fallback

export const normalizeMobileAppInstallDetail = (detail, fallbackApp = {}) => {
  if (!detail || typeof detail !== 'object') return null

  const settings = detail.settings || {}
  const app = {
    ...fallbackApp,
    ...(detail.app || {})
  }
  const screenshots = Array.isArray(detail.screenshots) ? detail.screenshots : []

  return {
    ...detail,
    app: {
      ...app,
      installSettings: {
        ...(fallbackApp.installSettings || {}),
        installUrl: detail.downloadLink || fallbackApp.installSettings?.installUrl || '',
        appStoreUrl: detail.appStoreLink || fallbackApp.installSettings?.appStoreUrl || '',
        shortKey: detail.shortLinkKey || fallbackApp.installSettings?.shortKey || app.id || '',
        qrValue: detail.qrCodeContent || detail.downloadLink || fallbackApp.installSettings?.qrValue || '',
        installDescription: detail.appDescription || app.description || '',
        installReleaseNotes: detail.releaseNotes || detail.latestVersion?.releaseNotes || '',
        screenshots,
        distributionMode: normalizeDistributionMode(settings.distributionMode, normalizeDistributionMode(fallbackApp.installSettings?.distributionMode)),
        installMethod: labelOf(installModeLabels, settings.installMode, '公开'),
        accessCode: settings.accessCode || settings.accessPassword || settings.password || fallbackApp.installSettings?.accessCode || fallbackApp.installSettings?.accessPassword || '',
        accessPassword: settings.accessCode || settings.accessPassword || settings.password || fallbackApp.installSettings?.accessCode || fallbackApp.installSettings?.accessPassword || '',
        accessPasswordHint: settings.accessPasswordHint || settings.passwordHint || fallbackApp.installSettings?.accessPasswordHint || '请输入访问密码后继续安装',
        downloadEnabled: settings.downloadEnabled ?? true,
        downloadValidity: labelOf(downloadValidityLabels, settings.downloadValidity, '长期有效'),
        downloadNameMode: labelOf(fileNameRuleLabels, settings.downloadFileNameRule, '应用名_版本'),
        syncMarketInfo: settings.syncMarketInfo ?? true,
        removeAdLimit: settings.enableAdHocPackage ?? true,
        downloadLanguage: labelOf(languageLabels, settings.language, '自动'),
        feedbackEnabled: settings.feedbackEnabled ?? false,
        showCopyright: settings.showCopyright ?? true,
        showInstallGuide: settings.showInstallGuide ?? true,
        showHistory: settings.showHistoryVersions ?? true
      }
    },
    latestVersion: detail.latestVersion || null,
    historyVersions: Array.isArray(detail.historyVersions) ? detail.historyVersions : []
  }
}
