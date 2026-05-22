const FLAGS_STORAGE_KEY = 'privacy-gen:feature-flags'
const SEGMENTS_STORAGE_KEY = 'privacy-gen:feature-segments'
const SEGMENT_ATTRIBUTES_STORAGE_KEY = 'privacy-gen:feature-segment-attributes'
const APPROVALS_STORAGE_KEY = 'privacy-gen:flag-approvals'

export const flagStatusOptions = [
  { value: '开启', label: '开启', tone: 'success' },
  { value: '关闭', label: '关闭', tone: 'default' },
  { value: '审批中', label: '审批中', tone: 'warning' }
]

function normalizeCondition (condition, index) {
  return {
    id: condition?.id || `cond-${index + 1}`,
    field: condition?.field || '',
    operator: condition?.operator || '=',
    value: condition?.value ?? ''
  }
}

function normalizeRule (rule, index) {
  const variations = Array.isArray(rule?.variations) && rule.variations.length
    ? rule.variations.map((item, variationIndex) => ({
      key: item?.key || '',
      value: item?.value ?? (variationIndex === 0 ? 100 : 0)
    }))
    : [{ key: '', value: 100 }]

  return {
    id: rule?.id || `rule-${index + 1}`,
    name: rule?.name || `规则${index + 1}`,
    segmentKey: rule?.segmentKey || rule?.segment || '',
    segmentName: rule?.segmentName || '',
    conditions: Array.isArray(rule?.conditions) && rule.conditions.length
      ? rule.conditions.map(normalizeCondition)
      : [normalizeCondition({}, 0)],
    variations
  }
}

function normalizeFeatureFlag (flag) {
  const variations = Array.isArray(flag?.variations) && flag.variations.length
    ? flag.variations
    : [
      { name: '关闭', key: 'false', value: 'false' },
      { name: '开启', key: 'true', value: 'true' }
    ]
  const resolveVariationKey = (value) => {
    const matched = variations.find((variation) => variation.key === value || variation.value === value)
    return matched?.key || value || variations[0]?.key || ''
  }

  return {
    id: flag?.id || `flag-${Date.now()}`,
    name: flag?.name || '',
    key: flag?.key || '',
    description: flag?.description || '',
    tag: flag?.tag || '',
    appId: flag?.appId || '',
    environment: flag?.environment || 'Production',
    status: flag?.status || '关闭',
    owner: flag?.owner || '',
    updatedAt: flag?.updatedAt || '',
    useClientSdk: flag?.useClientSdk ?? false,
    offValue: resolveVariationKey(flag?.offValue ?? flag?.defaultValue),
    defaultValue: resolveVariationKey(flag?.defaultValue),
    prerequisite: flag?.prerequisite || '',
    prerequisites: Array.isArray(flag?.prerequisites) ? flag.prerequisites : [],
    rules: Array.isArray(flag?.rules) ? flag.rules.map(normalizeRule) : [],
    variations,
    histories: Array.isArray(flag?.histories) ? flag.histories : []
  }
}

function parseSegmentRule (rule, index) {
  if (typeof rule !== 'string') return normalizeCondition(rule, index)
  const match = rule.match(/^(.+?)\s+(contains|>=|<=|!=|=|>|<)\s+(.+)$/)
  if (!match) {
    return {
      id: `attr-${index + 1}`,
      field: rule,
      operator: '=',
      value: ''
    }
  }
  return {
    id: `attr-${index + 1}`,
    field: match[1].trim(),
    operator: match[2].trim(),
    value: match[3].trim()
  }
}

function normalizeFeatureSegment (segment) {
  const attributes = Array.isArray(segment?.attributes) && segment.attributes.length
    ? segment.attributes.map(normalizeCondition)
    : Array.isArray(segment?.rules)
      ? segment.rules.map(parseSegmentRule)
      : []

  return {
    id: segment?.id || `seg-${Date.now()}`,
    name: segment?.name || '',
    key: segment?.key || '',
    description: segment?.description || '',
    users: segment?.users ?? 0,
    updatedAt: segment?.updatedAt || '',
    attributes,
    rules: attributes.map((item) => `${item.field} ${item.operator} ${item.value}`.trim())
  }
}

