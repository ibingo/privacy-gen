import { buildPgyerexLangOptions, pgyerexLangOptions, readPgyerexLangCache } from './PgyerexLangSupport'

export const I18N_SETTINGS_STORAGE_KEY = 'privacy-gen:i18n-settings'

const cachedLangRows = readPgyerexLangCache()

export const i18nLocaleOptions = cachedLangRows.length ? buildPgyerexLangOptions(cachedLangRows) : pgyerexLangOptions

export const defaultPlaceholderConfigs = [
  {
    key: 'android',
    label: 'Android 占位符',
    description: '识别 strings.xml 中的 %s、%d、%f 和序号占位符。',
    example: '%1$s',
    enabled: true
  },
  {
    key: 'ios',
    label: 'iOS 占位符',
    description: '识别 Localizable.strings 中的 %@、%d、%f 和命名占位符。',
    example: '%@',
    enabled: true
  },
  {
    key: 'common',
    label: '通用占位符',
    description: '用于多端共用文案，保存 Android+iOS 文案时会转换为该格式。',
    example: '[%s]',
    enabled: true
  }
]

export const defaultI18nSettings = {
  sourceLocale: 'zh-CN',
  targetLocales: ['de', 'en', 'hu'],
  aiTranslationServiceId: 'ai-service-deepseek',
  placeholderConfigs: defaultPlaceholderConfigs,
  webhooks: []
}

const localeAliasMap = i18nLocaleOptions.reduce((map, locale) => {
  map[locale.value] = locale.value
  ;(locale.aliases || []).forEach((alias) => {
    if (!map[alias]) map[alias] = locale.value
  })
  return map
}, {})

Object.assign(localeAliasMap, {
  'zh-Hans': 'zh-CN',
  'zh_Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'zh_Hant': 'zh-TW',
  'hu-HU': 'hu',
  es: 'es-ES'
})

export function normalizeLocaleValue (value) {
  return localeAliasMap[value] || value
}

export function normalizeI18nSettings (settings = {}) {
  const sourceLocale = normalizeLocaleValue(settings.sourceLocale || defaultI18nSettings.sourceLocale)
  const targetLocales = (settings.targetLocales || defaultI18nSettings.targetLocales)
    .map(normalizeLocaleValue)
    .filter((value, index, list) => value && value !== sourceLocale && list.indexOf(value) === index)

  return {
    ...defaultI18nSettings,
    ...settings,
    sourceLocale,
    targetLocales: targetLocales.length ? targetLocales : [...defaultI18nSettings.targetLocales],
    aiTranslationServiceId: settings.aiTranslationServiceId || defaultI18nSettings.aiTranslationServiceId,
    placeholderConfigs: normalizePlaceholderConfigs(settings.placeholderConfigs),
    webhooks: Array.isArray(settings.webhooks) ? settings.webhooks : defaultI18nSettings.webhooks
  }
}

export function normalizePlaceholderConfigs (configs = defaultPlaceholderConfigs) {
  const configMap = Array.isArray(configs)
    ? configs.reduce((map, item) => {
      if (item?.key) map[item.key] = item
      return map
    }, {})
    : configs && typeof configs === 'object'
      ? configs
      : {}

  return defaultPlaceholderConfigs.map((config) => {
    const item = configMap[config.key] || {}
    return {
      ...config,
      ...item,
      key: config.key,
      label: item.label || config.label,
      description: item.description || config.description,
      example: item.example || config.example,
      enabled: item.enabled !== false
    }
  })
}

export function readI18nSettings () {
  try {
    const raw = localStorage.getItem(I18N_SETTINGS_STORAGE_KEY)
    return normalizeI18nSettings(raw ? JSON.parse(raw) : defaultI18nSettings)
  } catch {
    return normalizeI18nSettings(defaultI18nSettings)
  }
}

export function writeI18nSettings (settings) {
  const normalizedSettings = normalizeI18nSettings(settings)
  localStorage.setItem(I18N_SETTINGS_STORAGE_KEY, JSON.stringify(normalizedSettings))
  return normalizedSettings
}
