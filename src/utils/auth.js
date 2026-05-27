import { loginApi, logoutApi, sessionApi } from '../api/auth'

const TOKEN_KEY = 'privacy-gen-token'
const USER_KEY = 'privacy-gen-user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const isAuthenticated = () => !!getToken()

export const isSuperAdmin = () => {
  const user = getUser()
  const account = String(user?.username || user?.account || user?.loginName || user?.name || '').toLowerCase()
  if (account === 'admin') return true

  if (user?.superAdmin === true || user?.isSuperAdmin === true) return true

  const roles = [
    user?.role,
    user?.roleCode,
    user?.userType,
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(user?.authorities) ? user.authorities : [])
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase())

  return roles.some((role) => ['super_admin', 'super-admin', 'superadmin', 'admin', 'administrator', 'root'].includes(role))
}

export const login = async ({ username, password }) => {
  const data = await loginApi({ username, password })
  localStorage.setItem(TOKEN_KEY, data.tokenValue)
  const normalizedUser = {
    ...(data.user || {}),
    username: data.user?.username || username,
    role: username === 'admin' ? 'super_admin' : data.user?.role || 'user',
    superAdmin: username === 'admin' || data.user?.superAdmin === true || data.user?.isSuperAdmin === true
  }
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser))
  return data
}

export const logout = async () => {
  try {
    await logoutApi()
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export const devLogin = () => {
  return login({ username: 'admin', password: 'admin123' })
}

export const fetchSession = async () => {
  const data = await sessionApi()
  if (!data.login) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
  return data
}
