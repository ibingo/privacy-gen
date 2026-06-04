<template>
  <div v-if="user && isMobile" class="mobile-install-page beta-invite-mobile-page">
    <section class="beta-invite-template-render" :style="templatePageStyle">
      <div class="beta-invite-template-card" :style="templateCardStyle">
        <template v-for="layer in visibleTemplateLayers" :key="layer.id">
          <span v-if="layer.type === 'logo'" class="beta-invite-template-logo" :style="getLogoLayerStyle(layer)">
            <img v-if="targetApp?.iconImage" :src="targetApp.iconImage" :alt="primaryAppName" />
            <span v-else>{{ targetApp?.icon || primaryAppName.slice(0, 2) }}</span>
          </span>
          <div v-else-if="layer.type === 'meta'" class="beta-invite-template-meta" :style="getMetaLayerStyle(layer)">
            <span>邀请方式：特邀用户</span>
            <span>邀请账号：{{ user.account }}</span>
            <span>有效期至：{{ user.expiresAt }}</span>
          </div>
          <div v-else-if="layer.type === 'image'" class="beta-invite-template-image" :style="getImageLayerStyle(layer)">
            <img v-if="layer.src" :src="layer.src" :alt="layer.label || '邀请图片'" />
          </div>
          <button
            v-else-if="layer.type === 'button'"
            class="beta-invite-template-button"
            type="button"
            :disabled="!canJoin"
            :style="getButtonLayerStyle(layer)"
            @click="handleJoin"
          >
            {{ joinButtonText }}
          </button>
          <div v-else class="beta-invite-template-text" :style="getTextLayerStyle(layer)">
            {{ getLayerText(layer) }}
          </div>
        </template>
      </div>
    </section>

    <section v-if="!templateHasButton" class="mobile-install-card">
      <t-button block theme="primary" size="large" class="beta-invite-action" :disabled="!canJoin" @click="handleJoin">
        {{ joinButtonText }}
      </t-button>
    </section>

    <section class="mobile-install-card beta-user-joined-tests">
      <h2>已加入测试</h2>
      <div v-if="joinedTests.length" class="beta-user-joined-test-list">
        <div v-for="test in joinedTests" :key="test.id" class="beta-user-joined-test-item">
          <strong>{{ test.appName }}</strong>
          <span>{{ (test.platforms || []).join(' / ') || '-' }}</span>
          <small>{{ test.versionLabel }}</small>
        </div>
      </div>
      <p v-else>暂无已加入测试</p>
    </section>
  </div>

  <div v-else-if="user" class="mobile-install-desktop beta-invite-desktop">
    <div class="mobile-install-desktop-card beta-invite-desktop-card beta-invite-template-desktop-card" :style="templateCardStyle">
      <section class="beta-invite-template-render beta-invite-template-render-pc" :style="templatePageStyle">
        <div class="beta-invite-template-card" :style="templateCardStyle">
          <template v-for="layer in visibleTemplateLayers" :key="layer.id">
            <span v-if="layer.type === 'logo'" class="beta-invite-template-logo" :style="getLogoLayerStyle(layer)">
              <img v-if="targetApp?.iconImage" :src="targetApp.iconImage" :alt="primaryAppName" />
              <span v-else>{{ targetApp?.icon || primaryAppName.slice(0, 2) }}</span>
            </span>
            <div v-else-if="layer.type === 'meta'" class="beta-invite-template-meta" :style="getMetaLayerStyle(layer)">
              <span>邀请方式：特邀用户</span>
              <span>邀请账号：{{ user.account }}</span>
              <span>有效期至：{{ user.expiresAt }}</span>
            </div>
            <div v-else-if="layer.type === 'image'" class="beta-invite-template-image" :style="getImageLayerStyle(layer)">
              <img v-if="layer.src" :src="layer.src" :alt="layer.label || '邀请图片'" />
            </div>
            <button
              v-else-if="layer.type === 'button'"
              class="beta-invite-template-button"
              type="button"
              :disabled="!canJoin"
              :style="getButtonLayerStyle(layer)"
              @click="handleJoin"
            >
              {{ joinButtonText }}
            </button>
            <div v-else class="beta-invite-template-text" :style="getTextLayerStyle(layer)">
              {{ getLayerText(layer) }}
            </div>
          </template>
        </div>
      </section>
      <t-button v-if="!templateHasButton" theme="primary" size="large" :disabled="!canJoin" @click="handleJoin">
        {{ joinButtonText }}
      </t-button>
      <section class="beta-user-joined-tests beta-user-joined-tests--desktop">
        <h2>已加入测试</h2>
        <div v-if="joinedTests.length" class="beta-user-joined-test-list">
          <div v-for="test in joinedTests" :key="test.id" class="beta-user-joined-test-item">
            <strong>{{ test.appName }}</strong>
            <span>{{ (test.platforms || []).join(' / ') || '-' }}</span>
            <small>{{ test.versionLabel }}</small>
          </div>
        </div>
        <p v-else>暂无已加入测试</p>
      </section>
    </div>
  </div>

  <div v-else class="mobile-install-desktop">
    <div class="mobile-install-desktop-card">
      <h1>邀请不存在</h1>
      <p>未找到对应的特邀用户邀请链接。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button as TButton, ToastPlugin } from 'tdesign-mobile-vue'
