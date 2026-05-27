<template>
  <div>
    <div class="mc-metrics-grid starter-list-metrics">
      <div v-for="metric in metrics" :key="metric.label" class="mc-metric-card">
        <div class="mc-metric-icon" :style="{ background: metric.gradient }">
          <span>{{ metric.icon }}</span>
        </div>
        <div class="mc-metric-info">
          <span class="mc-metric-label">{{ metric.label }}</span>
          <span class="mc-metric-value">{{ metric.value }}</span>
          <span class="mc-metric-change" :class="metric.tone">{{ metric.sub }}</span>
        </div>
      </div>
    </div>

    <starter-list-page
      v-model:keyword="keyword"
      title="AB 测试服务"
      primary-action="新建实验"
      search-placeholder="搜索实验名称、指标或负责人..."
      :breadcrumb="['功能特性管理', 'AB 测试服务']"
      :columns="columns"
      :data="filteredTests"
      @primary="showCreateDialog = true"
    >
      <template #filters>
        <t-select v-model="activeStatus" class="starter-list-filter-select" placeholder="状态">
          <t-option value="all" label="全部状态" />
          <t-option v-for="status in abStatusOptions" :key="status.value" :value="status.value" :label="status.label" />
        </t-select>
        <t-select v-model="activeAppId" class="starter-list-filter-select" placeholder="所属应用">
          <t-option value="all" label="全部应用" />
          <t-option v-for="app in apps" :key="app.id" :value="app.id" :label="`${app.name} · ${app.platform}`" />
        </t-select>
        <t-select v-model="activeEnvironment" class="starter-list-filter-select" placeholder="环境">
          <t-option value="all" label="全部环境" />
          <t-option v-for="env in environments" :key="env" :value="env" :label="env" />
        </t-select>
      </template>

      <template #name="{ row }">
        <div class="feature-flag-intro">
          <div>
            <strong>{{ row.name }}</strong>
            <t-tag theme="primary" variant="light">{{ row.toggleKey }}</t-tag>
          </div>
          <small>{{ getAppName(row.appId) }} · {{ row.metric }} · {{ row.owner }}</small>
        </div>
      </template>

      <template #status="{ row }">
        <t-tag :theme="getStatusTheme(row.status)" variant="light">{{ row.status }}</t-tag>
      </template>

      <template #traffic="{ row }">
        <div class="ab-test-traffic">
          <strong>{{ row.traffic }}%</strong>
          <div class="mc-platform-bar-track">
            <div class="mc-platform-bar-fill" :style="{ width: row.traffic + '%', background: '#0052d9' }"></div>
          </div>
        </div>
      </template>

      <template #period="{ row }">
        {{ row.startAt }} 至 {{ row.endAt }}
      </template>

      <template #effect="{ row }">
        提升 {{ row.uplift }} · 置信度 {{ row.confidence }}
      </template>

      <template #variants="{ row }">
        <t-space size="small" :break-line="true">
          <t-tag v-for="variant in row.variants" :key="variant.name" variant="light">
            {{ variant.name }} {{ variant.ratio }}%
          </t-tag>
        </t-space>
      </template>
    </starter-list-page>

    <div v-if="showCreateDialog" class="mc-dialog-overlay" @click.self="showCreateDialog = false">
      <div class="mc-dialog">
        <div class="mc-dialog-header">
          <h3>新建 AB 测试</h3>
          <button class="mc-dialog-close" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-form-group">
            <label>实验名称</label>
            <input v-model="form.name" type="text" placeholder="例如：安装页转化实验" />
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>所属应用</label>
              <select v-model="form.appId">
                <option v-for="app in apps" :key="app.id" :value="app.id">{{ app.name }} · {{ app.platform }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>实验指标</label>
              <input v-model="form.metric" type="text" placeholder="安装点击率" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>流量比例</label>
              <input v-model.number="form.traffic" type="number" min="1" max="100" />
            </div>
            <div class="mc-form-group">
              <label>负责人</label>
              <input v-model="form.owner" type="text" placeholder="增长实验组" />
            </div>
          </div>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>开始时间</label>
              <input v-model="form.startAt" type="date" />
            </div>
            <div class="mc-form-group">
              <label>结束时间</label>
              <input v-model="form.endAt" type="date" />
            </div>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="showCreateDialog = false">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleCreate">创建实验</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { MessagePlugin, Option as TOption, Select as TSelect, Space as TSpace, Tag as TTag } from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { abStatusOptions, createAbTest, readAbTests } from '../../config/abTests'
import { readMobileApps } from '../../config/mobileApps'

const apps = readMobileApps()
const tests = ref(readAbTests())
const keyword = ref('')
const activeStatus = ref('all')
const activeAppId = ref('all')
const activeEnvironment = ref('all')
const showCreateDialog = ref(false)
const form = ref(buildForm())

const columns = [
  { colKey: 'name', title: '实验名称', minWidth: 320 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'traffic', title: '实验流量', width: 150 },
  { colKey: 'environment', title: '环境', width: 130 },
  { colKey: 'variants', title: '分组', minWidth: 180 },
  { colKey: 'period', title: '实验周期', width: 220 },
  { colKey: 'effect', title: '结果', width: 190 }
]

const environments = computed(() => [...new Set(tests.value.map((test) => test.environment).filter(Boolean))])

const metrics = computed(() => {
  const running = tests.value.filter((item) => item.status === '运行中').length
  const waiting = tests.value.filter((item) => item.status === '待启动').length
  const avgTraffic = tests.value.length ? Math.round(tests.value.reduce((sum, item) => sum + item.traffic, 0) / tests.value.length) : 0
  return [
    { icon: 'AB', label: '实验总数', value: `${tests.value.length} 个`, sub: `${running} 个运行中`, tone: 'mc-change-up', gradient: 'linear-gradient(135deg, #0052d9, #35c2ff)' },
    { icon: 'Run', label: '运行中', value: `${running} 个`, sub: '实时分流', tone: 'mc-change-up', gradient: 'linear-gradient(135deg, #00a870, #78e08f)' },
    { icon: 'Wait', label: '待启动', value: `${waiting} 个`, sub: '等待上线', tone: 'mc-change-warn', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    { icon: '%', label: '平均流量', value: `${avgTraffic}%`, sub: '按实验均值', tone: 'mc-change-neutral', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
  ]
})

const filteredTests = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return tests.value.filter((test) => {
    const matchStatus = activeStatus.value === 'all' || test.status === activeStatus.value
    const matchApp = activeAppId.value === 'all' || test.appId === activeAppId.value
    const matchEnvironment = activeEnvironment.value === 'all' || test.environment === activeEnvironment.value
    const matchKeyword = !q || `${test.name} ${test.metric} ${test.owner} ${test.environment} ${getAppName(test.appId)}`.toLowerCase().includes(q)
    return matchStatus && matchApp && matchEnvironment && matchKeyword
  })
})

function buildForm () {
  const today = new Date().toISOString().slice(0, 10)
  return {
    name: '',
    appId: apps[0]?.id || '',
    metric: '安装点击率',
    traffic: 20,
    owner: '',
    startAt: today,
    endAt: today,
    baseline: '-'
  }
}

function getAppName (appId) {
  const app = apps.find((item) => item.id === appId)
  return app ? `${app.name} ${app.platform}` : '未关联应用'
}

function getStatusTheme (status) {
  const tone = abStatusOptions.find((item) => item.value === status)?.tone || 'default'
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'processing') return 'primary'
  return 'default'
}

function handleCreate () {
  if (!form.value.name.trim() || !form.value.appId) {
    MessagePlugin.warning('请填写实验名称并选择应用')
    return
  }
  createAbTest(form.value)
  tests.value = readAbTests()
  showCreateDialog.value = false
  form.value = buildForm()
  MessagePlugin.success('AB 测试已创建')
}
</script>
