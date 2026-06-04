import axios from 'axios'

const TOKEN_KEY = 'privacy-gen-token'
const USER_KEY = 'privacy-gen-user'
const AUTH_PERMISSIONS_KEY = 'privacy-gen-auth-permissions'
const AUTH_MENUS_KEY = 'privacy-gen-auth-menus'

const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(AUTH_PERMISSIONS_KEY)
  localStorage.removeItem(AUTH_MENUS_KEY)
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const res = response.data
    if (!res || typeof res !== 'object' || !Object.prototype.hasOwnProperty.call(res, 'code')) {
      return res
    }
    if (res.code !== 0) {
      if (res.code === 401) {
        clearAuthStorage()
        window.location.hash = '#/login'
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage()
      window.location.hash = '#/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    const message = error.response?.data?.message || error.message || '请求失败'
    const normalizedError = new Error(message)
    normalizedError.status = error.response?.status
    normalizedError.response = error.response
    return Promise.reject(normalizedError)
  }
)

export default http
