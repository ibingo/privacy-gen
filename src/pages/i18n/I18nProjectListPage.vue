<template>
  <div class="mobile-center-page i18n-project-page">
    <div class="mc-list-toolbar">
      <div class="mc-toolbar-left">
        <div class="mc-search-box">
          <search-icon />
          <input v-model="keyword" type="text" placeholder="搜索文案项目、应用或包名..." />
        </div>
        <div class="mc-filter-chips">
          <button
            v-for="chip in statusChips"
            :key="chip.value"
            class="mc-chip"
            :class="{ 'mc-chip-active': activeStatus === chip.value }"
            @click="activeStatus = chip.value"
          >
            {{ chip.label }}
          </button>
        </div>
      </div>
      <button class="mc-btn mc-btn-primary" @click="openCreateDialog">
        <add-icon />
        新建文案项目
      </button>
    </div>

    <div v-if="projectsLoading" class="mc-app-grid mc-app-grid-large">
      <div v-for="index in 6" :key="index" class="mc-app-card i18n-project-card is-loading"></div>
    </div>

    <div v-else class="mc-app-grid mc-app-grid-large">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="mc-app-card mc-app-card-hover i18n-project-card"
        @click="goToProject(project.id)"
      >
        <div class="mc-app-card-header">
          <span class="mc-app-icon mc-app-icon-lg" :style="{ background: project.iconColor }">
            {{ project.icon }}
          </span>
          <div class="mc-app-card-actions">
            <button
              v-if="!project.mobileAppId"
              class="i18n-project-link-button"
              @click.stop="openBindDialog(project)"
            >
              绑定
            </button>
            <span class="mc-app-status" :class="`mc-status-${project.statusTone}`">{{ project.status }}</span>
          </div>
        </div>
        <h4 class="mc-app-name">{{ project.name }}</h4>
        <p class="mc-app-package">{{ project.packageName || '未绑定应用包名' }}</p>
        <div class="mc-app-tags">
          <span v-for="platform in project.platforms" :key="platform" class="mc-tag">{{ platform }}</span>
          <span class="mc-tag">{{ project.sourceLocale }}</span>
          <span class="mc-tag">{{ project.targetLocales.length }} 个目标语种</span>
        </div>
        <p class="mc-app-desc">{{ project.description }}</p>
        <div class="i18n-project-metrics">
          <span><strong>{{ formatNumber(project.wordCount) }}</strong> 词条</span>
          <span><strong>{{ project.coverage }}</strong> 覆盖率</span>
          <span><strong>{{ project.pendingCount }}</strong> 待处理</span>
        </div>
        <div class="mc-app-footer">
          <div class="mc-app-stats-row">
            <span>{{ project.mobileAppName || '手动项目' }}</span>
          </div>
          <span class="mc-app-date">更新于 {{ project.lastUpdated }}</span>
        </div>
      </div>

      <div v-if="filteredProjects.length === 0" class="mc-empty-state">
        <p>没有找到匹配的文案项目</p>
        <button class="mc-btn mc-btn-outline" @click="clearFilters">清除筛选</button>
      </div>
    </div>

    <t-dialog
      v-model:visible="showCreateDialog"
      header="新建文案项目"
      width="920px"
      confirm-btn="创建"
      :close-on-overlay-click="false"
      @confirm="handleCreate"
      @cancel="closeCreateDialog"
      @close="closeCreateDialog"
    >
      <t-form class="i18n-project-create-form" :data="form" label-align="top">
        <t-form-item label="项目名称" required-mark>
          <t-input v-model="form.name" clearable placeholder="输入文案项目名称" />
        </t-form-item>

        <t-form-item label="绑定应用">
          <t-select
            v-model="form.mobileAppId"
            :loading="appsLoading"
            :popup-props="{ overlayClassName: 'i18n-project-app-select-popup' }"
            clearable
            filterable
            placeholder="暂不绑定，稍后再选"
            @change="syncSelectedApp"
            @clear="clearSelectedApp"
          >
            <t-option
              v-for="option in mobileAppSelectOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            >
              <div class="i18n-project-app-option">
                <span class="i18n-project-app-option__icon" :style="{ background: option.app.iconColor }">
                  {{ option.app.icon }}
                </span>
                <div class="i18n-project-app-option__content">
                  <strong>{{ option.app.name }}</strong>
                  <p>{{ option.app.packageName || option.app.platform || '未设置包名' }}</p>
                </div>
              </div>
            </t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="源语种" required-mark>
          <t-select v-model="form.sourceLocale" :loading="languagesLoading" filterable placeholder="请选择源语种">
            <t-option
              v-for="locale in localeOptions"
              :key="locale.value"
              :value="locale.value"
              :label="locale.label"
            >
              <div class="i18n-project-locale-option">
                <span>{{ locale.label }}</span>
                <div class="i18n-project-locale-option-tags">
                  <t-tag variant="light" size="small">{{ locale.value }}</t-tag>
                  <t-tag v-if="locale.locale" variant="light" size="small">{{ locale.locale }}</t-tag>
                </div>
              </div>
            </t-option>
          </t-select>
        </t-form-item>

        <t-form-item label="目标语种" required-mark>
          <div class="i18n-project-transfer-block">
            <t-transfer
              v-model="form.targetLocales"
              :data="transferLocaleOptions"
              :search="true"
              :title="['可选语种', '目标语种']"
              :operation="['移除', '添加']"
              :show-check-all="[true, true]"
              target-sort="original"
              class="i18n-project-transfer"
            >
              <template #transferItem="{ data }">
                <div class="i18n-project-transfer-item">
                  <span class="i18n-project-transfer-item__label">{{ data.label }}</span>
                  <span class="i18n-project-transfer-item__meta">
                    {{ data.value }}<template v-if="data.locale"> · {{ data.locale }}</template>
                  </span>
                </div>
              </template>
            </t-transfer>
            <div class="i18n-project-transfer-hint">
              源语种不会出现在可选列表中，切换源语种后会自动移除同名目标语种。
            </div>
          </div>
        </t-form-item>

        <t-form-item label="描述">
          <t-input
            v-model="form.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            placeholder="说明这个文案项目维护的应用或业务范围"
          />
        </t-form-item>
      </t-form>
    </t-dialog>

    <div v-if="showBindDialog" class="mc-dialog-overlay" @click.self="closeBindDialog">
      <div class="mc-dialog i18n-project-dialog">
        <div class="mc-dialog-header">
          <h3>绑定应用</h3>
          <button class="mc-dialog-close" @click="closeBindDialog">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-form-group">
            <label>文案项目</label>
            <input :value="bindingProject?.name" type="text" disabled />
          </div>
          <div class="mc-form-group">
            <label>绑定应用</label>
            <t-select
              v-model="bindForm.mobileAppId"
              :loading="appsLoading"
              :popup-props="{ overlayClassName: 'i18n-project-app-select-popup' }"
              clearable
              filterable
              placeholder="请选择应用"
              @clear="clearBindSelectedApp"
            >
              <t-option
                v-for="option in mobileAppSelectOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              >
                <div class="i18n-project-app-option">
                  <span class="i18n-project-app-option__icon" :style="{ background: option.app.iconColor }">
                    {{ option.app.icon }}
                  </span>
                  <div class="i18n-project-app-option__content">
                    <strong>{{ option.app.name }}</strong>
                    <p>{{ option.app.packageName || option.app.platform || '未设置包名' }}</p>
                  </div>
                </div>
              </t-option>
            </t-select>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="closeBindDialog">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleBind">绑定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import {
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Tag as TTag,
  Transfer as TTransfer
} from 'tdesign-vue-next'
import { listMobileAppsApi } from '../../api/mobileApps'
import { createI18nProjectApi, listI18nProjectsApi } from '../../api/i18nWords'
import { useI18nLanguages } from '../../composables/useI18nLanguages'
import { defaultProjectValue, PROJECT_STORAGE_KEY } from '../../config/projects'
import { readI18nProjects, updateI18nProject, writeI18nProjects } from '../../config/i18nProjects'
import { readI18nSettings } from '../../config/i18nSettings'

