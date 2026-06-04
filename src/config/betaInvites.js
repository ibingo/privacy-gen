import { readMobileApps, readMobileAppVersions } from './mobileApps'
import { DEFAULT_BETA_INVITE_TEMPLATE_ID } from './betaInviteTemplates'

const STORAGE_KEY = 'privacy-gen:mobile-beta-invites'

const defaultInvites = [
  {
    id: 'beta-invite-001',
    code: 'PG-IOS-PUBLIC',
    title: 'Privacy Gen iOS 公开内测',
    appName: 'Privacy Gen',
    platforms: ['iOS'],
    versionId: 'app-001-version-241',
    inviteType: 'public',
    password: '',
    passwordReviewEnabled: false,
    quota: 120,
    usedCount: 46,
    status: 'enabled',
    expiresAt: '2026-07-31',
    owner: '法务技术组',
    templateId: DEFAULT_BETA_INVITE_TEMPLATE_ID,
    remark: '公开邀请链接，用于产品验收和法务试用。'
  },
  {
    id: 'beta-invite-002',
    code: 'PG-ANDROID-PWD',
    title: 'Privacy Gen Android 密码邀请',
    appName: 'Privacy Gen',
    platforms: ['Android'],
    versionId: 'app-002-version-240',
    inviteType: 'password',
    password: 'PG2026',
    passwordReviewEnabled: true,
    quota: 80,
    usedCount: 22,
    status: 'enabled',
    expiresAt: '2026-06-30',
    owner: '移动端测试组',
    templateId: DEFAULT_BETA_INVITE_TEMPLATE_ID,
    remark: '需要输入邀请密码后加入内测。'
  },
  {
    id: 'beta-invite-003',
    code: 'ICON-WEB-DESIGN',
    title: 'Icon Studio 设计协作邀请',
    appName: 'Icon Studio',
    platforms: ['iOS', 'Web App'],
    versionId: 'app-005-version-310',
    inviteType: 'public',
    password: '',
    passwordReviewEnabled: false,
    quota: 40,
    usedCount: 40,
    status: 'full',
    expiresAt: '2026-06-15',
    owner: '设计工程组',
    templateId: DEFAULT_BETA_INVITE_TEMPLATE_ID,
    remark: '名额已满，保留用于查看历史邀请。'
  },
  {
    id: 'beta-invite-004',
    code: 'CH-WEB-INTERNAL',
    title: 'Compliance Hub Web 内测',
    appName: 'Compliance Hub',
    platforms: ['Web App'],
    versionId: 'all',
    inviteType: 'password',
    password: 'CHTEST',
    passwordReviewEnabled: false,
    quota: 60,
    usedCount: 18,
    status: 'disabled',
    expiresAt: '2026-05-31',
    owner: '企业合规组',
    templateId: DEFAULT_BETA_INVITE_TEMPLATE_ID,
    remark: '阶段测试结束后暂停。'
  }
]

function normalizeInvite (invite) {
  const shouldReview = isInviteReviewEnabled(invite)
  const joinedUsers = Array.isArray(invite.joinedUsers)
    ? invite.joinedUsers.map((user) => normalizeJoinedUser(user, shouldReview))
    : []
  return {
    ...invite,
    platforms: invite.platforms || [],
    quota: Number(invite.quota) || 0,
    usedCount: Number(invite.usedCount) || 0,
    passwordReviewEnabled: Boolean(invite.passwordReviewEnabled),
    templateId: invite.templateId || DEFAULT_BETA_INVITE_TEMPLATE_ID,
    lockedFields: invite.lockedFields || [],
    joinedUsers,
    sourceType: invite.sourceType || '',
    sourceVersionId: invite.sourceVersionId || '',
    sourceAppId: invite.sourceAppId || ''
  }
}

function normalizeJoinedUser (user, shouldReview) {
  return {
    ...user,
    reviewStatus: user.reviewStatus || (shouldReview ? 'pending' : 'approved'),
    reviewedAt: user.reviewedAt || '',
    reviewer: user.reviewer || ''
  }
}

export function isInviteReviewEnabled (invite) {
  if (!invite) return false
  return invite.inviteType === 'public' || (invite.inviteType === 'password' && Boolean(invite.passwordReviewEnabled))
}

export function readBetaInvites () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const invites = raw ? JSON.parse(raw) : defaultInvites
    return invites.map(normalizeInvite)
  } catch {
    return defaultInvites.map(normalizeInvite)
  }
}

