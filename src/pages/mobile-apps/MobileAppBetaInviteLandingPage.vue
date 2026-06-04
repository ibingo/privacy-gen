<template>
  <div v-if="invite && isMobile" class="mobile-install-page beta-invite-mobile-page">
    <section class="beta-invite-template-render beta-invite-template-artboard" :style="templatePageStyle">
      <template v-for="layer in pageScopeTemplateLayers" :key="layer.id">
        <div v-if="layer.type === 'image'" class="beta-invite-template-image" :style="getImageLayerStyle(layer)">
          <img v-if="layer.src" :src="layer.src" :alt="layer.label || '邀请图片'" />
        </div>
      </template>
      <div class="beta-invite-template-preview">
        <div class="beta-invite-template-card" :style="templateCardStyle">
          <template v-for="layer in cardScopeTemplateLayers" :key="layer.id">
            <span v-if="layer.type === 'logo'" class="beta-invite-template-logo" :style="getLogoLayerStyle(layer)">
              <img v-if="targetApp?.iconImage" :src="targetApp.iconImage" :alt="invite.appName" />
              <span v-else>{{ targetApp?.icon || invite.appName.slice(0, 2) }}</span>
            </span>
            <div v-else-if="layer.type === 'meta'" class="beta-invite-template-meta" :style="getMetaLayerStyle(layer)">
              <span>邀请方式：{{ inviteTypeLabel }}</span>
              <span>剩余名额：{{ remainingQuota }} / {{ invite.quota }}</span>
              <span>有效期至：{{ invite.expiresAt }}</span>
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
            <div v-else :class="getTextLayerClass(layer)" :style="getTextLayerStyle(layer)">
              {{ getLayerText(layer) }}
            </div>
          </template>
        </div>

        <section
          v-if="invite.inviteType === 'password' && !passwordPassed"
          class="beta-invite-template-password-card"
          :style="passwordCardStyle"
        >
          <h2>输入邀请密码</h2>
          <t-input v-model="password" placeholder="请输入邀请密码" />
          <t-button block theme="primary" size="large" class="beta-invite-action" @click="handlePasswordCheck">
            验证密码
          </t-button>
        </section>
      </div>
    </section>

    <section v-if="!templateHasButton" class="mobile-install-card">
      <t-button block theme="primary" size="large" class="beta-invite-action" :disabled="!canJoin" @click="handleJoin">
        {{ joinButtonText }}
      </t-button>
    </section>

    <mobile-dialog
      v-model:visible="joinDialogVisible"
      title="确认加入内测"
      confirm-btn="提交申请"
      cancel-btn="取消"
      :close-on-overlay-click="false"
      :before-close="handleMobileJoinDialogBeforeClose"
      @cancel="closeJoinDialog"
      @close="closeJoinDialog"
    >
      <div class="beta-invite-join-dialog beta-invite-join-dialog--mobile">
        <p>{{ joinDialogDescription }}</p>
        <t-input v-model="joinApplicant" clearable placeholder="用户名或手机号" />
      </div>
    </mobile-dialog>
  </div>

  <div v-else-if="invite" class="mobile-install-desktop beta-invite-desktop">
    <div class="mobile-install-desktop-card beta-invite-desktop-card beta-invite-template-desktop-card">
      <section class="beta-invite-template-render beta-invite-template-render-pc beta-invite-template-artboard" :style="templatePageStyle">
        <template v-for="layer in pageScopeTemplateLayers" :key="layer.id">
          <div v-if="layer.type === 'image'" class="beta-invite-template-image" :style="getImageLayerStyle(layer)">
            <img v-if="layer.src" :src="layer.src" :alt="layer.label || '邀请图片'" />
          </div>
        </template>
        <div class="beta-invite-template-preview">
          <div class="beta-invite-template-card" :style="templateCardStyle">
            <template v-for="layer in cardScopeTemplateLayers" :key="layer.id">
              <span v-if="layer.type === 'logo'" class="beta-invite-template-logo" :style="getLogoLayerStyle(layer)">
                <img v-if="targetApp?.iconImage" :src="targetApp.iconImage" :alt="invite.appName" />
                <span v-else>{{ targetApp?.icon || invite.appName.slice(0, 2) }}</span>
              </span>
              <div v-else-if="layer.type === 'meta'" class="beta-invite-template-meta" :style="getMetaLayerStyle(layer)">
                <span>邀请方式：{{ inviteTypeLabel }}</span>
                <span>剩余名额：{{ remainingQuota }} / {{ invite.quota }}</span>
                <span>有效期至：{{ invite.expiresAt }}</span>
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
              <div v-else :class="getTextLayerClass(layer)" :style="getTextLayerStyle(layer)">
                {{ getLayerText(layer) }}
              </div>
            </template>
          </div>

          <section
            v-if="invite.inviteType === 'password' && !passwordPassed"
            class="beta-invite-template-password-card"
            :style="passwordCardStyle"
          >
            <h2>输入邀请密码</h2>
            <t-input v-model="password" placeholder="请输入邀请密码" />
            <t-button block theme="primary" size="large" class="beta-invite-action" @click="handlePasswordCheck">
              验证密码
            </t-button>
          </section>
        </div>
      </section>
      <t-button v-if="!templateHasButton" theme="primary" size="large" :disabled="!canJoin" @click="handleJoin">
        {{ joinButtonText }}
      </t-button>
    </div>

    <desktop-dialog
      v-model:visible="joinDialogVisible"
      header="确认加入内测"
      width="420px"
      confirm-btn="提交申请"
      cancel-btn="取消"
      :close-on-overlay-click="false"
      @confirm="submitJoinApplication"
      @cancel="closeJoinDialog"
      @close="closeJoinDialog"
    >
      <div class="beta-invite-join-dialog">
        <p>{{ joinDialogDescription }}</p>
        <desktop-input v-model="joinApplicant" clearable placeholder="用户名或手机号" />
      </div>
    </desktop-dialog>
  </div>

  <div v-else class="mobile-install-desktop">
    <div class="mobile-install-desktop-card">
      <h1>邀请不存在</h1>
      <p>未找到对应的内测邀请链接。</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Button as TButton, Dialog as MobileDialog, DialogPlugin as MobileDialogPlugin, Input as TInput, ToastPlugin } from 'tdesign-mobile-vue'
