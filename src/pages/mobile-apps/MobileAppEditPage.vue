<template>
  <div class="mobile-center-page" v-if="app">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">
      &larr; 返回应用详情
    </button>

    <div class="mc-edit-shell">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>编辑信息</h3>
            <p>维护应用基础资料、版本和展示信息。</p>
          </div>
          <span class="mc-app-status" :class="`mc-status-${statusTone}`">{{ form.status }}</span>
        </div>

        <div class="mc-edit-form">
          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>应用名称</label>
              <input v-model="form.name" type="text" />
            </div>
            <div class="mc-form-group">
              <label>平台</label>
              <select v-model="form.platform">
                <option v-for="platform in platformOptions" :key="platform.value" :value="platform.value">{{ platform.label }}</option>
              </select>
            </div>
          </div>

          <div class="mc-form-group">
            <label>Bundle ID / 包名</label>
            <input v-model="form.packageName" type="text" />
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>当前版本</label>
              <select v-model="selectedVersionId" @change="handleVersionChange">
                <option
                  v-for="version in versionOptions"
                  :key="version.id"
                  :value="version.id"
                >
                  {{ version.version }} · Build {{ version.buildNumber }} · {{ version.channel }}
                </option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>Build 版本</label>
              <input v-model="form.buildNumber" type="text" disabled />
            </div>
          </div>

          <div class="mc-form-group">
            <label>应用图标</label>
            <div class="mc-icon-picker">
              <span class="mc-app-icon mc-app-icon-lg" :style="currentIconStyle">
                <img v-if="form.iconImage" :src="form.iconImage" :alt="form.name" />
                <span v-else>{{ form.icon }}</span>
              </span>
              <div class="mc-icon-picker-info">
                <strong>{{ selectedIconName }}</strong>
                <small>{{ selectedIconMeta }}</small>
              </div>
              <button class="mc-btn mc-btn-outline" type="button" @click="iconDialogVisible = true">选择图标</button>
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>包体大小</label>
              <input v-model="form.size" type="text" disabled />
            </div>
            <div class="mc-form-group">
              <label>负责团队</label>
              <input v-model="form.team" type="text" />
            </div>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>状态</label>
              <select v-model="form.status">
                <option v-for="status in statusOptions" :key="status.value" :value="status.value">{{ status.label }}</option>
              </select>
            </div>
            <div class="mc-form-group">
              <label>下载文件名</label>
              <input v-model="form.downloadName" type="text" placeholder="原始文件名" />
            </div>
          </div>

          <div class="mc-form-group">
            <label>应用介绍</label>
            <textarea v-model="form.description" rows="4"></textarea>
          </div>

          <div class="mc-form-group">
            <label>更新说明</label>
            <textarea v-model="form.releaseNotes" rows="3" placeholder="暂无"></textarea>
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>部署环境</label>
              <input v-model="environmentText" type="text" placeholder="Production, Staging, QA" />
            </div>
            <div class="mc-form-group">
              <label>核心功能</label>
              <input v-model="featureText" type="text" placeholder="隐私政策生成, 多语言支持" />
            </div>
          </div>
        </div>
      </section>

      <aside class="mc-detail-side">
        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>页面预览</h3>
          </div>
          <div class="mc-install-preview">
            <span class="mc-app-icon mc-app-icon-lg" :style="currentIconStyle">
              <img v-if="form.iconImage" :src="form.iconImage" :alt="form.name" />
              <span v-else>{{ form.icon }}</span>
            </span>
            <strong>{{ form.name || '应用名称' }}</strong>
            <small>{{ form.platform }} · v{{ form.version }} ({{ form.buildNumber }})</small>
            <p>{{ form.description || '暂无应用介绍' }}</p>
          </div>
        </section>
      </aside>
    </div>

    <div class="mc-sticky-actions">
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">取消</button>
      <button class="mc-btn mc-btn-primary" @click="handleSave">保存信息</button>
    </div>

    <div v-if="iconDialogVisible" class="mc-dialog-overlay" @click.self="iconDialogVisible = false">
      <div class="mc-dialog mc-icon-select-dialog">
        <div class="mc-dialog-header">
          <h3>选择应用图标</h3>
          <button class="mc-dialog-close" @click="iconDialogVisible = false">&times;</button>
        </div>
        <div class="mc-dialog-body">
          <div class="mc-search-box mc-icon-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input v-model="iconKeyword" type="text" placeholder="搜索应用图标、Bundle ID 或版本" />
          </div>
          <div class="mc-icon-option-list">
            <button
              v-for="icon in filteredAppIcons"
              :key="icon.id"
              type="button"
              class="mc-icon-option"
              :class="{ 'is-active': form.appIconId === icon.id }"
              @click="selectAppIcon(icon)"
            >
              <span class="app-icon-preview" :style="getAppIconStyle(icon)">
                <img v-if="isImageIcon(icon)" :src="icon.sourcePreview" :alt="icon.appName" />
                <span v-else>{{ icon.iconText || 'A' }}</span>
              </span>
              <span>
                <strong>{{ icon.name }}</strong>
                <small>{{ icon.bundleId }} · {{ icon.version }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="mobile-center-page">
    <div class="mc-empty-state">
      <p>未找到该应用</p>
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-list' })">返回应用列表</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { buildGradient, readAppIcons } from '../../config/appIcons'
import { findMobileApp, platformOptions, readMobileAppVersions, statusOptions, updateMobileApp } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const app = findMobileApp(route.params.id)
const versionOptions = ref(app ? readMobileAppVersions(app.id) : [])
const selectedVersionId = ref(app?.currentVersionId || versionOptions.value.find((item) => item.version === app?.version && item.buildNumber === app?.buildNumber)?.id || versionOptions.value[0]?.id || '')
const appIcons = ref(readAppIcons())
const iconDialogVisible = ref(false)
const iconKeyword = ref('')

const form = ref({
  ...(app || {}),
  downloadName: app ? `${app.name}-${app.version}` : '',
  releaseNotes: ''
})
const environmentText = ref(app?.environments?.join(', ') || '')
const featureText = ref(app?.features?.join(', ') || '')

if (selectedVersionId.value) {
  handleVersionChange()
}

const statusTone = computed(() => {
  return statusOptions.find((item) => item.value === form.value.status)?.tone || 'default'
})
const currentIconStyle = computed(() => ({
  background: form.value.iconColor || '#0052d9'
}))
const selectedIcon = computed(() => appIcons.value.find((icon) => icon.id === form.value.appIconId) || null)
const selectedIconName = computed(() => selectedIcon.value?.name || '当前应用图标')
const selectedIconMeta = computed(() => {
  if (selectedIcon.value) return `${selectedIcon.value.bundleId} · ${selectedIcon.value.version}`
  return form.value.iconImage ? '自定义图片图标' : '使用应用缩写图标'
})
const filteredAppIcons = computed(() => {
  const q = iconKeyword.value.trim().toLowerCase()
  return appIcons.value.filter((icon) => {
    const text = `${icon.name} ${icon.appName} ${icon.bundleId} ${icon.version}`.toLowerCase()
    return !q || text.includes(q)
  })
})

function parseList (value) {
  return String(value || '').split(/[,，]/).map((item) => item.trim()).filter(Boolean)
}

function handleVersionChange () {
  const version = versionOptions.value.find((item) => item.id === selectedVersionId.value)
  if (!version) return
  form.value.version = version.version
  form.value.buildNumber = version.buildNumber
  form.value.size = version.size
  form.value.currentVersionId = version.id
  form.value.status = version.status === '历史版本' ? form.value.status : version.status
  form.value.releaseNotes = version.releaseNotes || form.value.releaseNotes
  form.value.downloadName = `${form.value.name}-${version.version}`
}

function isImageIcon (icon) {
  return icon.sourceType === 'image' && icon.sourcePreview
}

function getAppIconStyle (icon) {
  const [start = '#0052d9', end = '#35c2ff'] = icon.colors || [icon.gradientStart, icon.gradientEnd]
  return {
    background: buildGradient({
      start: icon.gradientStart || start,
      end: icon.gradientEnd || end,
      direction: icon.gradientDirection,
      mode: icon.gradientMode
    })
  }
}

function selectAppIcon (icon) {
  const style = getAppIconStyle(icon)
  form.value.appIconId = icon.id
  form.value.icon = icon.iconText || icon.appName?.slice(0, 2).toUpperCase() || form.value.icon
  form.value.iconColor = style.background
  form.value.iconImage = isImageIcon(icon) ? icon.sourcePreview : ''
  iconDialogVisible.value = false
}

function handleSave () {
  if (!form.value.name.trim() || !form.value.packageName.trim()) {
    MessagePlugin.warning('请填写应用名称和包名')
    return
  }

  updateMobileApp(app.id, {
    ...form.value,
    currentVersionId: selectedVersionId.value,
    statusTone: statusTone.value,
    environments: parseList(environmentText.value),
    features: parseList(featureText.value)
  })
  MessagePlugin.success('应用信息已保存')
  router.push({ name: 'mobile-app-detail', params: { id: app.id } })
}
</script>