const router = useRouter()
const keyword = ref('')
const activeStatus = ref('all')
const projects = ref([])
const projectsLoading = ref(false)
const mobileAppOptions = ref([])
const appsLoading = ref(false)
const showCreateDialog = ref(false)
const showBindDialog = ref(false)
const bindingProject = ref(null)
const bindForm = ref({ mobileAppId: '' })
const i18nSettings = readI18nSettings()
const {
  languageOptions,
  loading: languagesLoading,
  loadLanguages
} = useI18nLanguages()

const statusChips = [
  { value: 'all', label: '全部' },
  { value: 'bound', label: '已绑定' },
  { value: 'manual', label: '未绑定' }
]

const platformLabelMap = {
  ios: 'iOS',
  android: 'Android',
  'web-app': 'Web App',
  harmonyos: 'HarmonyOS'
}

const form = ref(createEmptyForm())
const localeOptions = computed(() => languageOptions.value)
const mobileAppMap = computed(() => {
  return mobileAppOptions.value.reduce((map, app) => {
    map.set(app.id, {
      ...app,
      mobileAppName: formatMobileAppLabel(app)
    })
    return map
  }, new Map())
})
const mobileAppSelectOptions = computed(() => {
  return mobileAppOptions.value.map((app) => ({
    value: app.id,
    label: formatMobileAppLabel(app),
    app
  }))
})
const transferLocaleOptions = computed(() => {
  return localeOptions.value
    .filter((locale) => locale.value !== form.value.sourceLocale)
    .map((locale) => ({
      value: locale.value,
      label: locale.label,
      locale: locale.locale
    }))
})
const selectedMobileApp = computed(() => mobileAppMap.value.get(form.value.mobileAppId) || null)
const selectedBindMobileApp = computed(() => mobileAppMap.value.get(bindForm.value.mobileAppId) || null)