function normalizeSegmentAttribute (attribute) {
  return {
    id: attribute?.id || `segment-attr-${Date.now()}`,
    name: attribute?.name || '',
    key: attribute?.key || '',
    type: attribute?.type || 'string',
    description: attribute?.description || '',
    values: Array.isArray(attribute?.values) ? attribute.values : [],
    isDefault: attribute?.isDefault ?? String(attribute?.id || '').startsWith('segment-attr-'),
    sourceType: attribute?.sourceType || 'manual',
    refConfig: {
      url: attribute?.refConfig?.url || '',
      method: attribute?.refConfig?.method || 'GET',
      headers: attribute?.refConfig?.headers || ''
    },
    placeholderJson: attribute?.placeholderJson || '',
    mappings: {
      valuePath: attribute?.mappings?.valuePath || '',
      labelPath: attribute?.mappings?.labelPath || '',
      validPath: attribute?.mappings?.validPath || '',
      unitPath: attribute?.mappings?.unitPath || ''
    },
    extractorCode: attribute?.extractorCode || ''
  }
}

export const defaultFeatureSegments = [
  {
    id: 'seg-ios-beta-users',
    name: 'iOS 内测用户',
    key: 'ios_beta_users',
    description: 'iOS 内测渠道和高版本用户',
    attributes: [
      { id: 'attr-1', field: 'platform', operator: '=', value: 'iOS' },
      { id: 'attr-2', field: 'userTag', operator: 'contains', value: 'beta' },
      { id: 'attr-3', field: 'appVersion', operator: '>=', value: '2.4.0' }
    ],
    users: 1280,
    updatedAt: '2026-05-18 14:20'
  },
  {
    id: 'seg-android-new-users',
    name: 'Android 新用户',
    key: 'android_new_users',
    description: 'Android 注册 7 天内的新用户',
    attributes: [
      { id: 'attr-1', field: 'platform', operator: '=', value: 'Android' },
      { id: 'attr-2', field: 'registerDays', operator: '<=', value: '7' }
    ],
    users: 3420,
    updatedAt: '2026-05-17 09:32'
  },
  {
    id: 'seg-high-value',
    name: '高价值用户',
    key: 'high_value_users',
    description: '付费金额和活跃天数达到阈值的用户',
    attributes: [
      { id: 'attr-1', field: 'payAmount', operator: '>', value: '100' },
      { id: 'attr-2', field: 'activeDays', operator: '>=', value: '30' }
    ],
    users: 860,
    updatedAt: '2026-05-15 18:04'
  }
]

export const defaultSegmentAttributes = [
  { id: 'segment-attr-user-id', name: '用户 ID', key: 'userId', type: 'string', description: '用户唯一标识', values: ['00001', '00002', '00003'], isDefault: true },
  { id: 'segment-attr-platform', name: '平台', key: 'platform', type: 'string', description: '客户端平台', values: ['iOS', 'Android'], isDefault: true },
  { id: 'segment-attr-app-version', name: 'App 版本', key: 'appVersion', type: 'string', description: '客户端版本号', values: ['2.4.0', '2.5.0'], isDefault: true },
  { id: 'segment-attr-channel', name: '渠道', key: 'channel', type: 'string', description: '安装或实验渠道', values: ['test', 'appstore', 'organic'], isDefault: true },
  { id: 'segment-attr-country', name: '国家', key: 'country', type: 'string', description: '用户国家或地区', values: ['CN', 'US'], isDefault: true },
  { id: 'segment-attr-user-tag', name: '用户标签', key: 'userTag', type: 'string', description: '用户标签集合', values: ['beta', 'vip', 'trial'], isDefault: true }
]

