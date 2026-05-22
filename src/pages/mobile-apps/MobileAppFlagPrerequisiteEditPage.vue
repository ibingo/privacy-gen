<template>
  <div class="app-launch-editor-page" v-if="flag">
    <t-card class="app-launch-editor-toolbar" :bordered="false">
      <div class="app-launch-editor-title">
        <span class="app-launch-preview feature-prerequisite-icon">
          <setting-icon />
        </span>
        <div>
          <h2>前置条件</h2>
          <p>{{ flag.name }} · {{ flag.key }}</p>
        </div>
      </div>
      <t-space class="app-launch-editor-actions">
        <t-tag :theme="statusTheme" variant="light">{{ form.status }}</t-tag>
        <t-button variant="outline" @click="router.push(backRoute)">取消</t-button>
        <t-button theme="primary" @click="handleSave">保存前置条件</t-button>
      </t-space>
    </t-card>

    <div class="feature-prerequisite-layout">
      <t-card class="feature-prerequisite-card" :bordered="false" title="版本控制">
        <t-form layout="vertical">
          <div class="feature-prerequisite-form-grid">
            <t-form-item label="关联应用">
              <t-select v-model="form.appId" filterable @change="handleAppChange">
                <t-option v-for="app in apps" :key="app.id" :value="app.id" :label="`${app.name} · ${app.platform}`" />
              </t-select>
            </t-form-item>

            <t-form-item label="环境">
              <t-select v-model="form.environment" @change="syncPrerequisiteExpression">
                <t-option value="Production" label="Production" />
                <t-option value="Staging" label="Staging" />
                <t-option value="Development" label="Development" />
              </t-select>
            </t-form-item>

            <t-form-item label="最低版本">
              <t-select v-model="form.prerequisiteMinVersionId" clearable @change="syncPrerequisiteExpression">
                <t-option v-for="version in versionOptions" :key="version.id" :value="version.id" :label="formatVersionOption(version)" />
              </t-select>
            </t-form-item>

            <t-form-item label="最高版本">
              <t-select v-model="form.prerequisiteMaxVersionId" clearable @change="syncPrerequisiteExpression">
                <t-option v-for="version in versionOptions" :key="version.id" :value="version.id" :label="formatVersionOption(version)" />
              </t-select>
            </t-form-item>
          </div>

          <t-form-item label="前置条件表达式">
            <t-input :value="prerequisiteExpression" readonly />
          </t-form-item>
        </t-form>
      </t-card>

      <t-card class="feature-prerequisite-card" :bordered="false" title="版本来源">
        <div class="feature-prerequisite-summary">
          <span>应用</span>
          <strong>{{ selectedAppName }}</strong>
          <span>最低版本</span>
          <strong>{{ selectedMinVersionText }}</strong>
          <span>最高版本</span>
          <strong>{{ selectedMaxVersionText }}</strong>
          <span>表达式</span>
          <code>{{ prerequisiteExpression || '-' }}</code>
        </div>
      </t-card>
    </div>
  </div>

  <div v-else class="app-launch-editor-page">
    <t-card class="app-launch-empty-card" :bordered="false">
      <p>未找到该开关</p>
      <t-button variant="outline" @click="router.push({ name: 'mobile-app-experiments' })">返回开关列表</t-button>
    </t-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SettingIcon } from 'tdesign-icons-vue-next'
import {
  Button as TButton,
  Card as TCard,
  Form as TForm,
  FormItem as TFormItem,
  Input as TInput,
  MessagePlugin,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import { findFeatureFlag, flagStatusOptions, updateFeatureFlag } from '../../config/featureFlags'
import { readMobileApps, readMobileAppVersions } from '../../config/mobileApps'

const route = useRoute()
const router = useRouter()
const flag = findFeatureFlag(route.params.id)
const apps = readMobileApps()
const form = ref(JSON.parse(JSON.stringify(flag || {})))
const versionOptions = ref(flag ? readMobileAppVersions(flag.appId) : [])
const backRoute = computed(() => {
  return route.query.from === 'list'
    ? { name: 'mobile-app-experiments' }
    : { name: 'mobile-app-flag-configs', params: { id: flag.id } }
})

const statusTone = computed(() => {
  return flagStatusOptions.find((item) => item.value === form.value.status)?.tone || 'default'
})
const statusTheme = computed(() => {
  if (statusTone.value === 'success') return 'success'
  if (statusTone.value === 'warning' || statusTone.value === 'processing') return 'warning'
  return 'default'
})
const selectedApp = computed(() => apps.find((app) => app.id === form.value.appId) || null)
const selectedAppName = computed(() => selectedApp.value ? `${selectedApp.value.name} · ${selectedApp.value.platform}` : '-')
const selectedMinVersion = computed(() => versionOptions.value.find((version) => version.id === form.value.prerequisiteMinVersionId) || null)
const selectedMaxVersion = computed(() => versionOptions.value.find((version) => version.id === form.value.prerequisiteMaxVersionId) || null)
const selectedMinVersionText = computed(() => formatVersion(selectedMinVersion.value))
const selectedMaxVersionText = computed(() => formatVersion(selectedMaxVersion.value))
const prerequisiteExpression = computed(() => buildPrerequisiteExpression())

syncPrerequisiteExpression()

function formatVersion (version) {
  return version ? `${version.version} (${version.buildNumber})` : '不限制'
}

function formatVersionOption (version) {
  return `${version.version} · Build ${version.buildNumber} · ${version.channel}`
}

function handleAppChange () {
  versionOptions.value = readMobileAppVersions(form.value.appId)
  form.value.prerequisiteMinVersionId = ''
  form.value.prerequisiteMaxVersionId = ''
  syncPrerequisiteExpression()
}

function buildPrerequisiteExpression () {
  const parts = []
  if (selectedApp.value?.platform) parts.push(`platform = ${selectedApp.value.platform}`)
  if (form.value.environment) parts.push(`environment = ${form.value.environment}`)
  if (selectedMinVersion.value?.version) parts.push(`appVersion >= ${selectedMinVersion.value.version}`)
  if (selectedMaxVersion.value?.version) parts.push(`appVersion <= ${selectedMaxVersion.value.version}`)
  return parts.join(' AND ')
}

function syncPrerequisiteExpression () {
  form.value.prerequisite = buildPrerequisiteExpression()
}

function handleSave () {
  if (!form.value.appId) {
    MessagePlugin.warning('请选择关联应用')
    return
  }

  updateFeatureFlag(flag.id, {
    ...form.value,
    prerequisite: prerequisiteExpression.value,
    prerequisiteMinVersion: selectedMinVersion.value?.version || '',
    prerequisiteMaxVersion: selectedMaxVersion.value?.version || ''
  })
  MessagePlugin.success('前置条件已保存')
  router.push(backRoute.value)
}
</script>
