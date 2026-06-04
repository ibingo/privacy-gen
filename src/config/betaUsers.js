import { readMobileApps, readMobileAppVersions } from './mobileApps'
import { DEFAULT_BETA_INVITE_TEMPLATE_ID } from './betaInviteTemplates'
import { addJoinedBetaInviteUser, findBetaInvite, getInviteTargetApp, getInviteVersionLabel, removeJoinedBetaInviteUser } from './betaInvites'

const STORAGE_KEY = 'privacy-gen:mobile-beta-users'

const defaultUsers = [
  { id: 'beta-user-001', userName: '张一鸣', account: 'zhangym@example.com', phone: '13800001001', appName: 'Privacy Gen', platforms: ['iOS'], versionId: 'app-001-version-241', status: 'enabled', expiresAt: '2026-06-30', remark: '法务内测成员' },
  { id: 'beta-user-002', userName: '李思雨', account: 'lisiyu@example.com', phone: '13800001002', appName: 'Privacy Gen', platforms: ['Android'], versionId: 'app-002-version-240', status: 'enabled', expiresAt: '2026-06-18', remark: '移动端回归测试' },
  { id: 'beta-user-003', userName: '王晨', account: 'wangchen@example.com', phone: '13800001003', appName: 'i18n Manager', platforms: ['iOS'], versionId: 'app-003-version-183', status: 'disabled', expiresAt: '2026-05-31', remark: '暂停测试资格' },
  { id: 'beta-user-004', userName: '赵敏', account: 'zhaomin@example.com', phone: '13800001004', appName: 'Icon Studio', platforms: ['iOS', 'Web App'], versionId: 'app-005-version-310', status: 'enabled', expiresAt: '2026-07-15', remark: '设计协作验证' },
  { id: 'beta-user-005', userName: '陈卓', account: 'chenzhuo@example.com', phone: '13800001005', appName: 'Compliance Hub', platforms: ['Web App'], versionId: 'all', status: 'expired', expiresAt: '2026-05-01', remark: '历史测试账号' },
  { id: 'beta-user-006', userName: '周琳', account: 'zhoulin@example.com', phone: '13800001006', appName: 'Privacy Gen', platforms: ['iOS', 'Android'], versionId: 'app-001-version-240', status: 'enabled', expiresAt: '2026-08-01', remark: '产品验收' }
]

function normalizeUser (user) {
  const appNames = Array.isArray(user.appNames)
    ? user.appNames
    : user.appName
      ? [user.appName]
      : []
  const joinedTests = Array.isArray(user.joinedTests)
    ? user.joinedTests.map(normalizeJoinedTest)
    : []
  return {
    ...user,
    appNames,
    appName: user.appName || appNames[0] || '',
    platforms: user.platforms || [],
    versionId: user.versionId || 'all',
    templateId: user.templateId || DEFAULT_BETA_INVITE_TEMPLATE_ID,
    joinedTests
  }
}

function normalizeJoinedTest (test) {
  return {
    id: test.id || `joined-test-${Date.now()}`,
    inviteId: test.inviteId || '',
    joinedAt: test.joinedAt || formatNow(),
    notifyByEmail: Boolean(test.notifyByEmail),
    notifyBySms: Boolean(test.notifyBySms),
    ...test
  }
}

export function readBetaUsers () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const users = raw ? JSON.parse(raw) : defaultUsers
    return users.map(normalizeUser)
  } catch {
    return defaultUsers.map(normalizeUser)
  }
}

export function writeBetaUsers (users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users.map(normalizeUser)))
}

export function findBetaUser (id) {
  return readBetaUsers().find((user) => user.id === id) || null
}

export function createBetaUser (data) {
  const users = readBetaUsers()
  const user = normalizeUser({
    id: `beta-user-${Date.now()}`,
    status: 'enabled',
    ...data
  })
  writeBetaUsers([user, ...users])
  return user
}

export function updateBetaUser (id, data) {
  const users = readBetaUsers()
  let updated = null
  const nextUsers = users.map((user) => {
    if (user.id !== id) return user
    updated = normalizeUser({ ...user, ...data })
    return updated
  })
  writeBetaUsers(nextUsers)
  return updated
}

export function deleteBetaUser (id) {
  writeBetaUsers(readBetaUsers().filter((user) => user.id !== id))
}

