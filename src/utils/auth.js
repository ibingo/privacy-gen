import { loginApi, logoutApi, permissionsApi, sessionApi } from '../api/auth'

const TOKEN_KEY = 'privacy-gen-token'
const USER_KEY = 'privacy-gen-user'
const AUTH_PERMISSIONS_KEY = 'privacy-gen-auth-permissions'
const AUTH_MENUS_KEY = 'privacy-gen-auth-menus'

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

const readJsonArray = (key) => {
  const raw = localStorage.getItem(key)
  if (!raw) return []

  try {
    const value = JSON.parse(raw)
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const getUserPermissions = () => readJsonArray(AUTH_PERMISSIONS_KEY)

export const getUserMenus = () => readJsonArray(AUTH_MENUS_KEY)

export const clearAuthPermissions = () => {
  localStorage.removeItem(AUTH_PERMISSIONS_KEY)
  localStorage.removeItem(AUTH_MENUS_KEY)
}

export const fetchAuthPermissions = async () => {
  const data = await permissionsApi()
  const permissions = Array.isArray(data?.permissions) ? data.permissions : []
  const menus = Array.isArray(data?.menus) ? data.menus : []
  localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(permissions))
  localStorage.setItem(AUTH_MENUS_KEY, JSON.stringify(menus))
  return { permissions, menus }
}

export const ensureAuthPermissions = async () => {
  if (isSuperAdmin()) return { permissions: [], menus: [] }
  const cachedMenus = getUserMenus()
  const cachedPermissions = getUserPermissions()
  if (cachedMenus.length || cachedPermissions.length) {
    return { permissions: cachedPermissions, menus: cachedMenus }
  }
  return fetchAuthPermissions()
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
  clearAuthPermissions()
  const normalizedUser = {
    ...(data.user || {}),
    username: data.user?.username || username,
    role: username === 'admin' ? 'super_admin' : data.user?.role || 'user',
    superAdmin: username === 'admin' || data.user?.superAdmin === true || data.user?.isSuperAdmin === true
  }
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser))
  if (!normalizedUser.superAdmin) {
    await fetchAuthPermissions()
  }
  return data
}

export const logout = async () => {
  try {
    await logoutApi()
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearAuthPermissions()
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
    clearAuthPermissions()
  } else if (data.user || data.profile || data.account) {
    const currentUser = getUser() || {}
    localStorage.setItem(USER_KEY, JSON.stringify({
      ...currentUser,
      ...(data.user || data.profile || data.account)
    }))
  }
  return data
}