const filteredProjects = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return projects.value.filter((project) => {
    const searchableText = [
      project.name,
      project.mobileAppName,
      project.packageName,
      project.description,
      ...(project.platforms || [])
    ].join(' ').toLowerCase()
    const matchesKeyword = !q || searchableText.includes(q)
    const matchesStatus = activeStatus.value === 'all'
      || (activeStatus.value === 'bound' && project.mobileAppId)
      || (activeStatus.value === 'manual' && !project.mobileAppId)
    return matchesKeyword && matchesStatus
  })
})

onMounted(() => {
  fetchProjects()
  fetchMobileApps()
})

let projectSearchTimer = 0

watch(keyword, () => {
  window.clearTimeout(projectSearchTimer)
  projectSearchTimer = window.setTimeout(() => {
    fetchProjects()
  }, 300)
})

function createEmptyForm () {
  return {
    mobileAppId: '',
    name: '',
    sourceLocale: i18nSettings.sourceLocale,
    targetLocales: [],
    description: ''
  }
}

async function openCreateDialog () {
  form.value = createEmptyForm()
  await loadLanguages().catch((error) => {
    MessagePlugin.error(error.message || '语种数据加载失败')
  })
  showCreateDialog.value = true
  await fetchMobileApps()
}

function closeCreateDialog () {
  showCreateDialog.value = false
}

async function openBindDialog (project) {
  bindingProject.value = project
  bindForm.value = { mobileAppId: '' }
  showBindDialog.value = true
  await fetchMobileApps()
}

async function fetchProjects () {
  projectsLoading.value = true
  try {
    const data = await listI18nProjectsApi(keyword.value.trim() ? { keyword: keyword.value.trim() } : undefined)
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const normalizedProjects = items.map(normalizeProject).filter((project) => project.id)
    projects.value = normalizedProjects
    writeI18nProjects(normalizedProjects)
  } catch (error) {
    projects.value = readI18nProjects()
    MessagePlugin.error(error.message || '文案项目加载失败')
  } finally {
    projectsLoading.value = false
  }
}

function closeBindDialog () {
  showBindDialog.value = false
  bindingProject.value = null
}

