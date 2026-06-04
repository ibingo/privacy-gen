import http from '../utils/http'

export const loginApi = (data) => http.post('/auth/login', data)

export const logoutApi = () => http.post('/auth/logout')

export const sessionApi = () => http.post('/auth/session')

export const permissionsApi = () => http.post('/auth/permissions')
