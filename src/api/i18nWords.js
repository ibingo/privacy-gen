import http from '../utils/http'

export const listI18nProjectsApi = (data) => http.post('/i18n/projects/list', data)
export const getI18nProjectDetailApi = (projectId) => http.post('/i18n/projects/detail', { projectId })
export const createI18nProjectApi = (data) => http.post('/i18n/projects/create', data)
export const addI18nProjectLanguagesApi = (projectId, locales, options = {}) => http.post('/i18n/languages/add', { projectId, locales, ...options })
export const getI18nOverviewApi = (projectId) => http.post('/i18n/overview', { projectId })

export const listI18nWordsApi = (data) => http.post('/i18n/words/list', data)
export const saveI18nWordApi = (data) => http.post('/i18n/words/save', data)
export const deleteI18nWordApi = (wordId, data = {}) => http.post('/i18n/words/delete', { wordId, ...data })
export const importI18nWordsApi = (data) => http.post('/i18n/words/import', data)

export const listI18nWordTagsApi = (data) => http.post('/i18n/word-tags/list', data)
export const createI18nWordTagApi = (data) => http.post('/i18n/word-tags/create', data)
export const updateI18nWordTagApi = (tagId, data) => http.post('/i18n/word-tags/update', { tagId, ...data })
export const deleteI18nWordTagApi = (tagId, data = {}) => http.post('/i18n/word-tags/delete', { tagId, ...data })