import { Dialog as DesktopDialog, DialogPlugin as DesktopDialogPlugin, Input as DesktopInput, MessagePlugin } from 'tdesign-vue-next'
import { addJoinedBetaInviteUser, findBetaInvite, getInviteTargetApp, getInviteVersionLabel, isInviteReviewEnabled } from '../../config/betaInvites'
import { findBetaInviteTemplate, findDefaultBetaInviteTemplate } from '../../config/betaInviteTemplates'

const route = useRoute()
const invite = ref(findBetaInvite(route.params.code))
const password = ref('')
const passwordPassed = ref(invite.value?.inviteType !== 'password')
const joinDialogVisible = ref(false)
const joinApplicant = ref('')
const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent)
const targetApp = computed(() => getInviteTargetApp(invite.value))
const versionLabel = computed(() => getInviteVersionLabel(invite.value))
const inviteTemplate = computed(() => {
  return invite.value?.templateId ? findBetaInviteTemplate(invite.value.templateId) : findDefaultBetaInviteTemplate()
})
const templateStyle = computed(() => inviteTemplate.value?.style || {})
const visibleTemplateLayers = computed(() => {
  return (inviteTemplate.value?.layers || [])
    .filter((layer) => layer.visible)
    .sort((a, b) => getLayerZIndex(a) - getLayerZIndex(b))
})
const pageScopeTemplateLayers = computed(() => visibleTemplateLayers.value.filter((layer) => isPageScopeLayer(layer)))
const cardScopeTemplateLayers = computed(() => visibleTemplateLayers.value.filter((layer) => !isPageScopeLayer(layer)))
const hasPageScopeImage = computed(() => pageScopeTemplateLayers.value.some((layer) => layer.type === 'image'))
const templateHasButton = computed(() => visibleTemplateLayers.value.some((layer) => layer.type === 'button'))
const passwordCardStyle = computed(() => {
  const buttonLayer = visibleTemplateLayers.value.find((layer) => layer.type === 'button')
  return {
    width: `${templateStyle.value.passwordCardWidth || 84}%`,
    zIndex: buttonLayer ? getLayerZIndex(buttonLayer) : Math.max(2, ...visibleTemplateLayers.value.map((layer) => getLayerZIndex(layer)))
  }
})
const templatePageStyle = computed(() => ({
  background: templateStyle.value.pageBackground || '#f5f7fb'
}))
const templateCardStyle = computed(() => ({
  background: hasPageScopeImage.value ? 'transparent' : templateStyle.value.cardBackground || '#ffffff',
  borderRadius: `${templateStyle.value.cardRadius || 16}px`,
  color: templateStyle.value.textColor || '#111827',
  boxShadow: hasPageScopeImage.value ? 'none' : undefined
}))
const remainingQuota = computed(() => {
  if (!invite.value) return 0
  return Math.max(Number(invite.value.quota) - Number(invite.value.usedCount), 0)
})
const inviteTypeLabel = computed(() => invite.value?.inviteType === 'password' ? '密码邀请' : '公开邀请')
const inviteNeedsReview = computed(() => isInviteReviewEnabled(invite.value))
const joinDialogDescription = computed(() => inviteNeedsReview.value
  ? '请输入用户名或手机号，提交后将进入审核。'
  : '请输入用户名或手机号，提交后将加入内测。')
