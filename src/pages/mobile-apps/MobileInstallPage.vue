<template>
  <div v-if="app && isMobile" class="mobile-install-page">
    <div class="mobile-install-hero">
      <span class="mobile-install-icon" :style="{ background: app.iconColor }">
        <img v-if="app.iconImage" :src="app.iconImage" :alt="app.name" />
        <span v-else>{{ app.icon }}</span>
      </span>
      <h1>{{ app.name }}</h1>
      <p>{{ app.packageName }}</p>
      <div class="mobile-install-tags">
        <t-tag theme="primary" variant="light">{{ app.platform }}</t-tag>
        <t-tag theme="success" variant="light">v{{ app.version }}</t-tag>
        <t-tag theme="default" variant="light">{{ app.size }}</t-tag>
      </div>
    </div>

    <t-notice-bar
      v-if="isInAppWebView"
      theme="warning"
      content="当前在应用内浏览器中，安装时请点击右上角选择在浏览器中打开。"
    />

    <section class="mobile-install-card">
      <div v-if="passwordRequired && !passwordPassed" class="mobile-install-password-gate">
        <h2>密码访问</h2>
        <p>{{ installSettings.accessPasswordHint || '请输入访问密码后继续安装' }}</p>
        <div class="mobile-install-password-input">
          <input
            v-model="accessPassword"
            :type="showAccessPassword ? 'text' : 'password'"
            placeholder="请输入访问密码"
            @keyup.enter="verifyAccessPassword"
          />
          <button type="button" aria-label="切换密码显示" @click="showAccessPassword = !showAccessPassword">
            <BrowseIcon v-if="showAccessPassword" />
            <BrowseOffIcon v-else />
          </button>
        </div>
        <t-button class="mobile-install-password-submit" block theme="primary" @click="verifyAccessPassword">验证密码</t-button>
      </div>
      <t-button
        v-else
        block
        size="large"
        theme="primary"
        :disabled="installSettings.downloadEnabled === false"
        @click="handleInstall"
      >
        {{ installButtonText }}
      </t-button>
      <div class="mobile-install-meta">
        <span>Build {{ app.buildNumber }}</span>
        <span>{{ installSettings.downloadValidity || '长期有效' }}</span>
      </div>
    </section>

    <section class="mobile-install-card">
      <h2>应用介绍</h2>
      <p>{{ installSettings.installDescription || app.description || '暂无应用介绍' }}</p>
    </section>

    <section class="mobile-install-card">
      <h2>更新说明</h2>
      <p>{{ installSettings.installReleaseNotes || '暂无' }}</p>
    </section>

    <section v-if="screenshots.length" class="mobile-install-card">
      <h2>应用截图</h2>
      <t-swiper class="mobile-install-swiper" :autoplay="false" :navigation="{ type: 'dots' }">
        <t-swiper-item v-for="(shot, index) in screenshots" :key="index">
          <img :src="shot" :alt="`应用截图 ${index + 1}`" />
        </t-swiper-item>
      </t-swiper>
    </section>

    <section class="mobile-install-card">
      <h2>安装信息</h2>
      <t-cell title="应用版本" :note="`v${app.version}`" />
      <t-cell title="Build 版本" :note="app.buildNumber" />
      <t-cell title="包体大小" :note="app.size" />
      <t-cell title="版本类型" :note="currentVersionLabel" />
      <t-cell title="分发模式" :note="distributionModeLabel" />
      <t-cell title="安装方式" :note="installSettings.installMethod || '公开'" />
      <t-cell title="下载页语言" :note="installSettings.downloadLanguage || '自动'" />
    </section>

    <div v-if="webViewOverlayVisible" class="mobile-webview-overlay" @click="webViewOverlayVisible = false">
      <div class="mobile-webview-guide" @click.stop>
        <div class="mobile-webview-arrow">↗</div>
        <h2>请在浏览器中打开</h2>
        <p>当前页面位于应用内置浏览器，可能无法直接安装。请点击右上角菜单，选择“在浏览器中打开”后继续安装。</p>
        <t-button block theme="primary" variant="outline" @click="webViewOverlayVisible = false">我知道了</t-button>
      </div>
    </div>
  </div>

  <div v-else-if="app" class="mobile-install-desktop">
    <div class="mobile-install-desktop-card">
      <h1>{{ app.name }}</h1>
      <p>当前链接为移动端安装页，请使用手机浏览器访问。</p>
      <t-qrcode :value="installUrl" :size="180" />
      <button class="mc-btn mc-btn-primary" @click="router.replace({ name: 'mobile-app-detail', params: { id: app.id } })">
        进入应用详情
      </button>
    </div>
  </div>

  <div v-else class="mobile-install-desktop">
    <div class="mobile-install-desktop-card">
      <h1>应用不存在</h1>
      <p>未找到对应的安装页面。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BrowseIcon, BrowseOffIcon } from 'tdesign-icons-vue-next'