export const defaultFeatureFlags = [
  {
    id: 'flag-onboarding-flow',
    name: '新手引导流程',
    key: 'privacy_onboarding_flow',
    description: 'Promotional Campaign in different city',
    tag: 'promotion_activity',
    appId: 'app-001',
    environment: 'Production',
    status: '开启',
    owner: '增长实验组',
    updatedAt: '2026-05-20 11:12',
    useClientSdk: true,
    offValue: 'old_onboarding',
    defaultValue: 'old_onboarding',
    prerequisite: 'experiment_layer = growth',
    prerequisites: [
      { id: 'pre-1', field: 'country', operator: '=', value: 'CN' },
      { id: 'pre-2', field: 'appVersion', operator: '>=', value: '2.4.0' }
    ],
    rules: [
      {
        id: 'rule-1',
        name: 'iOS 内测用户',
        conditions: [
          { id: 'cond-1', field: 'platform', operator: '=', value: 'iOS' },
          { id: 'cond-2', field: 'userTag', operator: 'contains', value: 'beta' }
        ],
        variations: [
          { key: 'old_onboarding', value: 60 },
          { key: 'new_onboarding', value: 40 }
        ]
      }
    ],
    variations: [
      { name: '旧流程', key: 'old_onboarding', value: 'old_onboarding' },
      { name: '新流程', key: 'new_onboarding', value: 'new_onboarding' }
    ]
  },
  {
    id: 'flag-install-copy',
    name: '安装按钮文案',
    key: 'install_button_copy',
    description: 'System degrade configuration.',
    tag: 'service_degrade',
    appId: 'app-002',
    environment: 'Staging',
    status: '审批中',
    owner: '移动发布组',
    updatedAt: '2026-05-21 16:45',
    useClientSdk: false,
    offValue: '立即安装',
    defaultValue: '立即安装',
    prerequisite: 'experiment_layer = install',
    prerequisites: [
      { id: 'pre-1', field: 'platform', operator: '=', value: 'Android' }
    ],
    rules: [
      {
        id: 'rule-1',
        name: '测试渠道',
        conditions: [
          { id: 'cond-1', field: 'channel', operator: '=', value: 'test' }
        ],
        variations: [
          { key: 'free_download', value: 20 },
          { key: 'install_now', value: 80 }
        ]
      }
    ],
    variations: [
      { name: '默认文案', key: 'install_now', value: '立即安装' },
      { name: '免费文案', key: 'free_download', value: '免费下载' }
    ]
  },
  {
    id: 'flag-paywall-layout',
    name: '会员页布局',
    key: 'paywall_layout',
    description: 'Test which color is more preferable',
    tag: 'color_ab_test',
    appId: 'app-006',
    environment: 'Production',
    status: '关闭',
    owner: '商业化组',
    updatedAt: '2026-05-10 20:00',
    useClientSdk: true,
    offValue: 'card_layout',
    defaultValue: 'card_layout',
    prerequisite: 'none',
    prerequisites: [
      { id: 'pre-1', field: 'userType', operator: '=', value: 'trial' }
    ],
    rules: [
      {
        id: 'rule-1',
        name: '试用用户',
        conditions: [
          { id: 'cond-1', field: 'userType', operator: '=', value: 'trial' },
          { id: 'cond-2', field: 'userType', operator: '=', value: 'free' }
        ],
        variations: [
          { key: 'card_layout', value: 75 },
          { key: 'list_layout', value: 25 }
        ]
      }
    ],
    variations: [
      { name: '卡片布局', key: 'card_layout', value: 'card_layout' },
      { name: '列表布局', key: 'list_layout', value: 'list_layout' }
    ]
  }
]

export const defaultFlagApprovals = [
  {
    id: 'approval-install-copy',
    flagKey: 'install_button_copy',
    title: '安装按钮文案灰度到 Staging',
    status: '待审批',
    applicant: '移动发布组',
    reviewer: '增长负责人',
    reason: '验证新用户安装点击率是否提升',
    submittedAt: '2026-05-21 16:45'
  },
  {
    id: 'approval-onboarding-flow',
    flagKey: 'privacy_onboarding_flow',
    title: '新手引导流程扩大到 40% 流量',
    status: '已通过',
    applicant: '增长实验组',
    reviewer: '产品负责人',
    reason: 'B 组注册转化率提升明显，扩大灰度范围',
    submittedAt: '2026-05-20 10:18'
  }
]

export function readFeatureFlags () {
  try {
    const raw = localStorage.getItem(FLAGS_STORAGE_KEY)
    const flags = raw ? JSON.parse(raw) : [...defaultFeatureFlags]
    return flags.map(normalizeFeatureFlag)
  } catch {
    return defaultFeatureFlags.map(normalizeFeatureFlag)
  }
}

export function readFeatureSegments () {
  try {
    const raw = localStorage.getItem(SEGMENTS_STORAGE_KEY)
    const segments = raw ? JSON.parse(raw) : [...defaultFeatureSegments]
    return segments.map(normalizeFeatureSegment)
  } catch {
    return defaultFeatureSegments.map(normalizeFeatureSegment)
  }
}