const canJoin = computed(() => {
  return invite.value?.status === 'enabled' && remainingQuota.value > 0 && passwordPassed.value
})
const joinButtonText = computed(() => {
  if (!invite.value) return '邀请不存在'
  if (invite.value.status === 'disabled') return '邀请已停用'
  if (invite.value.status === 'expired') return '邀请已过期'
  if (invite.value.status === 'full' || remainingQuota.value <= 0) return '名额已满'
  if (!passwordPassed.value) return '请先验证密码'
  return '加入内测'
})

function getLayerText (layer) {
  const values = {
    title: invite.value?.title,
    subtitle: invite.value ? `${invite.value.appName} · ${invite.value.platforms.join(' / ')} · ${versionLabel.value}` : '',
    remark: invite.value?.remark || '加入后可按当前邀请范围体验指定内测版本。',
    buttonText: joinButtonText.value
  }
  return values[layer.binding] || layer.fallback || ''
}

function getLayerPosition (layer) {
  if (isPageScopeLayer(layer)) {
    return {
      inset: 0,
      zIndex: 0,
      transform: 'none'
    }
  }
  return {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    zIndex: getLayerZIndex(layer),
    transform: 'translate(-50%, -50%)'
  }
}

function isPageScopeLayer (layer) {
  return layer.type === 'image' && layer.scope === 'page'
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
  if (isPageScopeLayer(layer)) {
    return {
      ...getLayerPosition(layer),
      width: '100%',
      height: '100%',
      borderRadius: `${layer.radius || 0}px`,
      opacity: (layer.opacity ?? 100) / 100,
      '--beta-template-image-fit': layer.objectFit || 'cover'
    }
  }
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

function getTextLayerClass (layer) {
  return [
    'beta-invite-template-text',
    layer.binding ? `beta-invite-template-text--${layer.binding}` : ''
  ]
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

function handlePasswordCheck () {
  if (!invite.value) return
  if (password.value.trim() !== invite.value.password) {
    ToastPlugin.warning('邀请密码不正确')
    return
  }
  passwordPassed.value = true
  ToastPlugin.success('验证通过')
}

function handleJoin () {
  if (!canJoin.value || !invite.value) return
  joinApplicant.value = ''
  joinDialogVisible.value = true
}

function closeJoinDialog () {
  joinDialogVisible.value = false
}

function submitJoinApplication () {
  const applicant = joinApplicant.value.trim()
  if (!applicant) {
    showJoinWarning('请输入用户名或手机号')
    return false
  }
  if (!canJoin.value || !invite.value) return false

  const isPhone = /^1[3-9]\d{9}$/.test(applicant)
  const updated = addJoinedBetaInviteUser(invite.value.id, {
    userName: isPhone ? `用户 ${applicant.slice(-4)}` : applicant,
    account: isPhone ? '' : applicant,
    phone: isPhone ? applicant : '',
    reviewStatus: inviteNeedsReview.value ? 'pending' : 'approved',
    reviewedAt: inviteNeedsReview.value ? '' : formatNow(),
    reviewer: inviteNeedsReview.value ? '' : '系统自动通过',
    source: '邀请页申请'
  })
  invite.value = updated || invite.value
  joinDialogVisible.value = false
  showJoinResult()
  return true
}

function handleMobileJoinDialogBeforeClose (trigger) {
  if (trigger !== 'confirm') return true
  return submitJoinApplication()
    ? Promise.resolve()
    : Promise.reject(new Error('invalid applicant'))
}

function showJoinWarning (message) {
  if (isMobile) {
    ToastPlugin.warning(message)
  } else {
    MessagePlugin.warning(message)
  }
}

function showJoinResult () {
  const title = inviteNeedsReview.value ? '申请已提交' : '已加入内测'
  const content = inviteNeedsReview.value ? '内测申请已提交，请等待审核。' : '已加入内测，可按当前邀请范围体验指定内测版本。'
  if (isMobile) {
    MobileDialogPlugin.alert({
      title,
      content,
      confirmBtn: '知道了'
    })
  } else {
    DesktopDialogPlugin.alert({
      header: title,
      body: content,
      confirmBtn: '知道了'
    })
  }
}

function formatNow () {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
</script>