import { Button as TButton, Cell as TCell, NoticeBar as TNoticeBar, QRCode as TQRCode, Swiper as TSwiper, SwiperItem as TSwiperItem, Tag as TTag, ToastPlugin } from 'tdesign-mobile-vue'
import { findMobileApp, readMobileAppVersions } from '../../config/mobileApps'
import { formatDistributionMode, isPasswordDistributionMode } from '../../api/mobileApps'

const route = useRoute()
const router = useRouter()
const app = computed(() => findMobileApp(route.params.id))
const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent)
const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
const isInAppWebView = /MicroMessenger|QQ\/|MQQBrowser|Weibo|DingTalk|Lark|Feishu|Toutiao|NewsArticle|Aweme|Bytedance|AlipayClient/i.test(userAgent)
const webViewOverlayVisible = ref(false)
const accessPassword = ref('')
const showAccessPassword = ref(false)
const passwordPassed = ref(false)
const installSettings = computed(() => app.value?.installSettings || {})
const versions = computed(() => app.value ? readMobileAppVersions(app.value.id) : [])
const currentVersion = computed(() => {
  if (!app.value) return null
  return versions.value.find((version) => version.id === app.value.currentVersionId) ||
    versions.value.find((version) => version.version === app.value.version && version.buildNumber === app.value.buildNumber) ||
    null
})
const installUrl = computed(() => {
  return installSettings.value.installUrl || `${window.location.origin}${window.location.pathname}#/install/${app.value?.id || ''}`
})
const appStoreUrl = computed(() => installSettings.value.appStoreUrl || '')
const isReleaseVersion = computed(() => {
  const version = currentVersion.value
  return version?.status === '已发布' || version?.channel === '正式版' || app.value?.status === '已发布'
})
const currentVersionLabel = computed(() => {
  if (!currentVersion.value) return app.value?.status || '-'
  return `${currentVersion.value.channel || '-'} · ${currentVersion.value.status || '-'}`
})
const targetInstallUrl = computed(() => {
  if (isIOS && isReleaseVersion.value && appStoreUrl.value) return appStoreUrl.value
  return installUrl.value
})
const installButtonText = computed(() => {
  if (installSettings.value.downloadEnabled === false) return '下载已关闭'
  if (passwordRequired.value && !passwordPassed.value) return '请先验证密码'
  if (isIOS && isReleaseVersion.value) return '前往 App Store'
  return '立即安装'
})
const screenshots = computed(() => installSettings.value.screenshots || [])
const distributionModeLabel = computed(() => formatDistributionMode(installSettings.value.distributionMode))
const passwordRequired = computed(() => {
  return isPasswordDistributionMode(installSettings.value.distributionMode) || installSettings.value.installMethod === '密码安装'
})

function verifyAccessPassword () {
  const expected = String(installSettings.value.accessCode || installSettings.value.accessPassword || '').trim()
  if (!expected) {
    ToastPlugin.fail('当前安装页未配置访问密码')
    return
  }
  if (String(accessPassword.value || '').trim() !== expected) {
    ToastPlugin.fail('访问密码不正确')
    return
  }
  passwordPassed.value = true
  ToastPlugin.success('密码验证通过')
}

function handleInstall () {
  if (installSettings.value.downloadEnabled === false) return
  if (passwordRequired.value && !passwordPassed.value) {
    ToastPlugin.fail('请先验证访问密码')
    return
  }
  if (isInAppWebView) {
    webViewOverlayVisible.value = true
    return
  }
  ToastPlugin.success(isIOS && isReleaseVersion.value ? '正在打开 App Store' : '正在打开下载链接')
  window.location.href = targetInstallUrl.value
}
</script>