export function readSegmentAttributes () {
  try {
    const raw = localStorage.getItem(SEGMENT_ATTRIBUTES_STORAGE_KEY)
    const attributes = raw ? JSON.parse(raw) : [...defaultSegmentAttributes]
    return attributes.map(normalizeSegmentAttribute)
  } catch {
    return defaultSegmentAttributes.map(normalizeSegmentAttribute)
  }
}

export function readFlagApprovals () {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : [...defaultFlagApprovals]
  } catch {
    return [...defaultFlagApprovals]
  }
}

export function findFeatureFlag (id) {
  return readFeatureFlags().find((flag) => flag.id === id) || null
}

export function findFeatureSegment (id) {
  return readFeatureSegments().find((segment) => segment.id === id) || null
}

export function findFlagApproval (id) {
  return readFlagApprovals().find((approval) => approval.id === id) || null
}

export function findSegmentAttribute (id) {
  return readSegmentAttributes().find((attribute) => attribute.id === id) || null
}

export function updateFeatureFlag (id, data) {
  const flags = readFeatureFlags()
  const index = flags.findIndex((flag) => flag.id === id)
  if (index === -1) return null
  flags[index] = normalizeFeatureFlag({
    ...flags[index],
    ...data,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(flags))
  return flags[index]
}

export function createFeatureFlag (data) {
  const flags = readFeatureFlags()
  const flag = normalizeFeatureFlag({
    id: `flag-${Date.now()}`,
    name: '',
    key: '',
    description: '',
    tag: '',
    appId: '',
    environment: 'Production',
    status: '关闭',
    owner: '',
    defaultValue: 'false',
    prerequisite: '',
    prerequisites: [],
    rules: [],
    variations: [
      { name: '关闭', key: 'false', value: 'false' },
      { name: '开启', key: 'true', value: 'true' }
    ],
    offValue: 'false',
    ...data,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify([flag, ...flags]))
  return flag
}

export function updateFeatureSegment (id, data) {
  const segments = readFeatureSegments()
  const index = segments.findIndex((segment) => segment.id === id)
  if (index === -1) return null
  segments[index] = normalizeFeatureSegment({
    ...segments[index],
    ...data,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify(segments))
  return segments[index]
}

export function createFeatureSegment (data) {
  const segments = readFeatureSegments()
  const segment = normalizeFeatureSegment({
    id: `seg-${Date.now()}`,
    name: '',
    key: '',
    description: '',
    users: 0,
    attributes: [],
    ...data,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  })
  localStorage.setItem(SEGMENTS_STORAGE_KEY, JSON.stringify([segment, ...segments]))
  return segment
}

export function createSegmentAttribute (data) {
  const attributes = readSegmentAttributes()
  const attribute = normalizeSegmentAttribute({
    id: `segment-attr-${Date.now()}`,
    isDefault: false,
    ...data
  })
  localStorage.setItem(SEGMENT_ATTRIBUTES_STORAGE_KEY, JSON.stringify([attribute, ...attributes]))
  return attribute
}

export function updateSegmentAttribute (id, data) {
  const attributes = readSegmentAttributes()
  const index = attributes.findIndex((attribute) => attribute.id === id)
  if (index === -1) return null
  attributes[index] = normalizeSegmentAttribute({
    ...attributes[index],
    ...data
  })
  localStorage.setItem(SEGMENT_ATTRIBUTES_STORAGE_KEY, JSON.stringify(attributes))
  return attributes[index]
}

export function deleteSegmentAttribute (id) {
  const attributes = readSegmentAttributes()
  const target = attributes.find((attribute) => attribute.id === id)
  if (!target || target.isDefault) return false
  localStorage.setItem(SEGMENT_ATTRIBUTES_STORAGE_KEY, JSON.stringify(attributes.filter((attribute) => attribute.id !== id)))
  return true
}

export function updateFlagApproval (id, data) {
  const approvals = readFlagApprovals()
  const index = approvals.findIndex((approval) => approval.id === id)
  const nextApproval = {
    id,
    title: '',
    flagKey: '',
    status: '待审批',
    applicant: '',
    reviewer: '',
    reason: '',
    submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...(index === -1 ? {} : approvals[index]),
    ...data
  }
  if (index === -1) approvals.unshift(nextApproval)
  else approvals[index] = nextApproval
  localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvals))
  return nextApproval
}
