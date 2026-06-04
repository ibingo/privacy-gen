import http from '../utils/http'

export const userProfileApi = () => http.post('/user/me/profile')

export const userSecuritySettingsApi = {
  get: () => http.post('/user/me/security-settings'),
  update: (data) => http.post('/user/me/security-settings/update', data)
}

export const userPasswordApi = {
  update: (data) => http.post('/user/me/password/update', data)
}