export function addBetaUserJoinedTest (id, inviteId, options = {}) {
  const invite = findBetaInvite(inviteId)
  if (!invite) return null

  const users = readBetaUsers()
  let updated = null
  const nextUsers = users.map((user) => {
    if (user.id !== id) return user
    const joinedTests = Array.isArray(user.joinedTests) ? user.joinedTests : []
    const existingIndex = joinedTests.findIndex((test) => test.inviteId === invite.id)
    const joinedTest = normalizeJoinedTest({
      id: existingIndex >= 0 ? joinedTests[existingIndex].id : `joined-test-${Date.now()}`,
      inviteId: invite.id,
      inviteTitle: invite.title,
      appName: invite.appName,
      platforms: invite.platforms || [],
      versionId: invite.versionId || 'all',
      versionLabel: getInviteVersionLabel(invite),
      joinedAt: formatNow(),
      notifyByEmail: Boolean(options.notifyByEmail),
      notifyBySms: Boolean(options.notifyBySms)
    })
    const nextJoinedTests = existingIndex >= 0
      ? joinedTests.map((test, index) => index === existingIndex ? joinedTest : test)
      : [joinedTest, ...joinedTests]
    updated = normalizeUser({
      ...user,
      appNames: [...new Set([...(user.appNames || [user.appName].filter(Boolean)), invite.appName])],
      joinedTests: nextJoinedTests
    })
    return updated
  })
  writeBetaUsers(nextUsers)
  if (updated) {
    syncBetaInviteJoinedUser(invite, updated, options)
  }
  return updated
}

export function removeBetaUserJoinedTest (id, joinedTestId) {
  const users = readBetaUsers()
  let updated = null
  let removedTest = null
  const nextUsers = users.map((user) => {
    if (user.id !== id) return user
    removedTest = (user.joinedTests || []).find((test) => test.id === joinedTestId) || null
    const nextJoinedTests = (user.joinedTests || []).filter((test) => test.id !== joinedTestId)
    updated = normalizeUser({ ...user, joinedTests: nextJoinedTests })
    return updated
  })
  writeBetaUsers(nextUsers)
  if (updated && removedTest?.inviteId) {
    removeSyncedBetaInviteJoinedUser(removedTest.inviteId, updated)
  }
  return updated
}

function syncBetaInviteJoinedUser (invite, user, options = {}) {
  const joinedUsers = Array.isArray(invite.joinedUsers) ? invite.joinedUsers : []
  const alreadyJoined = joinedUsers.some((joinedUser) => joinedUser.betaUserId === user.id || joinedUser.account === user.account || joinedUser.phone === user.phone)
  if (alreadyJoined) return
  addJoinedBetaInviteUser(invite.id, {
    betaUserId: user.id,
    userName: user.userName,
    account: user.account,
    phone: user.phone,
    source: '内测用户邀请',
    notifyByEmail: Boolean(options.notifyByEmail),
    notifyBySms: Boolean(options.notifyBySms)
  })
}

function removeSyncedBetaInviteJoinedUser (inviteId, user) {
  const invite = findBetaInvite(inviteId)
  if (!invite) return
  const joinedUser = (invite.joinedUsers || []).find((item) => item.betaUserId === user.id || item.account === user.account || item.phone === user.phone)
  if (!joinedUser) return
  removeJoinedBetaInviteUser(invite.id, joinedUser.id)
}

export function getBetaUserVersion (user) {
  if (!user || user.versionId === 'all') return null
  const apps = readMobileApps().filter((app) => app.name === user.appName && user.platforms.includes(app.platform))
  for (const app of apps) {
    const version = readMobileAppVersions(app.id).find((item) => item.id === user.versionId)
    if (version) return { ...version, platform: app.platform }
  }
  return null
}

export function getBetaUserVersionLabel (user) {
  const version = getBetaUserVersion(user)
  return version ? `${version.version}` : '不限制'
}

export function getBetaUserBuildNumber (user) {
  const version = getBetaUserVersion(user)
  return version?.buildNumber || '-'
}

export function getBetaUserTargetApp (user) {
  if (!user) return null
  const apps = readMobileApps().filter((app) => app.name === user.appName && user.platforms.includes(app.platform))
  if (!apps.length) return null
  if (user.versionId === 'all') return apps[0]
  return apps.find((app) => readMobileAppVersions(app.id).some((version) => version.id === user.versionId)) || apps[0]
}

export function getBetaUserJoinedTests (user) {
  return (user?.joinedTests || []).map((test) => {
    const invite = findBetaInvite(test.inviteId)
    const targetApp = invite ? getInviteTargetApp(invite) : null
    return {
      ...test,
      inviteTitle: invite?.title || test.inviteTitle || '-',
      appName: invite?.appName || test.appName || '-',
      platforms: invite?.platforms || test.platforms || [],
      versionLabel: invite ? getInviteVersionLabel(invite) : test.versionLabel || '不限制',
      targetApp
    }
  })
}

function formatNow () {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
