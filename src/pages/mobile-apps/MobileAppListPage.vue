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

    <div class="mc-app-grid mc-app-grid-large">
      <div
        v-for="app in filteredApps"
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
          <span class="mc-tag">{{ app.platform }}</span>
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

      <div v-if="filteredApps.length === 0" class="mc-empty-state">
        <p>没有找到匹配的应用</p>
        <button class="mc-btn mc-btn-outline" @click="searchQuery = ''; activePlatform = 'all'">清除筛选</button>
      </div>
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
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>平台</label>
              <select v-model="form.platform">
                <option v-for="p in platformOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>版本号</label>
              <input v-model="form.version" type="text" placeholder="1.0.0" />
            </div>
          </div>
          <div class="mc-form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3" placeholder="输入应用描述"></textarea>
          </div>
        </div>
        <div class="mc-dialog-footer">
          <button class="mc-btn mc-btn-outline" @click="showCreateDialog = false">取消</button>
          <button class="mc-btn mc-btn-primary" @click="handleCreate">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { readMobileApps, createMobileApp, platformOptions } from '../../config/mobileApps'

const router = useRouter()
const searchQuery = ref('')
const activePlatform = ref('all')
const showCreateDialog = ref(false)
const apps = ref(readMobileApps())

const platformChips = [
  { value: 'all', label: '全部' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Android', label: 'Android' },
  { value: 'Web App', label: 'Web App' }
]

const form = ref({
  name: '',
  packageName: '',
  platform: 'iOS',
  version: '1.0.0',
  description: '',
  status: '开发中',
  statusTone: 'processing',
  buildNumber: '100',
  size: '0 MB',
  icon: 'NA',
  iconColor: '#0052d9'
})

const filteredApps = computed(() => {
  return apps.value.filter((app) => {
    const matchPlatform = activePlatform.value === 'all' || app.platform === activePlatform.value
    const query = searchQuery.value.toLowerCase()
    const matchSearch = !query || app.name.toLowerCase().includes(query) || app.packageName.toLowerCase().includes(query)
    return matchPlatform && matchSearch
  })
})

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function goToDetail (id) {
  router.push({ name: 'mobile-app-detail', params: { id } })
}

function handleCreate () {
  const iconColors = ['#0052d9', '#00a870', '#e37318', '#8b5cf6', '#e34d59']
  const newApp = createMobileApp({
    ...form.value,
    icon: form.value.name.slice(0, 2).toUpperCase(),
    iconColor: iconColors[Math.floor(Math.random() * iconColors.length)]
  })
  apps.value = readMobileApps()
  showCreateDialog.value = false
  form.value = { name: '', packageName: '', platform: 'iOS', version: '1.0.0', description: '', status: '开发中', statusTone: 'processing', buildNumber: '100', size: '0 MB', icon: 'NA', iconColor: '#0052d9' }
  router.push({ name: 'mobile-app-detail', params: { id: newApp.id } })
}
</script>