function syncSelectedApp () {
  const app = selectedMobileApp.value
  if (!app) return
  form.value.name = form.value.name || app.name
}

function clearSelectedApp () {
  form.value.mobileAppId = ''
}

function clearBindSelectedApp () {
  bindForm.value.mobileAppId = ''
}

function getSelectedProjectValue () {
  return localStorage.getItem(PROJECT_STORAGE_KEY) || defaultProjectValue || ''
}

function normalizePlatformValue (platform = '') {
  const value = String(platform || '').trim()
  if (!value) return ''
  const lowerValue = value.toLowerCase()
  return platformLabelMap[lowerValue] || platformLabelMap[value] || value
}

function normalizeMobileApp (app = {}) {
  const name = app.name || app.appName || app.label || ''
  return {
    ...app,
    id: app.id || app.appId || app.value || '',
    name,
    platform: normalizePlatformValue(app.platform || app.applicableTerminal || ''),
    packageName: app.packageName || app.bundleId || app.applicationId || '',
    description: app.description || '',
    icon: app.icon || String(name || 'APP').slice(0, 2).toUpperCase() || 'APP',
    iconColor: app.iconColor || '#0052d9',
    status: app.status || '',
    statusTone: app.statusTone || '',
    lastUpdated: app.lastUpdated || app.createdAt || ''
  }
}

function normalizeProject (project = {}) {
  const value = project.value || project.projectValue || project.id || project.projectId || ''
  const name = project.name || project.projectName || project.label || '未命名文案项目'
  const mobileAppId = project.mobileAppId || project.appId || ''
  const platforms = normalizePlatforms(project.platforms || project.platform || project.applicableTerminal)
  const targetLocales = normalizeLocales(project.targetLocales || project.targetLocaleCodes || project.languages)
  const wordCount = Number(project.wordCount ?? project.wordCount ?? project.i18nWordCount ?? 0)
  const pendingCount = Number(project.pendingCount ?? project.untranslatedCount ?? project.todoCount ?? 0)

  return {
    id: value,
    value,
    name,
    mobileAppId,
    mobileAppName: project.mobileAppName || project.appName || '',
    packageName: project.packageName || project.bundleId || project.applicationId || '',
    platforms,
    description: project.description || '维护应用文案 Key、源文案和多语言翻译。',
    sourceLocale: project.sourceLocale || project.sourceLang || i18nSettings.sourceLocale,
    targetLocales: targetLocales.length ? targetLocales : [...i18nSettings.targetLocales],
    wordCount,
    pendingCount,
    coverage: formatCoverage(project.coverage ?? project.coverageRate),
    status: project.i18nProjectStatus || project.status || (mobileAppId ? '已绑定' : '未绑定'),
    statusTone: normalizeProjectStatusTone(project.statusTone || project.status),
    icon: project.icon || project.shortName || String(name).slice(0, 2).toUpperCase(),
    iconColor: project.iconColor || '#0052d9',
    lastUpdated: formatProjectDate(project.lastUpdated || project.updatedAt || project.updateTime || project.createdAt)
  }
}

function normalizePlatforms (value) {
  if (Array.isArray(value)) return value.map(normalizePlatformValue).filter(Boolean)
  if (!value) return []
  return String(value).split(/[,;|]/).map(normalizePlatformValue).filter(Boolean)
}

function normalizeLocales (value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? item : item?.value || item?.locale || item?.code).filter(Boolean)
  }
  if (!value) return []
  return String(value).split(/[,;|]/).map((item) => item.trim()).filter(Boolean)
}

function normalizeProjectStatusTone (value = '') {
  const rawText = String(value || '')
  const text = rawText.toLowerCase()
  if (['warning', 'pending'].includes(text) || rawText.includes('未')) return 'warning'
  if (['danger', 'error', 'inactive', 'disabled'].includes(text) || rawText.includes('停用')) return 'danger'
  if (['success', 'active', 'enabled'].includes(text) || rawText.includes('启用') || rawText.includes('绑定')) return 'success'
  return 'success'
}

