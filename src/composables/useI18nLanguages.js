import { computed, ref } from 'vue'
import { listI18nLanguagesApi } from '../api/i18nLanguages'
import {
  buildPgyerexLangOptions,
  extractPgyerexLangList,
  readPgyerexLangCache,
  writePgyerexLangCache
} from '../config/PgyerexLangSupport'

const cachedRows = readPgyerexLangCache()
const languageRows = ref(cachedRows)
const loading = ref(false)
const loaded = ref(Boolean(cachedRows.length))
let pendingRequest = null

const languageOptions = computed(() => buildPgyerexLangOptions(languageRows.value))

export function useI18nLanguages () {
  async function loadLanguages (options = {}) {
    const force = Boolean(options.force)
    if (loaded.value && !force) return languageRows.value
    if (pendingRequest && !force) return pendingRequest

    loading.value = true
    pendingRequest = listI18nLanguagesApi()
      .then((result) => {
        const rows = writePgyerexLangCache(extractPgyerexLangList(result))
        if (rows.length) {
          languageRows.value = rows
        }
        loaded.value = true
        return languageRows.value
      })
      .finally(() => {
        loading.value = false
        pendingRequest = null
      })

    return pendingRequest
  }

  return {
    languageRows,
    languageOptions,
    loading,
    loadLanguages
  }
}
