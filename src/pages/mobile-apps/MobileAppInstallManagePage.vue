<template>
  <div class="mobile-center-page" v-if="app">
    <button class="mc-back-btn" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">
      &larr; 返回应用详情
    </button>

    <div class="mc-install-manage-layout">
      <section class="mc-panel">
        <div class="mc-panel-header">
          <div>
            <h3>安装页面</h3>
            <p>管理安装链接、页面介绍、更新说明和应用截图。</p>
          </div>
        </div>

        <div class="mc-edit-form">
          <div class="mc-form-group">
            <label>下载链接</label>
            <input v-model="form.installUrl" type="text" placeholder="https://www.pgyer.com/your-app" />
          </div>

          <div class="mc-form-group">
            <label>App Store 链接</label>
            <input v-model="form.appStoreUrl" type="text" placeholder="https://apps.apple.com/app/id0000000000" />
          </div>

          <div class="mc-form-row">
            <div class="mc-form-group">
              <label>短链接 Key</label>
              <input v-model="form.shortKey" type="text" placeholder="gensignature-android-kw" />
            </div>
            <div class="mc-form-group">
              <label>二维码内容</label>
              <input v-model="form.qrValue" type="text" placeholder="默认使用下载链接" />
            </div>
          </div>

          <div class="mc-form-group">
            <label>应用介绍</label>
            <textarea v-model="form.installDescription" rows="4" placeholder="暂无"></textarea>
          </div>

          <div class="mc-form-group">
            <label>更新说明</label>
            <textarea v-model="form.installReleaseNotes" rows="3" placeholder="暂无"></textarea>
          </div>

          <div class="mc-form-group">
            <label>应用截图</label>
            <div class="mc-screenshot-list">
              <label
                v-for="(_, index) in form.screenshots"
                :key="index"
                class="mc-screenshot-item"
              >
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleScreenshotUpload($event, index)" />
                <img v-if="form.screenshots[index]" :src="form.screenshots[index]" :alt="`应用截图 ${index + 1}`" />
                <span v-else>+</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <aside class="mc-detail-side">
        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>安装设置</h3>
          </div>
          <div class="mc-setting-list">
            <div
              v-for="setting in settingRows"
              :key="setting.key"
              class="mc-setting-edit-row"
            >
              <div>
                <strong>{{ setting.label }}</strong>
                <small>{{ setting.description }}</small>
              </div>
              <select v-if="setting.type === 'select'" v-model="form[setting.key]">
                <option
                  v-for="option in setting.options || []"
                  :key="option.value || option"
                  :value="option.value || option"
                >
                  {{ option.label || option }}
                </option>
              </select>
              <input v-else v-model="form[setting.key]" type="checkbox" />
            </div>
          </div>

          <div v-if="passwordAccessEnabled" class="mc-install-password-card">
            <div>
              <strong>密码访问</strong>
              <small>开启后安装页会先验证访问密码，验证通过后才允许下载安装。</small>
            </div>
            <label class="mc-install-password-field">
              <span>访问密码</span>
              <div class="mc-install-password-input">
                <input
                  v-model="form.accessCode"
                  :type="accessCodeVisible ? 'text' : 'password'"
                  maxlength="4"
                  placeholder="请输入 4 位字母或数字"
                />
                <button type="button" @click="accessCodeVisible = !accessCodeVisible">
                  {{ accessCodeVisible ? '隐藏' : '显示' }}
                </button>
              </div>
            </label>
            <label class="mc-install-password-field">
              <span>密码提示</span>
              <input v-model="form.accessPasswordHint" type="text" maxlength="40" placeholder="例如：请联系管理员获取" />
            </label>
          </div>
        </section>

        <section class="mc-panel">
          <div class="mc-panel-header">
            <h3>安装页预览</h3>
          </div>
          <div class="mc-install-preview">
            <span class="mc-app-icon mc-app-icon-lg" :style="{ background: app.iconColor }">
              <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
              <span v-else>{{ app.icon }}</span>
            </span>
            <strong>{{ app.name }}</strong>
            <small>{{ form.installUrl || defaultInstallUrl }}</small>
            <p>{{ form.installDescription || app.description || '暂无应用介绍' }}</p>
            <span v-if="passwordAccessEnabled" class="mc-install-preview-lock">已启用密码访问</span>
          </div>
        </section>
      </aside>
    </div>

    <div class="mc-sticky-actions">
      <button class="mc-btn mc-btn-outline" :disabled="saving" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">取消</button>
      <button class="mc-btn mc-btn-primary" :disabled="saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存安装管理' }}
      </button>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { findMobileApp, updateMobileApp } from '../../config/mobileApps'