export function writeBetaInvites (invites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites.map(normalizeInvite)))
}

export function findBetaInvite (idOrCode) {
  return readBetaInvites().find((invite) => invite.id === idOrCode || invite.code === idOrCode) || null
}

export function createBetaInvite (data) {
  const invites = readBetaInvites()
  const invite = normalizeInvite({
    id: `beta-invite-${Date.now()}`,
    code: buildInviteCode(data.appName),
    usedCount: 0,
    status: 'enabled',
    ...data
  })
  writeBetaInvites([invite, ...invites])
  return invite
}

export function updateBetaInvite (id, data) {
  const invites = readBetaInvites()
  let updated = null
  const nextInvites = invites.map((invite) => {
    if (invite.id !== id) return invite
    updated = normalizeInvite({ ...invite, ...data })
    return updated
  })
  writeBetaInvites(nextInvites)
  return updated
}

export function deleteBetaInvite (id) {
  writeBetaInvites(readBetaInvites().filter((invite) => invite.id !== id))
}

export function addJoinedBetaInviteUser (id, data = {}) {
  const invite = findBetaInvite(id)
  if (!invite) return null

  const joinedUsers = Array.isArray(invite.joinedUsers) ? invite.joinedUsers : []
  const shouldReview = isInviteReviewEnabled(invite)
  const joinedUser = {
    id: `joined-user-${Date.now()}`,
    userName: `内测用户 ${joinedUsers.length + 1}`,
    account: '',
    phone: '',
    joinedAt: formatNow(),
    reviewStatus: shouldReview ? 'pending' : 'approved',
    reviewedAt: shouldReview ? '' : formatNow(),
    reviewer: shouldReview ? '' : '系统自动通过',
    source: '邀请页加入',
    ...data
  }
  const nextJoinedUsers = [joinedUser, ...joinedUsers]
  return updateBetaInvite(id, {
    joinedUsers: nextJoinedUsers,
    usedCount: nextJoinedUsers.length,
    status: nextJoinedUsers.length >= Number(invite.quota) ? 'full' : invite.status
  })
}

export function updateJoinedBetaInviteUserReview (id, userId, reviewStatus) {
  const invite = findBetaInvite(id)
  if (!invite || !['pending', 'approved', 'rejected'].includes(reviewStatus)) return null

  const nextJoinedUsers = (invite.joinedUsers || []).map((user) => {
    if (user.id !== userId) return user
    return {
      ...user,
      reviewStatus,
      reviewedAt: reviewStatus === 'pending' ? '' : formatNow(),
      reviewer: reviewStatus === 'pending' ? '' : '当前管理员'
    }
  })
  return updateBetaInvite(id, { joinedUsers: nextJoinedUsers })
}

export function removeJoinedBetaInviteUser (id, userId) {
  const invite = findBetaInvite(id)
  if (!invite) return null

  const nextJoinedUsers = (invite.joinedUsers || []).filter((user) => user.id !== userId)
  return updateBetaInvite(id, {
    joinedUsers: nextJoinedUsers,
    usedCount: nextJoinedUsers.length,
    status: nextJoinedUsers.length >= Number(invite.quota)
      ? 'full'
      : invite.status === 'disabled'
        ? 'disabled'
        : 'enabled'
  })
}

export function getInviteVersionLabel (invite) {
  if (!invite || invite.versionId === 'all') return '不限制'
  const apps = readMobileApps().filter((app) => app.name === invite.appName && invite.platforms.includes(app.platform))
  for (const app of apps) {
    const version = readMobileAppVersions(app.id).find((item) => item.id === invite.versionId)
    if (version) return `${app.platform} · ${version.version} · Build ${version.buildNumber}`
  }
  return '不限制'
}

export function getInviteTargetApp (invite) {
  if (!invite) return null
  const apps = readMobileApps().filter((app) => app.name === invite.appName && invite.platforms.includes(app.platform))
  if (!apps.length) return null
  if (invite.versionId === 'all') return apps[0]
  return apps.find((app) => readMobileAppVersions(app.id).some((version) => version.id === invite.versionId)) || apps[0]
}

export function isAutoCreatedBetaInvite (invite) {
  return invite?.sourceType === 'version-user-group-rollout'
}

function buildInviteCode (appName) {
  const prefix = String(appName || 'BETA')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase()
    .slice(0, 16) || 'BETA'
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

function formatNow () {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
