<template>
  <div class="mobile-center-page">
    <div class="mc-hero">
      <div class="mc-hero-content">
        <h1>移动应用中心</h1>
        <p>统一管理移动应用的版本发布、平台分发与数据监控</p>
      </div>
      <div class="mc-hero-stats">
        <div class="mc-stat-item">
          <span class="mc-stat-value">{{ stats.totalApps }}</span>
          <span class="mc-stat-label">应用总数</span>
        </div>
        <div class="mc-stat-divider"></div>
        <div class="mc-stat-item">
          <span class="mc-stat-value">{{ stats.published }}</span>
          <span class="mc-stat-label">已发布</span>
        </div>
        <div class="mc-stat-divider"></div>
        <div class="mc-stat-item">
          <span class="mc-stat-value">{{ formatNumber(stats.totalDownloads) }}</span>
          <span class="mc-stat-label">总下载量</span>
        </div>
        <div class="mc-stat-divider"></div>
        <div class="mc-stat-item">
          <span class="mc-stat-value">{{ stats.avgRating.toFixed(1) }}</span>
          <span class="mc-stat-label">平均评分</span>
        </div>
      </div>
    </div>

    <div class="mc-metrics-grid">
      <div v-for="metric in metrics" :key="metric.label" class="mc-metric-card">
        <div class="mc-metric-icon" :style="{ background: metric.gradient }">
          <span>{{ metric.iconText }}</span>
        </div>
        <div class="mc-metric-info">
          <span class="mc-metric-label">{{ metric.label }}</span>
          <span class="mc-metric-value">{{ metric.value }}</span>
          <span class="mc-metric-change" :class="metric.changeType">{{ metric.change }}</span>
        </div>
      </div>
    </div>

    <div class="mc-panels-grid">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>平台分布</h3>
            <p>各平台应用数量与状态概览</p>
          </div>
        </div>
        <div class="mc-platform-bars">
          <div v-for="platform in platformStats" :key="platform.name" class="mc-platform-row">
            <div class="mc-platform-info">
              <span class="mc-platform-dot" :style="{ background: platform.color }"></span>
              <span class="mc-platform-name">{{ platform.name }}</span>
              <span class="mc-platform-count">{{ platform.count }} 个应用</span>
            </div>
            <div class="mc-platform-bar-track">
              <div class="mc-platform-bar-fill" :style="{ width: platform.percent + '%', background: platform.color }"></div>
            </div>
            <span class="mc-platform-percent">{{ platform.percent }}%</span>
          </div>
        </div>
      </section>

      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>最近动态</h3>
            <p>应用版本更新与发布记录</p>
          </div>
        </div>
        <div class="mc-timeline">
          <div v-for="event in recentEvents" :key="event.id" class="mc-timeline-item">
            <div class="mc-timeline-dot" :class="event.tone"></div>
            <div class="mc-timeline-content">
              <p class="mc-timeline-title">{{ event.title }}</p>
              <p class="mc-timeline-desc">{{ event.description }}</p>
              <span class="mc-timeline-time">{{ event.time }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="mc-panel mc-recent-apps">
      <div class="mc-panel-header">
        <div>
          <h3>应用列表</h3>
          <p>近期更新的移动应用</p>
        </div>
        <button class="mc-btn mc-btn-outline" @click="goToList">查看全部</button>
      </div>
      <div class="mc-app-grid">
        <div v-for="app in recentApps" :key="app.id" class="mc-app-card" @click="goToDetail(app.id)">
          <div class="mc-app-card-header">
            <span class="mc-app-icon" :style="{ background: app.iconColor }">
              <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
              <span v-else>{{ app.icon }}</span>
            </span>
            <span class="mc-app-status" :class="`mc-status-${app.statusTone}`">{{ app.status }}</span>
          </div>
          <h4 class="mc-app-name">{{ app.name }}</h4>
          <p class="mc-app-platform">{{ app.platform }} &middot; v{{ app.version }}</p>
          <div class="mc-app-meta">
            <span>{{ formatNumber(app.downloads) }} 下载</span>
            <span v-if="app.rating">{{ app.rating }} 分</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { readMobileApps, getMobileAppStats } from '../../config/mobileApps'

const router = useRouter()
const allApps = readMobileApps()
const stats = getMobileAppStats()

const metrics = computed(() => [
  {
    iconText: 'iOS',
    label: 'iOS 应用',
    value: allApps.filter((a) => a.platform === 'iOS').length + ' 个',
    change: '+1 本月',
    changeType: 'mc-change-up',
    gradient: 'linear-gradient(135deg, #007aff, #5856d6)'
  },
  {
    iconText: 'And',
    label: 'Android 应用',
    value: allApps.filter((a) => a.platform === 'Android').length + ' 个',
    change: '稳定运行',
    changeType: 'mc-change-neutral',
    gradient: 'linear-gradient(135deg, #34c759, #30d158)'
  },
  {
    iconText: 'Web',
    label: 'Web 应用',
    value: allApps.filter((a) => a.platform === 'Web App').length + ' 个',
    change: 'PWA 支持',
    changeType: 'mc-change-neutral',
    gradient: 'linear-gradient(135deg, #5856d6, #af52de)'
  },
  {
    iconText: 'QA',
    label: '审核中',
    value: stats.inReview + ' 个',
    change: '等待审核',
    changeType: 'mc-change-warn',
    gradient: 'linear-gradient(135deg, #ff9500, #ff6b00)'
  }
])

const platformColors = { iOS: '#007aff', Android: '#34c759', 'Web App': '#5856d6', HarmonyOS: '#e37318' }
const platformStats = computed(() => {
  const total = allApps.length || 1
  return stats.platforms.map((name) => {
    const count = allApps.filter((a) => a.platform === name).length
    return { name, count, percent: Math.round((count / total) * 100), color: platformColors[name] || '#6b7280' }
  })
})

const recentApps = computed(() => [...allApps].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 6))

const recentEvents = [
  { id: 1, title: 'Privacy Gen iOS v2.4.1 发布', description: '修复多语言切换时的显示异常，优化启动速度。', time: '3 小时前', tone: 'mc-dot-success' },
  { id: 2, title: 'i18n Manager iOS 提交审核', description: '版本 1.8.3 已提交 App Store 审核。', time: '6 小时前', tone: 'mc-dot-warning' },
  { id: 3, title: 'Icon Studio iOS 进入开发', description: '图标编辑器核心功能开发中。', time: '1 天前', tone: 'mc-dot-processing' },
  { id: 4, title: 'Compliance Hub v5.2.0 上线', description: '新增审计追踪模块与报表导出功能。', time: '2 天前', tone: 'mc-dot-success' }
]

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function goToList () {
  router.push({ name: 'mobile-app-list' })
}

function goToDetail (id) {
  router.push({ name: 'mobile-app-detail', params: { id } })
}
</script>
