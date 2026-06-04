<template>
  <div class="mobile-center-page">
    <div class="mc-list-toolbar">
      <div class="mc-toolbar-left">
        <div class="mc-search-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input v-model="searchQuery" type="text" placeholder="搜索应用名称、包名..." />
        </div>
        <div class="mc-filter-chips">
          <button
            v-for="chip in platformChips"
            :key="chip.value"
            class="mc-chip"
            :class="{ 'mc-chip-active': activePlatform === chip.value }"
            @click="activePlatform = chip.value"
          >{{ chip.label }}</button>
        </div>
      </div>
      <button class="mc-btn mc-btn-primary" @click="showCreateDialog = true">
        <span>+</span> 新建应用
      </button>
    </div>

    <div v-if="loading" class="mc-empty-state mobile-app-list-state">
      <p>应用加载中...</p>
    </div>

    <div v-else class="mc-app-grid mc-app-grid-large">
      <div
        v-for="app in pagedApps"
        :key="app.id"
        class="mc-app-card mc-app-card-hover"
        @click="goToDetail(app.id)"
      >
        <div class="mc-app-card-header">
          <span class="mc-app-icon mc-app-icon-lg" :style="{ background: app.iconColor }">
            <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
            <span v-else>{{ app.icon }}</span>
          </span>
          <div class="mc-app-card-actions">
            <span class="mc-app-status" :class="`mc-status-${app.statusTone}`">{{ app.status }}</span>
          </div>
        </div>
        <h4 class="mc-app-name">{{ app.name }}</h4>
        <p class="mc-app-package">{{ app.packageName }}</p>
        <div class="mc-app-tags">
          <span v-for="platform in app.platforms || [app.platform]" :key="platform" class="mc-tag">{{ formatPlatform(platform) }}</span>
          <span class="mc-tag">v{{ app.version }}</span>
          <span class="mc-tag">{{ app.size }}</span>
        </div>
        <p class="mc-app-desc">{{ app.description }}</p>
        <div class="mc-app-footer">
          <div class="mc-app-stats-row">
            <span>{{ formatNumber(app.downloads) }} 下载</span>
            <span v-if="app.rating">{{ app.rating }} 分</span>
          </div>
          <span class="mc-app-date">更新于 {{ app.lastUpdated }}</span>
        </div>
      </div>

      <div v-if="apps.length === 0" class="mc-empty-state">
        <p>没有找到匹配的应用</p>
        <button class="mc-btn mc-btn-outline" @click="clearFilters">清除筛选</button>
      </div>
    </div>

    <div v-if="total > 0" class="starter-list-pagination mobile-app-card-pagination">
      <t-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :total-content="true"
        :page-size-options="[6, 12, 20, 24]"
        :show-jumper="false"
        :show-page-size="true"
      />
    </div>

    <div v-if="showCreateDialog" class="mc-dialog-overlay" @click.self="showCreateDialog = false">
      <div class="mc-dialog">
        <div class="mc-dialog-header">
          <h3>新建移动应用</h3>
          <button class="mc-dialog-close" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-form-group">
            <label>应用名称</label>
            <input v-model="form.name" type="text" placeholder="输入应用名称" />
          </div>
          <div class="mc-form-group">
            <label>包名</label>
            <input v-model="form.packageName" type="text" placeholder="com.example.app" />
          </div>
          <label class="mc-check-row">
            <input v-model="form.isMultiPlatform" type="checkbox" />
            <span>多端 App</span>
          </label>
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>{{ form.isMultiPlatform ? '目标平台' : '平台' }}</label>
              <select v-if="!form.isMultiPlatform" v-model="form.platform">
                <option v-for="p in platformOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
              <div v-else class="mc-platform-checks">
                <label v-for="p in platformOptions" :key="p.value">
                  <input v-model="form.platforms" type="checkbox" :value="p.value" />
                  <span>{{ p.label }}</span>
                </label>
              </div>
            </div>
            <div class="mc-form-group">
              <label>版本号</label>
              <input v-model="form.version" type="text" placeholder="1.0.0" />
            </div>
          </div>
          <div class="mc-package-preview">
            <span>包名预览</span>
            <code v-for="name in packagePreview" :key="name">{{ name }}</code>
          </div>
          <div class="mc-form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3" placeholder="输入应用描述"></textarea>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" :disabled="creating" @click="showCreateDialog = false">取消</button>
          <button class="mc-btn mc-btn-primary" :disabled="creating" @click="handleCreate">{{ creating ? '创建中...' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin, Pagination as TPagination } from 'tdesign-vue-next'
import { createMobileAppApi, listMobileAppsApi } from '../../api/mobileApps'
import { createMobileApp, createMultiPlatformMobileApp, readMobileApps, writeMobileApps } from '../../config/mobileApps'
import { defaultProjectValue, PROJECT_STORAGE_KEY } from '../../config/projects'

const router = useRouter()
const projectValue = ref(getSelectedProjectValue())
const searchQuery = ref('')
const activePlatform = ref('all')
const showCreateDialog = ref(false)
const creating = ref(false)
const loading = ref(false)
const apps = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(6)

const platformChips = [
  { value: 'all', label: '全部' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web-app', label: 'Web App' },
  { value: 'harmonyos', label: 'HarmonyOS' }
]

const platformOptions = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web-app', label: 'Web App' },
  { value: 'harmonyos', label: 'HarmonyOS' }
]

const platformLabelMap = platformOptions.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const form = ref({
  name: '',
  packageName: '',
  isMultiPlatform: false,
  platform: 'ios',
  platforms: ['ios', 'android'],
  version: '1.0.0',
  description: '',
  status: '开发中',
  statusTone: 'processing',
  buildNumber: '100',
  size: '0 MB',
  icon: 'NA',
  iconColor: '#0052d9'
})

const packagePreview = computed(() => {
  const basePackageName = form.value.packageName || 'com.example.app'
  if (!form.value.isMultiPlatform) return [basePackageName]
  return form.value.platforms.map((platform) => buildPackageName(basePackageName, platform))
})

const pagedApps = computed(() => apps.value)

watch([searchQuery, activePlatform], () => {
  currentPage.value = 1
  fetchApps()
})

watch([currentPage, pageSize], () => {
  fetchApps()
})

onMounted(() => {
  fetchApps()
})

async function fetchApps () {
  loading.value = true
  projectValue.value = getSelectedProjectValue()
  try {
    const result = await listMobileAppsApi({
      projectValue: projectValue.value.trim(),
      keyword: searchQuery.value.trim(),
      platform: activePlatform.value === 'all' ? '' : activePlatform.value,
      status: '',
      page: currentPage.value,
      pageSize: pageSize.value
    })
    apps.value = normalizeListItems(result?.items || [])
    syncFetchedApps(apps.value)
    total.value = Number(result?.total || 0)
    if (result?.page && result.page !== currentPage.value) currentPage.value = result.page
    if (result?.pageSize && result.pageSize !== pageSize.value) pageSize.value = result.pageSize
  } catch (error) {
    MessagePlugin.error(error.message || '应用列表加载失败')
    apps.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function getSelectedProjectValue () {
  return localStorage.getItem(PROJECT_STORAGE_KEY) || defaultProjectValue || ''
}

function normalizeListItems (items) {
  return items.map((app) => ({
    ...app,
    projectValue: app.projectValue || projectValue.value.trim(),
    platform: normalizePlatformValue(app.platform),
    icon: app.icon || String(app.name || '').slice(0, 2).toUpperCase() || 'APP',
    iconColor: app.iconColor || '#0052d9',
    status: app.status || '开发中',
    statusTone: app.statusTone || 'processing',
    size: app.size || '0 MB',
    downloads: app.downloads || 0,
    rating: app.rating || 0,
    lastUpdated: app.lastUpdated || app.createdAt || ''
  }))
}

function normalizePlatformValue (platform) {
  const value = String(platform || '')
  return platformLabelMap[value] ? value : platformOptions.find((option) => option.label === value)?.value || value
}

function syncFetchedApps (items) {
  if (!items.length) return
  const cachedApps = readMobileApps()
  const cacheMap = new Map(cachedApps.map((app) => [app.id, app]))
  items.forEach((app) => {
    cacheMap.set(app.id, {
      environments: [],
      features: [],
      team: '',
      buildNumber: '100',
      createdAt: app.lastUpdated || '',
      ...cacheMap.get(app.id),
      ...app,
      platform: formatPlatform(app.platform)
    })
  })
  writeMobileApps([...cacheMap.values()])
}

function formatPlatform (platform) {
  return platformLabelMap[platform] || platform
}

function clearFilters () {
  searchQuery.value = ''
  activePlatform.value = 'all'
}

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function goToDetail (id) {
  const target = apps.value.find((app) => app.id === id)
  if (target?.multiPlatform || target?.type === 'multi') {
    router.push({ name: 'mobile-app-platforms', params: { id } })
    return
  }
  router.push({ name: 'mobile-app-detail', params: { id: target?.apps?.[0]?.id || id } })
}

async function handleCreate () {
  projectValue.value = getSelectedProjectValue()
  if (!projectValue.value.trim() || !form.value.name.trim() || !form.value.packageName.trim()) {
    MessagePlugin.warning('请先选择项目，并填写应用名称和包名')
    return
  }
  if (form.value.isMultiPlatform && form.value.platforms.length === 0) {
    MessagePlugin.warning('请至少选择一个目标平台')
    return
  }

  creating.value = true
  try {
    const payload = buildCreatePayload()
    const result = await createMobileAppApi(payload)
    const created = syncCreatedApp(payload, result)
    currentPage.value = 1
    await fetchApps()
    resetForm()
    MessagePlugin.success('应用已创建')
    if (created?.type === 'multi') {
      router.push({ name: 'mobile-app-platforms', params: { id: created.id } })
      return
    }
    if (created?.id) router.push({ name: 'mobile-app-detail', params: { id: created.id } })
  } catch (error) {
    MessagePlugin.error(error.message || '创建失败')
  } finally {
    creating.value = false
  }
}

function buildCreatePayload () {
  const basePayload = {
    projectValue: projectValue.value.trim(),
    name: form.value.name.trim(),
    packageName: form.value.packageName.trim(),
    multiPlatform: form.value.isMultiPlatform,
    version: form.value.version.trim(),
    description: form.value.description.trim()
  }
  if (form.value.isMultiPlatform) {
    return {
      ...basePayload,
      platforms: [...form.value.platforms]
    }
  }
  return {
    ...basePayload,
    platform: form.value.platform
  }
}

function syncCreatedApp (payload, result) {
  const iconColors = ['#0052d9', '#00a870', '#e37318', '#8b5cf6', '#e34d59']
  const common = {
    projectValue: payload.projectValue,
    name: payload.name,
    packageName: payload.packageName,
    version: payload.version,
    description: payload.description,
    status: '开发中',
    statusTone: 'processing',
    buildNumber: '100',
    size: '0 MB',
    icon: payload.name.slice(0, 2).toUpperCase(),
    iconColor: iconColors[Math.floor(Math.random() * iconColors.length)]
  }

  if (payload.multiPlatform) {
    const group = createMultiPlatformMobileApp({
      ...common,
      platforms: payload.platforms.map((platform) => platformLabelMap[platform] || platform)
    })
    return { type: 'multi', id: result?.id || result?.groupId || group.id }
  }

  const newApp = createMobileApp({
    ...common,
    id: result?.id || undefined,
    platform: platformLabelMap[payload.platform] || payload.platform
  })
  return { type: 'single', id: result?.id || newApp.id }
}
function resetForm () {
  showCreateDialog.value = false
  form.value = { name: '', packageName: '', isMultiPlatform: false, platform: 'ios', platforms: ['ios', 'android'], version: '1.0.0', description: '', status: '开发中', statusTone: 'processing', buildNumber: '100', size: '0 MB', icon: 'NA', iconColor: '#0052d9' }
}

function buildPackageName (base, platform) {
  const suffix = String(platform || '').toLowerCase().replace(/\s+/g, '-')
  return `${base || 'com.example.app'}.${suffix}`
}
</script>
