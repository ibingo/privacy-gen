<template>
  <div class="i18n-module-page">
    <div class="i18n-project-context-bar">
      <t-button variant="text" @click="goBackToProjects">
        <template #icon><arrow-left-icon /></template>
        文案项目
      </t-button>
      <div class="i18n-project-context-main">
        <strong>{{ i18nProjectTitle }}</strong>
        <span>{{ i18nProjectSubtitle }}</span>
      </div>
      <t-tag :theme="i18nProject?.mobileAppId ? 'success' : 'warning'" variant="light">
        {{ i18nProject?.mobileAppId ? '已绑定应用' : '手动项目' }}
      </t-tag>
    </div>
    <t-tabs class="i18n-module-tabs" :value="activeTab" @change="handleTabChange">
      <t-tab-panel v-for="tab in tabs" :key="tab.name" :value="tab.name" :label="tab.label" />
    </t-tabs>
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from 'tdesign-icons-vue-next'
import { Button as TButton, TabPanel as TTabPanel, Tabs as TTabs, Tag as TTag } from 'tdesign-vue-next'
import { getI18nProject } from '../../config/i18nProjects'
import { getI18nProjectDetailApi } from '../../api/i18nWords'

const route = useRoute()
const router = useRouter()
const i18nProjectDetail = ref(null)
const localI18nProject = computed(() => getI18nProject(route.params.projectId))
const i18nProject = computed(() => i18nProjectDetail.value || localI18nProject.value)
const i18nProjectTitle = computed(() => i18nProject.value?.name ? `${i18nProject.value.name} 文案` : '国际化文案')
const i18nProjectSubtitle = computed(() => {
  if (!i18nProject.value) return '未找到项目配置，当前展示默认文案项目。'
  if (i18nProject.value.mobileAppName) return `绑定应用：${i18nProject.value.mobileAppName} · ${i18nProject.value.packageName || '未设置包名'}`
  return i18nProject.value.packageName || '手动创建，暂未绑定移动应用'
})

const tabs = [
  { name: 'i18n-overview', label: '概览' },
  { name: 'i18n-word-list', label: '国际化文案' },
  { name: 'i18n-operation-history', label: '操作记录' },
  { name: 'i18n-word-tags', label: '标签管理' },
  { name: 'i18n-import', label: '导入' },
  { name: 'i18n-task', label: '任务' },
  { name: 'i18n-download', label: '下载' },
  { name: 'i18n-cloud-integrations', label: '云集成' },
  { name: 'i18n-settings', label: '设置' }
]

const routeTabMap = {
  'i18n-task-create': 'i18n-task',
  'i18n-cloud-integration-detail': 'i18n-cloud-integrations'
}

const activeTab = computed(() => routeTabMap[route.name] || route.name || 'i18n-overview')

onMounted(() => {
  fetchProjectDetail()
})

watch(
  () => route.params.projectId,
  () => {
    fetchProjectDetail()
  }
)

async function fetchProjectDetail () {
  if (!route.params.projectId) return
  try {
    const detail = await getI18nProjectDetailApi(route.params.projectId)
    i18nProjectDetail.value = normalizeProjectDetail(detail)
  } catch {
    i18nProjectDetail.value = null
  }
}

function normalizeProjectDetail (detail = {}) {
  const project = detail.project || detail.item || detail.detail || detail
  const fallback = localI18nProject.value || {}
  const name = project.name || project.projectName || project.label || fallback.name || ''
  const mobileAppId = project.mobileAppId || project.appId || fallback.mobileAppId || ''
  return {
    ...fallback,
    ...project,
    id: project.id || project.projectId || project.value || fallback.id || route.params.projectId,
    name,
    mobileAppId,
    mobileAppName: project.mobileAppName || project.appName || fallback.mobileAppName || '',
    packageName: project.packageName || project.bundleId || project.applicationId || fallback.packageName || '',
    sourceLocale: project.sourceLocale || project.sourceLang || fallback.sourceLocale || '',
    targetLocales: normalizeProjectLocales(project.targetLocales || project.targetLocaleCodes || project.languages || fallback.targetLocales),
    status: project.i18nProjectStatus || project.status || fallback.status || (mobileAppId ? '已绑定应用' : '手动项目')
  }
}

function normalizeProjectLocales (value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? item : item?.value || item?.locale || item?.code).filter(Boolean)
  }
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function handleTabChange (name) {
  if (name === activeTab.value) return
  router.push({ name, params: { projectId: route.params.projectId } })
}

function goBackToProjects () {
  router.push({ name: 'i18n-project-list' })
}
</script>
