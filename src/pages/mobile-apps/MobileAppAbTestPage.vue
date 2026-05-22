<template>
  <div class="mobile-center-page">
    <div class="mc-list-toolbar">
      <div class="mc-toolbar-left">
        <div class="mc-search-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="keyword" type="text" placeholder="搜索实验名称、指标或负责人..." />
        </div>
        <div class="mc-filter-chips">
          <button
            v-for="chip in statusChips"
            :key="chip.value"
            class="mc-chip"
            :class="{ 'mc-chip-active': activeStatus === chip.value }"
            @click="activeStatus = chip.value"
          >{{ chip.label }}</button>
        </div>
      </div>
      <button class="mc-btn mc-btn-primary" @click="showCreateDialog = true">
        <span>+</span> 新建实验
      </button>
    </div>

    <div class="mc-metrics-grid">
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

    <section class="mc-panel">
      <div class="mc-panel-header">
        <div>
          <h3>AB 测试服务</h3>
          <p>关注实验流量、分组表现、转化指标和置信度。</p>
        </div>
      </div>

      <div class="mc-ab-list">
        <article v-for="test in filteredTests" :key="test.id" class="mc-ab-card">
          <div class="mc-ab-card-header">
            <div>
              <h4>{{ test.name }}</h4>
              <p>{{ getAppName(test.appId) }} · {{ test.metric }} · {{ test.owner }}</p>
            </div>
            <span class="mc-app-status" :class="`mc-status-${getStatusTone(test.status)}`">{{ test.status }}</span>
          </div>

          <div class="mc-ab-progress">
            <div>
              <span>实验流量</span>
              <strong>{{ test.traffic }}%</strong>
            </div>
            <div class="mc-platform-bar-track">
              <div class="mc-platform-bar-fill" :style="{ width: test.traffic + '%', background: '#0052d9' }"></div>
            </div>
          </div>

          <div class="mc-ab-variants">
            <div v-for="variant in test.variants" :key="variant.name" class="mc-ab-variant">
              <strong>{{ variant.name }}</strong>
              <span>{{ variant.ratio }}% 流量</span>
              <em>{{ variant.conversion }} · {{ formatNumber(variant.users) }} 用户</em>
            </div>
          </div>

          <div class="mc-ab-footer">
            <span>{{ test.startAt }} 至 {{ test.endAt }}</span>
            <span>提升 {{ test.uplift }} · 置信度 {{ test.confidence }}</span>
          </div>
        </article>

        <div v-if="filteredTests.length === 0" class="mc-empty-state">
          <p>没有找到匹配的实验</p>
          <button class="mc-btn mc-btn-outline" @click="keyword = ''; activeStatus = 'all'">清除筛选</button>
        </div>
      </div>
    </section>

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
import { MessagePlugin } from 'tdesign-vue-next'
import { abStatusOptions, createAbTest, readAbTests } from '../../config/abTests'
import { readMobileApps } from '../../config/mobileApps'

const apps = readMobileApps()
const tests = ref(readAbTests())
const keyword = ref('')
const activeStatus = ref('all')
const showCreateDialog = ref(false)
const form = ref(buildForm())

const statusChips = [
  { value: 'all', label: '全部' },
  ...abStatusOptions.map((item) => ({ value: item.value, label: item.label }))
]

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
    const matchKeyword = !q || `${test.name} ${test.metric} ${test.owner} ${getAppName(test.appId)}`.toLowerCase().includes(q)
    return matchStatus && matchKeyword
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

function getStatusTone (status) {
  return abStatusOptions.find((item) => item.value === status)?.tone || 'default'
}

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
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