import {
  getMobileAppInstallDetailApi,
  isPasswordDistributionMode,
  normalizeDistributionMode,
  normalizeDownloadFileNameRule,
  normalizeDownloadLanguage,
  normalizeDownloadValidity,
  normalizeInstallMode,
  normalizeMobileAppInstallDetail,
  updateMobileAppInstallSettingsApi
} from '../../api/mobileApps'

const route = useRoute()
const router = useRouter()
const localApp = findMobileApp(route.params.id)
const installDetail = ref(null)
const saving = ref(false)
const accessCodeVisible = ref(false)
const app = computed(() => installDetail.value?.app || localApp)
const defaultInstallUrl = computed(() => `${window.location.origin}${window.location.pathname}#/install/${app.value?.id || 'app'}`)
const form = ref(buildInstallForm(app.value, defaultInstallUrl.value))
const passwordAccessEnabled = computed(() => {
  return isPasswordDistributionMode(form.value.distributionMode) || form.value.installMethod === '密码安装'
})

const settingRows = [
  {
    key: 'distributionMode',
    label: '分发模式',
    description: '控制下载次数限制和分发方式',
    type: 'select',
    options: [
      { value: 'internal', label: '内测模式(下载次数受限制)' },
      { value: 'public', label: '公开分发' },
      { value: 'password', label: '密码访问' }
    ]
  },
  { key: 'installMethod', label: '安装方式', description: '控制安装页可见范围', type: 'select', options: ['公开', '密码安装', '邀请安装'] },
  { key: 'downloadEnabled', label: '下载状态', description: '关闭后用户不能下载安装包', type: 'toggle' },
  { key: 'downloadValidity', label: '下载有效期', description: '设置安装包下载链接有效期', type: 'select', options: ['长期有效', '7 天有效', '30 天有效', '90 天有效'] },
  { key: 'downloadNameMode', label: '下载文件名', description: '安装包下载时使用的文件名规则', type: 'select', options: ['应用名_版本', '原始文件名', '应用名_Build'] },
  { key: 'syncMarketInfo', label: '自动同步应用市场信息', description: '同步应用介绍和截图等市场资料', type: 'toggle' },
  { key: 'removeAdLimit', label: '启用去广告次数包', description: '允许安装页使用去广告次数包', type: 'toggle' },
  { key: 'downloadLanguage', label: 'App 下载页语言', description: '控制安装页展示语言', type: 'select', options: ['自动', '中文', '英文'] },
  { key: 'feedbackEnabled', label: '用户反馈表单', description: '安装页是否展示反馈入口', type: 'toggle' },
  { key: 'showCopyright', label: '是否显示版权信息', description: '安装页底部显示版权信息', type: 'toggle' },
  { key: 'showInstallGuide', label: '是否显示安装引导', description: '展示 iOS/Android 安装引导', type: 'toggle' },
  { key: 'showHistory', label: '是否显示历史版本', description: '安装页显示历史版本入口', type: 'toggle' }
]
const accessCodePattern = /^[A-Za-z0-9]{4}$/

function handleScreenshotUpload (event, index) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.screenshots[index] = reader.result
  }
  reader.readAsDataURL(file)
}

async function handleSave () {
  if (!app.value || saving.value) return
  if (passwordAccessEnabled.value && !String(form.value.accessCode || '').trim()) {
    MessagePlugin.warning('请填写访问密码')
    return
  }
  const accessCode = String(form.value.accessCode || '').trim()
  if (accessCode && !accessCodePattern.test(accessCode)) {
    MessagePlugin.warning('访问密码必须是 4 位字母或数字')
    return
  }
  const installSettings = buildInstallSettings()
  const requestPayload = buildInstallSettingsPayload(accessCode)
  saving.value = true
  try {
    const detail = await updateMobileAppInstallSettingsApi(app.value.id, requestPayload)
    const normalizedDetail = normalizeMobileAppInstallDetail(detail, {
      ...(app.value || {}),
      installSettings
    })
    installDetail.value = normalizedDetail
    updateMobileApp(app.value.id, {
      installSettings: normalizedDetail?.app?.installSettings || installSettings
    })
    MessagePlugin.success('安装管理信息已保存')
    router.push({ name: 'mobile-app-detail', params: { id: app.value.id } })
  } catch (error) {
    MessagePlugin.error(error?.message || '保存安装管理失败')
  } finally {
    saving.value = false
  }
}

