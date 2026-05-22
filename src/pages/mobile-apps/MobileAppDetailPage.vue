<template>
  <div class="mobile-center-page" v-if="app">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-list' })">
      &larr; 返回应用列表
    </button>

    <div class="mc-detail-hero">
      <div class="mc-detail-hero-left">
        <span class="mc-app-icon mc-app-icon-xl" :style="{ background: app.iconColor }">
          <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
          <span v-else>{{ app.icon }}</span>
        </span>
        <div class="mc-detail-hero-info">
          <div class="mc-detail-title-row">
            <h1>{{ app.name }}</h1>
            <span class="mc-app-status mc-app-status-lg" :class="`mc-status-${app.statusTone}`">{{ app.status }}</span>
          </div>
          <p class="mc-detail-package">{{ app.packageName }}</p>
          <div class="mc-detail-tags">
            <span class="mc-tag">{{ app.platform }}</span>
            <span class="mc-tag">v{{ app.version }} ({{ app.buildNumber }})</span>
            <span class="mc-tag">{{ app.size }}</span>
            <span class="mc-tag">{{ app.team }}</span>
          </div>
        </div>
      </div>
      <div class="mc-detail-hero-actions">
        <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-edit', params: { id: app.id } })">编辑信息</button>
        <button class="mc-btn mc-btn-primary" @click="router.push({ name: 'mobile-app-versions', params: { id: app.id } })">版本管理</button>
      </div>
    </div>

    <div class="mc-detail-metrics">
      <div class="mc-detail-metric">
        <span class="mc-detail-metric-value">{{ formatNumber(app.downloads) }}</span>
        <span class="mc-detail-metric-label">总下载量</span>
      </div>
      <div class="mc-detail-metric">
        <span class="mc-detail-metric-value">{{ app.rating || '-' }}</span>
        <span class="mc-detail-metric-label">用户评分</span>
      </div>
      <div class="mc-detail-metric">
        <span class="mc-detail-metric-value">{{ app.environments.length }}</span>
        <span class="mc-detail-metric-label">环境数量</span>
      </div>
      <div class="mc-detail-metric">
        <span class="mc-detail-metric-value">{{ app.lastUpdated }}</span>
        <span class="mc-detail-metric-label">最近更新</span>
      </div>
    </div>

    <div class="mc-detail-grid">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <h3>应用信息</h3>
        </div>
        <div class="mc-info-list">
          <div class="mc-info-row">
            <span class="mc-info-label">应用名称</span>
            <span class="mc-info-value">{{ app.name }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">包名</span>
            <span class="mc-info-value mc-info-mono">{{ app.packageName }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">平台</span>
            <span class="mc-info-value">{{ app.platform }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">版本号</span>
            <span class="mc-info-value">v{{ app.version }} ({{ app.buildNumber }})</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">包体大小</span>
            <span class="mc-info-value">{{ app.size }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">负责团队</span>
            <span class="mc-info-value">{{ app.team }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">创建时间</span>
            <span class="mc-info-value">{{ app.createdAt }}</span>
          </div>
          <div class="mc-info-row">
            <span class="mc-info-label">描述</span>
            <span class="mc-info-value">{{ app.description }}</span>
          </div>
        </div>
      </section>

      <div class="mc-detail-side">
        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>部署环境</h3>
          </div>
          <div class="mc-env-list">
            <span v-for="env in app.environments" :key="env" class="mc-env-badge" :class="envClass(env)">{{ env }}</span>
          </div>
        </section>

        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>核心功能</h3>
          </div>
          <div class="mc-feature-list">
            <div v-for="feature in app.features" :key="feature" class="mc-feature-item">
              <span class="mc-feature-dot"></span>
              <span>{{ feature }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="mc-panel mc-install-section">
      <div class="mc-panel-header">
        <h3>安装页面</h3>
      </div>
      <div class="mc-install-link-block">
        <div class="mc-qr-box">{{ qrInitials }}</div>
        <div class="mc-install-link-main">
          <strong>将下载链接以聊天、邮件发送给用户，或在您的官网中链接</strong>
          <div class="mc-install-url">
            <span>{{ installSettings.installUrl || defaultInstallUrl }}</span>
            <button class="mc-link-btn" type="button">复制</button>
          </div>
          <div class="mc-install-actions">
            <button class="mc-link-btn" type="button">复制链接</button>
            <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-install', params: { id: app.id } })">直接打开</button>
            <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-app-install-manage', params: { id: app.id } })">修改链接</button>
            <button class="mc-link-btn" type="button">下载二维码</button>
            <button class="mc-link-btn" type="button">广告素材</button>
          </div>
        </div>
      </div>
    </section>

    <section class="mc-panel mc-install-section">
      <div class="mc-panel-header">
        <h3>安装页面</h3>
      </div>
      <div class="mc-install-content-grid">
        <div class="mc-install-copy">
          <div>
            <strong>应用介绍</strong>
            <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-app-install-manage', params: { id: app.id } })">编辑</button>
            <p>{{ installSettings.installDescription || app.description || '暂无' }}</p>
          </div>
          <div>
            <strong>更新说明</strong>
            <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-app-install-manage', params: { id: app.id } })">编辑</button>
            <p>{{ installSettings.installReleaseNotes || '暂无' }}</p>
          </div>
        </div>
        <div class="mc-install-screenshots">
          <strong>应用截图</strong>
          <div class="mc-screenshot-list">
            <div
              v-for="(shot, index) in previewScreenshots"
              :key="index"
              class="mc-screenshot-item is-preview"
              :class="{ 'is-placeholder': !shot }"
            >
              <img v-if="shot" :src="shot" :alt="`应用截图 ${index + 1}`" />
              <span v-else class="mc-screenshot-placeholder">
                <span>+</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mc-panel mc-install-section">
      <div class="mc-panel-header">
        <div>
          <h3>安装设置</h3>
          <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-app-install-manage', params: { id: app.id } })">更多设置</button>
        </div>
      </div>
      <div class="mc-install-settings-grid">
        <div v-for="item in installSettingSummary" :key="item.label" class="mc-install-setting-item">
          <strong>{{ item.label }}</strong>
          <div class="mc-install-setting-value">
            <span>{{ item.value }}</span>
            <button class="mc-link-btn" type="button" @click="router.push({ name: 'mobile-app-install-manage', params: { id: app.id } })">编辑</button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该应用</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-list' })">返回应用列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findMobileApp } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const app = computed(() => findMobileApp(route.params.id))
const installSettings = computed(() => app.value?.installSettings || {})
const defaultInstallUrl = computed(() => `${window.location.origin}${window.location.pathname}#/install/${app.value?.id || 'app'}`)
const qrInitials = computed(() => (app.value?.icon || app.value?.name?.slice(0, 2) || 'APP').toUpperCase())
const previewScreenshots = computed(() => {
  const shots = installSettings.value.screenshots || []
  return [...shots, '', '', ''].slice(0, 4)
})
const installSettingSummary = computed(() => [
  { label: '分发模式', value: installSettings.value.distributionMode || '内测模式(下载次数受限制)' },
  { label: '安装方式', value: installSettings.value.installMethod || '公开' },
  { label: '下载状态', value: installSettings.value.downloadEnabled === false ? '关闭' : '开启' },
  { label: '下载有效期', value: installSettings.value.downloadValidity || '长期有效' },
  { label: '下载文件名', value: installSettings.value.downloadNameMode || '应用名_版本' },
  { label: '自动同步应用市场信息', value: installSettings.value.syncMarketInfo === false ? '关闭' : '开启' },
  { label: '启用去广告次数包', value: installSettings.value.removeAdLimit === false ? '关闭' : '开启' },
  { label: 'App 下载页语言', value: installSettings.value.downloadLanguage || '自动' },
  { label: '用户反馈表单', value: installSettings.value.feedbackEnabled ? '开启' : '关闭' },
  { label: '是否显示版权信息', value: installSettings.value.showCopyright === false ? '隐藏' : '显示' },
  { label: '是否显示安装引导', value: installSettings.value.showInstallGuide === false ? '隐藏' : '显示' },
  { label: '是否显示历史版本', value: installSettings.value.showHistory === false ? '隐藏' : '显示' }
])

function formatNumber (n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function envClass (env) {
  if (env === 'Production') return 'mc-env-prod'
  if (env === 'Staging') return 'mc-env-staging'
  if (env === 'QA') return 'mc-env-qa'
  return 'mc-env-dev'
}
</script>