import { findBetaUser, getBetaUserJoinedTests, getBetaUserTargetApp } from '../../config/betaUsers'
import { findBetaInviteTemplate, findDefaultBetaInviteTemplate } from '../../config/betaInviteTemplates'

const route = useRoute()
const user = ref(findBetaUser(route.params.id))
const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent)
const targetApp = computed(() => getBetaUserTargetApp(user.value))
const joinedTests = computed(() => getBetaUserJoinedTests(user.value))
const primaryAppName = computed(() => user.value?.appNames?.[0] || user.value?.appName || '-')
const appNamesLabel = computed(() => {
  const appNames = user.value?.appNames?.length ? user.value.appNames : [user.value?.appName].filter(Boolean)
  return appNames.join(' / ') || '-'
})
const canJoin = computed(() => user.value?.status === 'enabled')
const inviteTemplate = computed(() => {
  return user.value?.templateId ? findBetaInviteTemplate(user.value.templateId) : findDefaultBetaInviteTemplate()
})
const templateStyle = computed(() => inviteTemplate.value?.style || {})
const visibleTemplateLayers = computed(() => {
  return (inviteTemplate.value?.layers || [])
    .filter((layer) => layer.visible)
    .sort((a, b) => getLayerZIndex(a) - getLayerZIndex(b))
})
const templateHasButton = computed(() => visibleTemplateLayers.value.some((layer) => layer.type === 'button'))
const templatePageStyle = computed(() => ({
  background: templateStyle.value.pageBackground || '#f5f7fb'
}))
const templateCardStyle = computed(() => ({
  background: templateStyle.value.cardBackground || '#ffffff',
  borderRadius: `${templateStyle.value.cardRadius || 16}px`,
  color: templateStyle.value.textColor || '#111827'
}))
const joinButtonText = computed(() => {
  if (!user.value) return '邀请不存在'
  if (user.value.status === 'disabled') return '邀请已停用'
  if (user.value.status === 'expired') return '邀请已过期'
  return '接受特邀并加入内测'
})

function getLayerText (layer) {
  const values = {
    title: user.value ? `${user.value.userName} 的特邀内测` : '',
    subtitle: user.value ? appNamesLabel.value : '',
    remark: user.value?.remark || '该链接仅用于当前特邀用户加入内测。',
    buttonText: joinButtonText.value
  }
  return values[layer.binding] || layer.fallback || ''
}

function getLayerPosition (layer) {
  return {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    zIndex: getLayerZIndex(layer),
    transform: 'translate(-50%, -50%)'
  }
}

function getLayerZIndex (layer) {
  const sourceLayers = inviteTemplate.value?.layers || []
  const fallback = Math.max(sourceLayers.length - sourceLayers.findIndex((item) => item.id === layer.id), 1)
  return Number(layer.zIndex) || fallback
}

function getLogoLayerStyle (layer) {
  return {
    ...getLayerPosition(layer),
    width: `${layer.size || 76}px`,
    height: `${layer.size || 76}px`,
    background: targetApp.value?.iconColor || templateStyle.value.primaryColor || '#0052d9',
    borderRadius: `${templateStyle.value.iconRadius || 18}px`,
    color: templateStyle.value.buttonTextColor || '#ffffff'
  }
}

function getImageLayerStyle (layer) {
  return {
    ...getLayerPosition(layer),
    width: `${layer.width || 160}px`,
    height: `${layer.height || 120}px`,
    borderRadius: `${layer.radius || 8}px`,
    opacity: (layer.opacity ?? 100) / 100,
    '--beta-template-image-fit': layer.objectFit || 'cover'
  }
}

function getTextLayerStyle (layer) {
  return {
    ...getLayerPosition(layer),
    color: layer.color || templateStyle.value.textColor || '#111827',
    fontSize: `${layer.fontSize || 14}px`,
    fontWeight: layer.fontWeight || 400
  }
}

function getMetaLayerStyle (layer) {
  return {
    ...getLayerPosition(layer),
    width: `${layer.width || 84}%`,
    color: templateStyle.value.secondaryTextColor || '#6b7280'
  }
}

function getButtonLayerStyle (layer) {
  return {
    ...getLayerPosition(layer),
    width: `${layer.width || 84}%`,
    minHeight: `${layer.height || 44}px`,
    background: templateStyle.value.primaryColor || '#0052d9',
    color: templateStyle.value.buttonTextColor || '#ffffff',
    borderRadius: `${templateStyle.value.buttonRadius || 8}px`
  }
}

function handleJoin () {
  if (!canJoin.value) return
  ToastPlugin.success('已加入内测')
}
</script>

<style scoped>
.beta-user-joined-tests {
  display: grid;
  gap: 12px;
}

.beta-user-joined-tests h2 {
  margin: 0;
  font-size: 16px;
}

.beta-user-joined-tests p {
  margin: 0;
  color: #6b7280;
}

.beta-user-joined-test-list {
  display: grid;
  gap: 8px;
}

.beta-user-joined-test-item {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.beta-user-joined-test-item strong {
  font-size: 14px;
  color: #111827;
}

.beta-user-joined-test-item span,
.beta-user-joined-test-item small {
  color: #6b7280;
}

.beta-user-joined-tests--desktop {
  width: 100%;
  margin-top: 16px;
  text-align: left;
}
</style>
