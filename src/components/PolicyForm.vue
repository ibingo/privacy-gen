<template>
  <t-card class="panel form-panel" :bordered="false">
    <template #title>
      <div class="panel-title">
        <span>填写应用信息</span>
        <t-tag theme="success" variant="light">实时预览</t-tag>
      </div>
    </template>

    <t-form layout="vertical" class="policy-form">
      <div class="field-grid">
        <t-form-item label="关联应用" required-mark>
          <t-select
            v-model="formData.appId"
            clearable
            filterable
            :loading="appsLoading"
            :popup-props="{ overlayClassName: 'legal-app-select-popup' }"
            placeholder="从移动应用列表选择"
            @update:model-value="handleAppChange"
          >
            <t-option v-for="option in appOptions" :key="option.value" :value="option.value" :label="option.label">
              <div class="app-option">
                <span class="platform-icon"><component :is="getPlatformIcon(option.app.platform)" /></span>
                <span class="app-option-main">
                  <strong>{{ option.app.name }}</strong>
                  <small>{{ formatPlatform(option.app.platform) }}</small>
                </span>
                <t-tag size="small" variant="light">{{ formatPlatform(option.app.platform) }}</t-tag>
              </div>
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item label="应用名称" required-mark>
          <t-input v-model="formData.appName" clearable placeholder="选择应用后自动带出" />
        </t-form-item>
        <t-form-item label="公司名称" required-mark>
          <t-input v-model="formData.companyName" clearable placeholder="例如：某某科技有限公司" />
        </t-form-item>
        <t-form-item label="联系邮箱" required-mark>
          <t-input v-model="formData.contactEmail" clearable placeholder="例如：privacy@example.com" />
        </t-form-item>
        <t-form-item label="版本范围">
          <t-select v-model="formData.version" :options="versionOptions" placeholder="不限制版本" />
        </t-form-item>
        <t-form-item label="适用终端">
          <t-input v-model="formData.platform" clearable placeholder="选择应用后自动带出" />
        </t-form-item>
        <t-form-item label="生效日期">
          <t-date-picker v-model="formData.effectiveDate" class="full-width" clearable />
        </t-form-item>
      </div>

      <t-divider align="left">第三方 SDK 列表</t-divider>
      <t-space direction="vertical" size="medium" class="full-width">
        <t-card
          v-for="(sdk, index) in formData.sdkList"
          :key="index"
          size="small"
          class="sdk-card"
          :bordered="true"
        >
          <template #title>SDK #{{ index + 1 }}</template>
          <template #actions>
            <t-button theme="danger" variant="text" size="small" @click="removeSdk(index)">删除</t-button>
          </template>
          <div class="sdk-fields">
            <t-input v-model="sdk.name" clearable placeholder="SDK 名称（如：阿里云推送）" />
            <t-input v-model="sdk.company" clearable placeholder="第三方公司名称" />
            <t-textarea v-model="sdk.purpose" placeholder="使用目的" :autosize="{ minRows: 2, maxRows: 4 }" />
            <t-textarea v-model="sdk.dataTypes" placeholder="收集的个人信息类型" :autosize="{ minRows: 2, maxRows: 4 }" />
            <t-input v-model="sdk.processing" clearable placeholder="处理方式（如：匿名化处理）" />
            <t-input v-model="sdk.privacyUrl" clearable placeholder="隐私政策链接" />
          </div>
        </t-card>
        <t-button block variant="dashed" theme="primary" @click="addSdk">添加 SDK</t-button>
      </t-space>

      <t-divider align="left">其他说明</t-divider>
      <t-form-item>
        <t-textarea
          v-model="formData.additionalInfo"
          placeholder="您可以在此添加其他需要说明的内容..."
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </t-form-item>
    </t-form>
  </t-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Button as TButton,
  Card as TCard,
  DatePicker as TDatePicker,
  Divider as TDivider,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag,
  Textarea as TTextarea
} from 'tdesign-vue-next'
import { LogoAndroidIcon, LogoAppleIcon, LogoChromeIcon, MobileIcon } from 'tdesign-icons-vue-next'
import { listMobileAppsApi } from '../api/mobileApps'
import { defaultProjectValue, PROJECT_STORAGE_KEY } from '../config/projects'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const createDefaultForm = () => ({
  id: '',
  appId: '',
  appName: '',
  companyName: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  version: '不限制版本',
  platform: '',
  packageName: '',
  status: '待存档',
  sdkList: [],
  additionalInfo: ''
})

