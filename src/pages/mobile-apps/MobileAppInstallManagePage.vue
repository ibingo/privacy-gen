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
                <option v-for="option in setting.options || []" :key="option" :value="option">{{ option }}</option>
              </select>
              <input v-else v-model="form[setting.key]" type="checkbox" />
            </div>
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
          </div>
        </section>
      </aside>
    </div>

    <div class="mc-sticky-actions">
      <button class="mc-btn mc-btn-outline" @click="router.push({ name: 'mobile-app-detail', params: { id: app.id } })">取消</button>
      <button class="mc-btn mc-btn-primary" @click="handleSave">保存安装管理</button>
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
import { findMobileApp, updateMobileApp } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const app = findMobileApp(route.params.id)
const defaultInstallUrl = computed(() => `${window.location.origin}${window.location.pathname}#/install/${app?.id || 'app'}`)
const installSettings = app?.installSettings || {}
const form = ref({
  installUrl: installSettings.installUrl || defaultInstallUrl.value,
  appStoreUrl: installSettings.appStoreUrl || '',
  shortKey: installSettings.shortKey || app?.id || '',
  qrValue: installSettings.qrValue || installSettings.installUrl || defaultInstallUrl.value,
  installDescription: installSettings.installDescription || app?.description || '',
  installReleaseNotes: installSettings.installReleaseNotes || '',
  screenshots: installSettings.screenshots?.length ? [...installSettings.screenshots, '', '', ''].slice(0, 4) : ['', '', '', ''],
  distributionMode: installSettings.distributionMode || '内测模式(下载次数受限制)',
  installMethod: installSettings.installMethod || '公开',
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
})

const settingRows = [
  { key: 'distributionMode', label: '分发模式', description: '控制下载次数限制和分发方式', type: 'select', options: ['内测模式(下载次数受限制)', '公开分发', '密码访问'] },
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

function handleScreenshotUpload (event, index) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.screenshots[index] = reader.result
  }
  reader.readAsDataURL(file)
}

function handleSave () {
  updateMobileApp(app.id, {
    installSettings: {
      ...form.value,
      screenshots: form.value.screenshots.filter(Boolean)
    }
  })
  MessagePlugin.success('安装管理信息已保存')
  router.push({ name: 'mobile-app-detail', params: { id: app.id } })
}
</script>