function formatCoverage (value) {
  if (value === null || value === undefined || value === '') return '0%'
  if (typeof value === 'number') return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`
  const text = String(value)
  return text.includes('%') ? text : `${text}%`
}

function formatProjectDate (value) {
  return value ? String(value).replace('T', ' ').slice(0, 10) : new Date().toISOString().slice(0, 10)
}

async function fetchMobileApps () {
  appsLoading.value = true
  try {
    const result = await listMobileAppsApi({
      projectValue: getSelectedProjectValue(),
      keyword: '',
      platform: '',
      status: '',
      page: 1,
      pageSize: 200
    })
    const items = Array.isArray(result?.items) ? result.items : []
    mobileAppOptions.value = items
      .map((item) => normalizeMobileApp(item))
      .filter((app) => app.id)
      .sort((a, b) => formatMobileAppLabel(a).localeCompare(formatMobileAppLabel(b), 'zh-CN'))
      .filter(Boolean)

    if (form.value.mobileAppId && !mobileAppMap.value.has(form.value.mobileAppId)) {
      form.value.mobileAppId = ''
    }
    if (bindForm.value.mobileAppId && !mobileAppMap.value.has(bindForm.value.mobileAppId)) {
      bindForm.value.mobileAppId = ''
    }
  } catch (error) {
    mobileAppOptions.value = []
    MessagePlugin.error(error.message || '应用数据加载失败')
  } finally {
    appsLoading.value = false
  }
}

watch(() => form.value.sourceLocale, (sourceLocale) => {
  form.value.targetLocales = form.value.targetLocales.filter((locale) => locale !== sourceLocale)
})

async function handleCreate () {
  const app = selectedMobileApp.value
  if (!form.value.name.trim()) {
    MessagePlugin.warning('请填写项目名称')
    return
  }
  if (!form.value.targetLocales.length) {
    MessagePlugin.warning('请选择至少一个目标语种')
    return
  }

  try {
    const created = await createI18nProjectApi({
      name: form.value.name.trim(),
      mobileAppId: app?.id || null,
      sourceLocale: form.value.sourceLocale,
      targetLocales: [...form.value.targetLocales]
    })
    closeCreateDialog()
    await fetchProjects()
    MessagePlugin.success('文案项目已创建')
    const createdProject = normalizeProject(created || {})
    const createdProjectId = createdProject.id || projects.value.find((project) => project.name === form.value.name.trim())?.id
    if (createdProjectId) {
      goToProject(createdProjectId)
    }
  } catch (error) {
    MessagePlugin.error(error.message || '文案项目创建失败')
  }
}

function handleBind () {
  const app = selectedBindMobileApp.value
  if (!bindingProject.value || !app) {
    MessagePlugin.warning('请选择要绑定的应用')
    return
  }

  updateI18nProject(bindingProject.value.id, {
    mobileAppId: app.id,
    mobileAppName: app.mobileAppName || '',
    packageName: bindingProject.value.packageName || app.apps?.[0]?.packageName || app.packageName || '',
    platforms: app.platforms?.length ? app.platforms : [app.platform].filter(Boolean),
    status: '已绑定',
    statusTone: 'success',
    icon: app.icon || bindingProject.value.icon,
    iconColor: app.iconColor || bindingProject.value.iconColor
  })
  projects.value = readI18nProjects()
  closeBindDialog()
  MessagePlugin.success('应用已绑定')
}

function goToProject (projectId) {
  router.push({ name: 'i18n-word-list', params: { projectId } })
}

function clearFilters () {
  keyword.value = ''
  activeStatus.value = 'all'
}

function formatNumber (value) {
  const n = Number(value || 0)
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatMobileAppLabel (app) {
  return app.packageName
    ? `${app.name} · ${app.packageName}`
    : app.name
}

</script>

<style scoped>
.i18n-project-card {
  min-height: 268px;
}

.i18n-project-card.is-loading {
  position: relative;
  overflow: hidden;
  cursor: default;
  background:
    linear-gradient(90deg, #f2f4f7 25%, #e7eaf0 37%, #f2f4f7 63%) 20px 20px / 180px 18px no-repeat,
    linear-gradient(90deg, #f2f4f7 25%, #e7eaf0 37%, #f2f4f7 63%) 20px 62px / 220px 18px no-repeat,
    linear-gradient(90deg, #f2f4f7 25%, #e7eaf0 37%, #f2f4f7 63%) 20px 106px / 80% 14px no-repeat,
    linear-gradient(90deg, #f2f4f7 25%, #e7eaf0 37%, #f2f4f7 63%) 20px 152px / 70% 44px no-repeat,
    #ffffff;
  background-size: 180px 18px, 220px 18px, 80% 14px, 70% 44px, auto;
  animation: i18n-project-loading 1.3s ease-in-out infinite;
}

@keyframes i18n-project-loading {
  0% {
    opacity: 0.72;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.72;
  }
}

.i18n-project-card :deep(.mc-app-card-actions) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.i18n-project-link-button {
  border: 0;
  background: transparent;
  color: #0052d9;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  padding: 2px 4px;
}

.i18n-project-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.i18n-project-metrics span {
  padding: 8px;
  border-radius: 8px;
  background: #f8fafc;
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
}

.i18n-project-metrics strong {
  display: block;
  color: #111827;
  font-size: 15px;
  line-height: 22px;
}

.i18n-project-dialog {
  width: 640px;
}

.i18n-project-create-form {
  padding-top: 8px;
}

.i18n-project-create-form :deep(.t-form__item) {
  margin-bottom: 20px;
}

.i18n-project-binding-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e7eaf0;
  border-radius: 10px;
  background: #f8fafc;
}

.i18n-project-binding-preview strong {
  color: #111827;
  font-size: 14px;
  line-height: 22px;
}

.i18n-project-binding-preview p {
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
  margin-top: 2px;
}

:global(.i18n-project-app-select-popup .t-select-option) {
  height: auto;
  min-height: 64px;
  padding: 8px 12px;
}

:global(.i18n-project-app-select-popup .t-select-option > span) {
  width: 100%;
}

.i18n-project-app-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.i18n-project-app-option__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.i18n-project-app-option__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.i18n-project-app-option__content strong {
  color: #111827;
  font-size: 14px;
  line-height: 22px;
}

.i18n-project-app-option__content p {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
}

.i18n-project-locale-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.i18n-project-locale-option-tags {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.i18n-project-transfer-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.i18n-project-transfer {
  width: 100%;
}

.i18n-project-transfer :deep(.t-transfer) {
  width: 100%;
  gap: 16px;
}

.i18n-project-transfer :deep(.t-transfer__list) {
  width: calc((100% - 112px) / 2);
  max-width: none;
  border-radius: 12px;
}

.i18n-project-transfer-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.i18n-project-transfer-item__label {
  color: #111827;
  line-height: 20px;
}

.i18n-project-transfer-item__meta {
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
}

.i18n-project-transfer-hint {
  color: #6b7280;
  font-size: 12px;
  line-height: 20px;
  padding: 0 2px;
}

.i18n-project-transfer :deep(.t-transfer__list-item) {
  min-height: 56px;
  padding: 10px 12px;
  border-radius: 10px;
}

.i18n-project-transfer :deep(.t-transfer__list-item .t-checkbox__label) {
  margin-left: 12px;
}

.i18n-project-transfer :deep(.t-transfer__list-wrapper) {
  padding: 16px;
}

.i18n-project-transfer :deep(.t-transfer__operations) {
  width: 80px;
  gap: 12px;
}

.i18n-project-transfer :deep(.t-transfer__operations .t-button) {
  min-width: 80px;
  padding: 0 12px;
}

@media (max-width: 768px) {
  .i18n-project-metrics {
    grid-template-columns: 1fr;
  }

  .i18n-project-transfer :deep(.t-transfer) {
    flex-direction: column;
    gap: 12px;
  }

  .i18n-project-transfer :deep(.t-transfer__list) {
    width: 100%;
  }

  .i18n-project-transfer :deep(.t-transfer__operations) {
    width: 100%;
    flex-direction: row;
    justify-content: center;
  }
}
</style>
