export const AUTH_STORAGE_KEY = 'privacy-gen-auth'

const DEMO_ACCOUNT = {
  username: 'admin',
  password: '123456',
  displayName: '法务管理员'
}

export const isAuthenticated = () => {
  return localStorage.getItem(AUTH_STORAGE_KEY) === '1'
}

export const login = ({ username, password }) => {
  const matched =
    username.trim() === DEMO_ACCOUNT.username && password === DEMO_ACCOUNT.password

  if (matched) {
    localStorage.setItem(AUTH_STORAGE_KEY, '1')
  }

  return matched
}

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const getDemoAccount = () => {
  return { ...DEMO_ACCOUNT }
}
