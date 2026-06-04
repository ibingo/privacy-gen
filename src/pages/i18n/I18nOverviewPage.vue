<template>
  <div class="i18n-overview-page">
    <div class="i18n-overview-grid">
      <section class="overview-section i18n-metric-card" v-for="card in summaryCards" :key="card.key">
        <p class="i18n-metric-label">{{ card.title }}</p>
        <h3>{{ card.value }}</h3>
        <span>{{ card.description }}</span>
      </section>
    </div>

    <div class="i18n-overview-panels">
      <section class="overview-section">
        <div class="overview-header">
          <div>
            <h3>语言覆盖</h3>
            <p>查看核心语言的词条覆盖率与待翻译数量。</p>
          </div>
        </div>

        <t-loading :loading="loading" text="加载概览中...">
        <div v-if="localeRows.length" class="document-table">
          <div class="document-table-head document-table-row i18n-overview-coverage-row">
            <span>语言</span>
            <span>区域</span>
            <span>状态</span>
            <span>覆盖率</span>
            <span>待翻译</span>
          </div>

          <div v-for="item in localeRows" :key="item.id" class="document-table-row i18n-overview-coverage-row">
            <span class="document-name">{{ item.language }}</span>
            <span>{{ item.region }}</span>
            <span><span class="document-status" :class="`is-${item.statusTone}`">{{ item.status }}</span></span>
            <span>{{ item.coverage }}</span>
            <span>{{ item.pending }}</span>
          </div>
        </div>
        <div v-else class="i18n-overview-empty">暂无语言覆盖数据</div>
        </t-loading>
      </section>

      <section class="overview-section">
        <div class="overview-header">
          <div>
            <h3>最近任务</h3>
            <p>导入、校验与下载任务的最新执行情况。</p>
          </div>
        </div>

        <t-loading :loading="loading" text="加载任务中...">
        <div v-if="tasks.length" class="i18n-recent-task-list">
          <div v-for="task in tasks" :key="task.id" class="i18n-recent-task-row">
            <span class="i18n-recent-task-title">{{ task.title }}</span>
            <span class="i18n-recent-task-action">{{ task.type }}</span>
            <span class="i18n-recent-task-description">{{ task.description }}</span>
            <span class="document-status" :class="`is-${task.statusTone}`">{{ task.status }}</span>
          </div>
        </div>
        <div v-else class="i18n-overview-empty">暂无最近任务</div>
        </t-loading>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Loading as TLoading, MessagePlugin } from 'tdesign-vue-next'
import { getI18nOverviewApi } from '../../api/i18nWords'

const route = useRoute()
const loading = ref(false)
const overview = ref({
  projectId: '',
  projectName: '',
  metrics: [],
  languageCoverage: [],
  recentTasks: []
})

const summaryCards = computed(() => overview.value.metrics.map((item) => ({
  key: item.key || item.label,
  title: item.label || item.key || '',
  value: item.value ?? '0',
  description: item.description || ''
})))

const localeRows = computed(() => overview.value.languageCoverage.map((item) => ({
  id: item.locale,
  language: item.name || item.locale,
  region: item.region || '-',
  status: item.status || '-',
  statusTone: normalizeStatusTone(item.statusTone || item.status),
  coverage: item.coverage || '0%',
  pending: String(item.pendingCount ?? 0)
})))

const tasks = computed(() => overview.value.recentTasks.map((item) => ({
  id: item.id || item.title,
  title: item.title || '-',
  type: item.action || '-',
  description: item.description || '',
  status: item.status || '-',
  statusTone: normalizeStatusTone(item.statusTone || item.status),
  updatedAt: formatDateTime(item.updatedAt)
})))

onMounted(() => {
  fetchOverview()
})

watch(
  () => route.params.projectId,
  () => {
    fetchOverview()
  }
)

async function fetchOverview () {
  if (!route.params.projectId) return
  loading.value = true
  try {
    const data = await getI18nOverviewApi(route.params.projectId)
    overview.value = normalizeOverview(data)
  } catch (error) {
    overview.value = normalizeOverview()
    MessagePlugin.error(error.message || '概览数据加载失败')
  } finally {
    loading.value = false
  }
}

function normalizeOverview (data = {}) {
  return {
    projectId: data.projectId || route.params.projectId || '',
    projectName: data.projectName || '',
    metrics: Array.isArray(data.metrics) ? data.metrics : [],
    languageCoverage: Array.isArray(data.languageCoverage) ? data.languageCoverage : [],
    recentTasks: Array.isArray(data.recentTasks) ? data.recentTasks : []
  }
}

function normalizeStatusTone (value = '') {
  const text = String(value || '').toLowerCase()
  if (['success', 'warning', 'processing', 'danger', 'default'].includes(text)) return text
  if (String(value).includes('完成') || String(value).includes('启用')) return 'success'
  if (String(value).includes('待') || String(value).includes('审核')) return 'warning'
  if (String(value).includes('处理')) return 'processing'
  return 'default'
}

function formatDateTime (value) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}
</script>
