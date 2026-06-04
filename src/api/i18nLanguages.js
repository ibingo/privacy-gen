import http from '../utils/http'

export const listI18nLanguagesApi = () => http.post('/i18n/languages/list')