const formData = reactive(createDefaultForm())
const appsLoading = ref(false)
const mobileApps = ref([])
const appOptions = computed(() => mobileApps.value.map((app) => ({
  value: app.id,
  label: `${app.name} ${formatPlatform(app.platform)}`,
  app
})))
const versionOptions = computed(() => {
  const options = [{ value: '不限制版本', label: '不限制版本' }]
  const app = mobileApps.value.find((item) => item.id === formData.appId)
  const versions = Array.isArray(app?.versions)
    ? app.versions
    : app?.latestVersion
      ? [app.latestVersion]
      : app?.version
        ? [{ version: app.version }]
        : []
  versions.forEach((item) => {
    const value = String(item.version || item.versionName || item.versionId || '').startsWith('V')
      ? String(item.version || item.versionName || item.versionId)
      : `V${item.version || item.versionName || item.versionId}`
    if (!options.some((option) => option.value === value)) options.push({ value, label: value })
  })
  if (formData.version && !options.some((option) => option.value === formData.version)) {
    options.push({ value: formData.version, label: formData.version })
  }
  return options
})

const getPlatformIcon = (platform = '') => {
  const value = String(platform).toLowerCase()
  if (value === 'ios' || platform === 'iOS') return LogoAppleIcon
  if (value === 'android' || platform === 'Android') return LogoAndroidIcon
  if (value === 'web-app' || platform === 'Web App') return LogoChromeIcon
  return MobileIcon
}

const platformLabels = {
  ios: 'iOS',
  android: 'Android',
  'web-app': 'Web App',
  harmonyos: 'HarmonyOS'
}

const formatPlatform = (platform = '') => platformLabels[platform] || platform || '-'

const normalizeMobileApp = (app = {}) => ({
  ...app,
  id: app.id || app.appId || app.value || '',
  name: app.name || app.appName || app.label || '',
  platform: app.platform || app.applicableTerminal || '',
  packageName: app.packageName || app.bundleId || app.applicationId || '',
  versions: Array.isArray(app.versions) ? app.versions : []
})

async function fetchMobileApps () {
  appsLoading.value = true
  try {
    const data = await listMobileAppsApi({
      projectValue: localStorage.getItem(PROJECT_STORAGE_KEY) || defaultProjectValue || '',
      keyword: '',
      platform: '',
      status: '',
      page: 1,
      pageSize: 200
    })
    mobileApps.value = Array.isArray(data?.items) ? data.items.map(normalizeMobileApp).filter((app) => app.id) : []
  } catch (error) {
    mobileApps.value = []
  } finally {
    appsLoading.value = false
  }
}

const emit = defineEmits(['update'])

const applyForm = (value = {}) => {
  Object.assign(formData, createDefaultForm(), JSON.parse(JSON.stringify(value)))
  if (!Array.isArray(formData.sdkList)) formData.sdkList = []
}

const emitUpdate = () => {
  emit('update', JSON.parse(JSON.stringify(formData)))
}

const handleAppChange = (appId) => {
  formData.appId = appId || ''
  const app = appOptions.value.find((item) => item.value === appId)?.app
  if (!app) {
    formData.appName = ''
    formData.platform = ''
    formData.packageName = ''
    formData.version = '不限制版本'
    return
  }
  formData.appName = app.name
  formData.platform = formatPlatform(app.platform)
  formData.packageName = app.packageName
  if (app.companyName && !formData.companyName) formData.companyName = app.companyName
  if (app.contactEmail && !formData.contactEmail) formData.contactEmail = app.contactEmail
  formData.version = '不限制版本'
}

const addSdk = () => {
  formData.sdkList.push({
    name: '',
    company: '',
    purpose: '',
    dataTypes: '',
    processing: '',
    privacyUrl: ''
  })
}

const removeSdk = (index) => {
  formData.sdkList.splice(index, 1)
}

watch(
  () => props.modelValue?.id || '__create__',
  () => applyForm(props.modelValue),
  { immediate: true }
)

watch(formData, emitUpdate, { deep: true, immediate: true })

onMounted(() => {
  fetchMobileApps()
})
</script>

<style scoped>
.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.policy-form :deep(.t-form__label) {
  color: #3d4757;
  font-weight: 600;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
}

.full-width {
  width: 100%;
}

:global(.legal-app-select-popup .t-select-option) {
  min-height: 60px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin: 2px 0;
}

:global(.legal-app-select-popup .t-select-option > span) {
  width: 100%;
}

.app-option {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 4px 0;
}

.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #0052d9;
  background: #edf4ff;
  flex: 0 0 auto;
}

.app-option-main {
  display: block;
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-option-main small {
  display: none;
}

.check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 18px;
  margin-bottom: 4px;
}

.check-grid-compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sdk-card {
  background: #fbfcff;
}

.sdk-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.sdk-fields :deep(.t-textarea) {
  grid-column: span 2;
}

@media (max-width: 720px) {
  .field-grid,
  .check-grid,
  .check-grid-compact,
  .sdk-fields {
    grid-template-columns: 1fr;
  }

  .sdk-fields :deep(.t-textarea) {
    grid-column: span 1;
  }
}
</style>
