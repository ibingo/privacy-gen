const STORAGE_KEY = 'privacy-gen:mobile-ab-tests'

const defaultAbTests = [
  {
    id: 'ab-privacy-onboarding',
    appId: 'app-001',
    toggleKey: 'privacy_onboarding_flow',
    environment: 'Production',
    layer: 'growth_layer',
    prerequisite: 'experiment_layer = growth',
    name: '新手引导转化实验',
    status: '运行中',
    owner: '增长实验组',
    traffic: 40,
    startAt: '2026-05-14',
    endAt: '2026-05-28',
    metric: '注册转化率',
    baseline: '18.4%',
    uplift: '+6.8%',
    confidence: '95.2%',
    rule: 'country = CN AND appVersion >= 2.4.0',
    variants: [
      { name: 'control', value: 'old_onboarding', ratio: 50, conversion: '18.4%', users: 3260 },
      { name: 'treatment', value: 'new_onboarding', ratio: 50, conversion: '25.2%', users: 3198 }
    ]
  },
  {
    id: 'ab-install-copy',
    appId: 'app-002',
    toggleKey: 'install_button_copy',
    environment: 'Staging',
    layer: 'install_layer',
    prerequisite: 'experiment_layer = install',
    name: '安装页按钮文案实验',
    status: '待启动',
    owner: '移动发布组',
    traffic: 20,
    startAt: '2026-05-23',
    endAt: '2026-06-02',
    metric: '安装点击率',
    baseline: '32.1%',
    uplift: '-',
    confidence: '-',
    rule: 'platform = Android AND channel = test',
    variants: [
      { name: 'control', value: '立即安装', ratio: 50, conversion: '-', users: 0 },
      { name: 'treatment', value: '免费下载', ratio: 50, conversion: '-', users: 0 }
    ]
  },
  {
    id: 'ab-paywall-layout',
    appId: 'app-006',
    toggleKey: 'paywall_layout',
    environment: 'Production',
    layer: 'commerce_layer',
    prerequisite: 'experiment_layer = commerce',
    name: '会员页布局实验',
    status: '已结束',
    owner: '商业化组',
    traffic: 60,
    startAt: '2026-04-20',
    endAt: '2026-05-10',
    metric: '订阅转化率',
    baseline: '4.6%',
    uplift: '+1.2%',
    confidence: '91.7%',
    rule: 'userType = trial OR userType = free',
    variants: [
      { name: 'control', value: 'card_layout', ratio: 50, conversion: '4.6%', users: 4820 },
      { name: 'treatment', value: 'list_layout', ratio: 50, conversion: '5.8%', users: 4752 }
    ]
  }
]

export const defaultExperimentLayers = [
  { key: 'growth_layer', name: '增长实验层', traffic: 20, used: 12, reserved: 8, description: '登录、注册、新手引导相关实验互斥层' },
  { key: 'install_layer', name: '安装转化层', traffic: 15, used: 6, reserved: 9, description: '安装页面、下载按钮、渠道转化实验' },
  { key: 'commerce_layer', name: '商业化实验层', traffic: 25, used: 15, reserved: 10, description: '订阅、会员、权益展示相关实验' }
]

export const abStatusOptions = [
  { value: '运行中', label: '运行中', tone: 'success' },
  { value: '待启动', label: '待启动', tone: 'warning' },
  { value: '已暂停', label: '已暂停', tone: 'processing' },
  { value: '已结束', label: '已结束', tone: 'default' }
]

export function readAbTests () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored = raw ? JSON.parse(raw) : null
    return Array.isArray(stored) && stored.length ? stored : defaultAbTests
  } catch {
    return defaultAbTests
  }
}

export function writeAbTests (tests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
}

export function createAbTest (data) {
  const tests = readAbTests()
  const test = {
    id: `ab-${Date.now()}`,
    status: '待启动',
    traffic: 10,
    environment: 'Production',
    layer: 'growth_layer',
    prerequisite: 'experiment_layer = growth',
    toggleKey: `toggle_${Date.now()}`,
    rule: 'all users',
    confidence: '-',
    uplift: '-',
    variants: [
      { name: 'control', value: 'A', ratio: 50, conversion: '-', users: 0 },
      { name: 'treatment', value: 'B', ratio: 50, conversion: '-', users: 0 }
    ],
    ...data
  }
  writeAbTests([test, ...tests])
  return test
}
