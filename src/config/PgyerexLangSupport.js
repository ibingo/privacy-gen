import pgyerexLangSupport from './PgyerexLangSupport.json'

export const I18N_LANGUAGES_CACHE_KEY = 'privacy-gen:i18n-languages'

const regionDisplayNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' })

export function getPgyerexLangRegionName (region) {
  if (!region || region === '未指定') return '未指定地区'

  try {
    const displayName = regionDisplayNames.of(region) || region

    if (region === 'TW') return '中国台湾'
    if (region === 'HK' || region === 'MO') {
      return displayName.startsWith('中国') ? displayName : `中国${displayName}`
    }

    return displayName
  } catch {
    return region
  }
}

function firstValue (...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || ''
}

export function normalizePgyerexLangRow (language = {}, fallbackCode = '') {
  const code = firstValue(language.code, language.value, language.id, language.langCode, language.languageCode, fallbackCode)
  const locale = firstValue(language.locale, language.langLocale, language.localeCode, language.bcp47Code)
  const region = firstValue(language.region, language.regionCode, locale.includes('-') ? locale.split('-').at(-1) : '未指定')
  const regionName = firstValue(language.regionName, language.chineseName, language.zhName, language.regionLabel)

  return {
    id: code,
    code,
    name: firstValue(language.name, language.label, language.displayName, language.languageName, code),
    editorCode: firstValue(language.editorCode, language.editor_code),
    twoLettersCode: firstValue(language.twoLettersCode, language.twoLetterCode, language.two_letters_code),
    threeLettersCode: firstValue(language.threeLettersCode, language.threeLetterCode, language.three_letters_code),
    locale,
    androidCode: firstValue(language.androidCode, language.android_code),
    osxCode: firstValue(language.osxCode, language.iosCode, language.osx_code),
    osxLocale: firstValue(language.osxLocale, language.iosLocale, language.osx_locale),
    region,
    regionName: regionName || getPgyerexLangRegionName(region)
  }
}

export function normalizePgyerexLangRows (languages = []) {
  const entries = Array.isArray(languages) ? languages.map((language) => ['', language]) : Object.entries(languages)
  return entries
    .map(([code, language]) => normalizePgyerexLangRow(language, code))
    .filter((language) => language.code)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function buildPgyerexLangOptions (rows = []) {
  return rows.map((language) => ({
    value: language.code,
    label: `${language.regionName} / ${language.name}`,
    shortLabel: language.regionName,
    name: language.name,
    code: language.code,
    locale: language.locale,
    regionName: language.regionName,
    aliases: [
      language.locale,
      language.editorCode,
      language.twoLettersCode,
      language.threeLettersCode,
      language.osxLocale
    ].filter(Boolean)
  }))
}

export function extractPgyerexLangList (response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.languages)) return response.languages
  if (Array.isArray(response?.languageList)) return response.languageList
  if (Array.isArray(response?.list)) return response.list
  if (Array.isArray(response?.records)) return response.records
  if (Array.isArray(response?.rows)) return response.rows
  if (Array.isArray(response?.data)) return response.data
  if (response && typeof response === 'object') {
    const values = Object.values(response)
    if (values.length && values.every((item) => item && typeof item === 'object')) return response
  }
  return []
}

export function readPgyerexLangCache () {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(I18N_LANGUAGES_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return normalizePgyerexLangRows(extractPgyerexLangList(parsed))
  } catch {
    return []
  }
}

export function writePgyerexLangCache (languages = []) {
  const rows = normalizePgyerexLangRows(extractPgyerexLangList(languages))
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(I18N_LANGUAGES_CACHE_KEY, JSON.stringify(rows))
  }
  return rows
}

export const pgyerexLangRows = normalizePgyerexLangRows(pgyerexLangSupport)

export const pgyerexLangOptions = buildPgyerexLangOptions(pgyerexLangRows)
