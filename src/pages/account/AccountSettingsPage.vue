<template>
  <t-loading :loading="loading" text="加载账号信息中">
    <div class="account-settings-page">
      <t-alert v-if="loadError" theme="error" :message="loadError" />
      <section class="account-settings-card account-settings-profile">
        <div class="account-settings-avatar">{{ avatarText }}</div>
        <div>
          <h3>{{ accountName }}</h3>
          <p>{{ accountEmail }}</p>
        </div>
        <t-tag theme="primary" variant="light">企业账号</t-tag>
      </section>

      <section class="account-settings-card">
        <div class="account-settings-card-header">
          <h3>安全设置</h3>
          <p>管理登录凭证、双重验证和会话保护策略。</p>
        </div>
        <div class="account-security-list">
          <div class="account-security-item">
          <span class="account-security-icon">
            <lock-on-icon />
          </span>
            <span>
            <strong>登录密码</strong>
            <small>上次修改时间：{{ securitySettings.passwordLastChangedAt || '-' }}</small>
          </span>
            <t-button variant="outline" size="small" @click="openPasswordDialog">修改</t-button>
          </div>
          <div class="account-security-item">
          <span class="account-security-icon">
            <mobile-icon />
          </span>
            <span>
            <strong>手机号验证</strong>
            <small>用于登录验证、风险提醒和敏感操作确认。</small>
          </span>
            <t-switch
              v-model="securitySettings.phoneVerificationEnabled"
              :loading="securitySaving"
              @change="saveSecuritySettings"
            />
          </div>
          <div class="account-security-item">
          <span class="account-security-icon">
            <secured-icon />
          </span>
            <span>
            <strong>双重验证</strong>
            <small>{{ mfaDescription }}</small>
          </span>
            <t-switch
              v-model="securitySettings.mfaEnabled"
              :disabled="securitySettings.mfaForcedBySystem"
              :loading="securitySaving"
              @change="saveSecuritySettings"
            />
          </div>
        </div>
      </section>

      <t-dialog
        v-model:visible="passwordDialogVisible"
        header="修改密码"
        width="520px"
        :confirm-btn="{ content: '保存', theme: 'primary', loading: passwordSaving }"
        cancel-btn="取消"
        @confirm="submitPassword"
        @cancel="closePasswordDialog"
        @close="closePasswordDialog"
      >
        <t-form :data="passwordForm" label-align="top">
          <t-form-item label="旧密码">
            <t-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" />
          </t-form-item>
          <t-form-item label="新密码">
            <t-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </t-form-item>
        </t-form>
      </t-dialog>
    </div>
  </t-loading>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  LockOnIcon,
  MobileIcon,
  SecuredIcon
} from 'tdesign-icons-vue-next'
import {
  Alert as TAlert,
  Button as TButton,
  Dialog as TDialog,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Loading as TLoading,
  MessagePlugin,
  Switch as TSwitch,
  Tag as TTag
} from 'tdesign-vue-next'
import { userPasswordApi, userProfileApi, userSecuritySettingsApi } from '../../api/user'

const loading = ref(false)
const loadError = ref('')
const profile = ref({
  username: '',
  displayName: '',
  greetingName: '',
  avatarText: '',
  basicInfo: {}
})

const accountName = computed(() => profile.value.displayName || profile.value.greetingName || profile.value.username || '-')
const accountEmail = computed(() => profile.value.basicInfo?.email || '-')
const avatarText = computed(() => {
  const text = profile.value.avatarText || accountName.value || '用'
  return String(text).slice(0, 1)
})

const securitySaving = ref(false)
const passwordDialogVisible = ref(false)
const passwordSaving = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: ''
})
const securitySettings = reactive({
  passwordLastChangedAt: '',
  phoneVerificationEnabled: true,
  mfaEnabled: false,
  mfaForcedBySystem: false
})
const securitySnapshot = ref({})

const mfaDescription = computed(() => {
  if (securitySettings.mfaForcedBySystem) return '系统已强制开启双重验证。'
  return '开启后，登录新设备时需要额外验证。'
})

const applySecuritySettings = (data = {}) => {
  Object.assign(securitySettings, {
    passwordLastChangedAt: data.passwordLastChangedAt || '',
    phoneVerificationEnabled: data.phoneVerificationEnabled ?? true,
    mfaEnabled: data.mfaEnabled ?? false,
    mfaForcedBySystem: data.mfaForcedBySystem ?? false
  })
  securitySnapshot.value = { ...securitySettings }
}

const loadSecuritySettings = async () => {
  const securityData = await userSecuritySettingsApi.get()
  applySecuritySettings(securityData)
}

const loadProfile = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const [data, securityData] = await Promise.all([
      userProfileApi(),
      userSecuritySettingsApi.get()
    ])
    profile.value = {
      ...profile.value,
      ...(data || {}),
      basicInfo: data?.basicInfo || {}
    }
    applySecuritySettings(securityData)
  } catch (error) {
    loadError.value = error.message || '账号信息加载失败'
  } finally {
    loading.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
}

const openPasswordDialog = () => {
  resetPasswordForm()
  passwordDialogVisible.value = true
}

const closePasswordDialog = () => {
  if (passwordSaving.value) return
  passwordDialogVisible.value = false
  resetPasswordForm()
}

const submitPassword = async () => {
  if (!passwordForm.oldPassword) {
    MessagePlugin.warning('请输入旧密码')
    return
  }
  if (!passwordForm.newPassword) {
    MessagePlugin.warning('请输入新密码')
    return
  }
  passwordSaving.value = true
  try {
    await userPasswordApi.update({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })
    MessagePlugin.success('密码已修改')
    passwordDialogVisible.value = false
    resetPasswordForm()
    await loadSecuritySettings()
  } catch (error) {
    MessagePlugin.error(error.message || '密码修改失败')
  } finally {
    passwordSaving.value = false
  }
}

const saveSecuritySettings = async () => {
  securitySaving.value = true
  try {
    const data = await userSecuritySettingsApi.update({
      phoneVerificationEnabled: securitySettings.phoneVerificationEnabled,
      mfaEnabled: securitySettings.mfaEnabled
    })
    applySecuritySettings(data || {
      ...securitySettings
    })
    MessagePlugin.success('安全设置已保存')
  } catch (error) {
    Object.assign(securitySettings, securitySnapshot.value)
    MessagePlugin.error(error.message || '安全设置保存失败')
  } finally {
    securitySaving.value = false
  }
}

onMounted(loadProfile)
</script>
