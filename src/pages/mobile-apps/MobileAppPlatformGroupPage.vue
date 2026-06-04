<template>
  <div class="mobile-center-page" v-if="loading">
    <div class="mc-empty-state">
      <p>多端应用加载中...</p>
    </div>
  </div>

  <div class="mobile-center-page" v-else-if="group">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-list' })">
      &larr; 返回应用列表
    </button>

    <div class="mc-detail-hero">
      <div class="mc-detail-hero-left">
        <span class="mc-app-icon mc-app-icon-xl" :style="{ background: group.iconColor }">
          <span>{{ group.icon }}</span>
        </span>
        <div class="mc-detail-hero-info">
          <div class="mc-detail-title-row">
            <h1>{{ group.name }}</h1>
            <span class="mc-app-status mc-app-status-lg" :class="`mc-status-${group.statusTone}`">{{ group.status }}</span>
          </div>
          <p class="mc-detail-package">多端 App · {{ group.platforms.join(' / ') }}</p>
          <div class="mc-detail-tags">
            <span v-for="platform in group.platforms" :key="platform" class="mc-tag">{{ platform }}</span>
            <span class="mc-tag">v{{ group.version }}</span>
            <span class="mc-tag">{{ group.apps.length }} 个端应用</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mc-app-grid mc-app-grid-large">
      <div
        v-for="app in group.apps"
        :key="app.id"
        class="mc-app-card mc-app-card-hover"
        @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })"
      >
        <div class="mc-app-card-header">
          <span class="mc-app-icon mc-app-icon-lg" :style="{ background: app.iconColor }">
            <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
            <span v-else>{{ app.icon }}</span>
          </span>
          <span class="mc-app-status" :class="`mc-status-${app.statusTone}`">{{ app.status }}</span>
        </div>
        <h4 class="mc-app-name">{{ app.platform }}</h4>
        <p class="mc-app-package">{{ app.packageName }}</p>
        <div class="mc-app-tags">
          <span class="mc-tag">v{{ app.version }} ({{ app.buildNumber }})</span>
          <span class="mc-tag">{{ app.size }}</span>
          <span class="mc-tag">{{ app.team || '未分配团队' }}</span>
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
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该多端应用</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-list' })">返回应用列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { listMobileAppMultiPlatformsApi } from '../../api/mobileApps'
import { findMobileAppGroup } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const remoteApps = ref([])
const fallbackGroup = computed(() => findMobileAppGroup(route.params.id))
const group = computed(() => {
  if (remoteApps.value.length) return buildRemoteGroup(remoteApps.value)
  return fallbackGroup.value
})

watch(
  () => route.params.id,
  () => fetchMultiPlatforms(),
  { immediate: false }
)

onMounted(() => {
  fetchMultiPlatforms()
})

async function fetchMultiPlatforms () {
  loading.value = true
  try {
    const result = await listMobileAppMultiPlatformsApi(route.params.id)
    remoteApps.value = normalizePlatformApps(Array.isArray(result) ? result : result?.items || result?.apps || [])
  } catch (error) {
    remoteApps.value = []
    if (!fallbackGroup.value) MessagePlugin.error(error.message || '多端应用加载失败')
  } finally {
    loading.value = false
  }
}

function normalizePlatformApps (items) {
  return items.map((app) => ({
    environments: [],
    features: [],
    team: '',
    buildNumber: '100',
    downloads: 0,
    rating: 0,
    size: '0 MB',
    status: '开发中',
    statusTone: 'processing',
    createdAt: '',
    lastUpdated: '',
    ...app,
    platform: formatPlatform(app.platform),
    icon: app.icon || String(app.name || '').slice(0, 2).toUpperCase() || 'APP',
    iconColor: app.iconColor || '#0052d9',
    lastUpdated: app.lastUpdated || app.createdAt || ''
  }))
}

function buildRemoteGroup (apps) {
  const first = apps[0] || {}
  return {
    id: route.params.id,
    name: first.name || '多端应用',
    icon: first.icon || String(first.name || '').slice(0, 2).toUpperCase() || 'APP',
    iconColor: first.iconColor || '#0052d9',
    status: first.status || '开发中',
    statusTone: first.statusTone || 'processing',
    version: first.version || '',
    platforms: apps.map((app) => app.platform).filter(Boolean),
    apps
  }
}

function formatPlatform (platform) {
  const labels = {
    ios: 'iOS',
    android: 'Android',
    'web-app': 'Web App',
    harmonyos: 'HarmonyOS'
  }
  return labels[platform] || platform
}

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n || 0)
}
</script>