function buildInstallSettings () {
  const accessCode = passwordAccessEnabled.value ? String(form.value.accessCode || '').trim() : ''
  return {
    ...form.value,
    distributionMode: normalizeDistributionMode(form.value.distributionMode),
    installMethod: form.value.installMethod,
    accessCode,
    accessPassword: accessCode,
    accessPasswordHint: passwordAccessEnabled.value ? String(form.value.accessPasswordHint || '').trim() : '',
    screenshots: form.value.screenshots.filter(Boolean)
  }
}

function buildInstallSettingsPayload (accessCode) {
  return {
    distributionMode: normalizeDistributionMode(form.value.distributionMode),
    accessCode,
    installMode: normalizeInstallMode(form.value.installMethod),
    downloadEnabled: Boolean(form.value.downloadEnabled),
    downloadValidity: normalizeDownloadValidity(form.value.downloadValidity),
    downloadFileNameRule: normalizeDownloadFileNameRule(form.value.downloadNameMode),
    syncMarketInfo: Boolean(form.value.syncMarketInfo),
    enableAdHocPackage: Boolean(form.value.removeAdLimit),
    language: normalizeDownloadLanguage(form.value.downloadLanguage),
    feedbackEnabled: Boolean(form.value.feedbackEnabled),
    showCopyright: Boolean(form.value.showCopyright),
    showInstallGuide: Boolean(form.value.showInstallGuide),
    showHistoryVersions: Boolean(form.value.showHistory)
  }
}

function buildInstallForm (appData, defaultUrl) {
  const installSettings = appData?.installSettings || {}
  return {
    installUrl: installSettings.installUrl || defaultUrl,
    appStoreUrl: installSettings.appStoreUrl || '',
    shortKey: installSettings.shortKey || appData?.id || '',
    qrValue: installSettings.qrValue || installSettings.installUrl || defaultUrl,
    installDescription: installSettings.installDescription || appData?.description || '',
    installReleaseNotes: installSettings.installReleaseNotes || '',
    screenshots: installSettings.screenshots?.length ? [...installSettings.screenshots, '', '', ''].slice(0, 4) : ['', '', '', ''],
    distributionMode: normalizeDistributionMode(installSettings.distributionMode),
    installMethod: installSettings.installMethod || '公开',
    accessCode: installSettings.accessCode || installSettings.accessPassword || '',
    accessPassword: installSettings.accessCode || installSettings.accessPassword || '',
    accessPasswordHint: installSettings.accessPasswordHint || '请输入访问密码后继续安装',
    downloadEnabled: installSettings.downloadEnabled ?? true,
    downloadValidity: installSettings.downloadValidity || '长期有效',
    downloadNameMode: installSettings.downloadNameMode || '应用名_版本',
    syncMarketInfo: installSettings.syncMarketInfo ?? true,
    removeAdLimit: installSettings.removeAdLimit ?? true,
    downloadLanguage: installSettings.downloadLanguage || '自动',
    feedbackEnabled: installSettings.feedbackEnabled ?? false,
    showCopyright: installSettings.showCopyright ?? true,
    showInstallGuide: installSettings.showInstallGuide ?? true,
    showHistory: installSettings.showHistory ?? true
  }
}

watch(
  () => form.value.distributionMode,
  (mode) => {
    const normalizedMode = normalizeDistributionMode(mode)
    if (form.value.distributionMode !== normalizedMode) {
      form.value.distributionMode = normalizedMode
      return
    }
    if (isPasswordDistributionMode(mode) && form.value.installMethod === '公开') {
      form.value.installMethod = '密码安装'
    }
  }
)

watch(
  () => form.value.installMethod,
  (method) => {
    if (method === '密码安装' && !isPasswordDistributionMode(form.value.distributionMode)) {
      form.value.distributionMode = 'password'
    }
  }
)

onMounted(async () => {
  try {
    const detail = await getMobileAppInstallDetailApi(route.params.id)
    installDetail.value = normalizeMobileAppInstallDetail(detail, localApp || {})
    form.value = buildInstallForm(app.value, defaultInstallUrl.value)
  } catch {
    installDetail.value = null
  }
})
</script>
