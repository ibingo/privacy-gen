<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="开关管理"
    primary-action="新建"
    search-placeholder="搜索名称、标识或描述"
    :breadcrumb="['功能特性管理', '开关管理']"
    :columns="columns"
    :data="filteredToggles"
    @primary="router.push({ name: 'mobile-app-experiment-create' })"
    @row-click="handleRowClick"
  >
    <template #filters>
      <t-select v-model="activeEnvironment" class="starter-list-filter-select" placeholder="环境">
        <t-option value="all" label="全部环境" />
        <t-option v-for="env in environments" :key="env" :value="env" :label="env" />
      </t-select>
      <t-select v-model="activeStatus" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in flagStatusOptions" :key="status.value" :value="status.value" :label="status.label" />
      </t-select>
      <t-select v-model="activeTag" class="starter-list-filter-select" placeholder="标签">
        <t-option value="all" label="全部标签" />
        <t-option v-for="tag in tags" :key="tag" :value="tag" :label="tag" />
      </t-select>
    </template>

        <template #intro="{ row }">
          <div class="feature-flag-intro">
            <div>
              <strong>{{ row.name }}</strong>
              <t-tag theme="primary" variant="light">{{ row.key }}</t-tag>
            </div>
            <small>{{ row.description || getDefaultDescription(row) }}</small>
          </div>
        </template>

        <template #status="{ row }">
          <t-tag :theme="getStatusTheme(row.status)" variant="light">
            {{ getStatusLabel(row.status) }}
          </t-tag>
        </template>

        <template #type="{ row }">
          {{ getFlagType(row) }}
        </template>

        <template #tag="{ row }">
          <span>{{ row.tag || '-' }}</span>
        </template>

        <template #access>
          <div class="feature-flag-access">
            <strong>最近未访问</strong>
            <small>确认代码接入正确</small>
          </div>
        </template>

        <template #updatedAt="{ row }">
          <span>Admin 更新于{{ getUpdatedText(row.updatedAt) }}</span>
        </template>

        <template #operation="{ row }">
          <t-space size="small" @click.stop>
            <t-button theme="primary" variant="text" @click="router.push({ name: 'mobile-app-flag-configs', params: { id: row.id } })">查看</t-button>
            <t-button theme="primary" variant="text" @click="router.push({ name: 'mobile-app-flag-config-edit', params: { id: row.id }, query: { from: 'list' } })">规则编辑</t-button>
            <t-button theme="primary" variant="text" @click="router.push({ name: 'mobile-app-flag-prerequisite-edit', params: { id: row.id }, query: { from: 'list' } })">前置条件</t-button>
          </t-space>
        </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Button as TButton,
  Option as TOption,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import { flagStatusOptions, readFeatureFlags } from '../../config/featureFlags'
import { readMobileApps } from '../../config/mobileApps'

const router = useRouter()
const apps = readMobileApps()
const toggles = ref(readFeatureFlags())
const keyword = ref('')
const activeEnvironment = ref('all')
const activeStatus = ref('all')
const activeTag = ref('all')
const environments = ['Production', 'Staging', 'Development']
const tags = computed(() => [...new Set(toggles.value.map((toggle) => toggle.tag).filter(Boolean))])
const columns = [
  { colKey: 'intro', title: '简介', minWidth: 320 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'tag', title: '标签', width: 130 },
  { colKey: 'access', title: '访问', minWidth: 170 },
  { colKey: 'updatedAt', title: '更新时间', width: 190 },
  { colKey: 'operation', title: '操作', width: 220, fixed: 'right' }
]
const filteredToggles = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return toggles.value.filter((toggle) => {
    const matchEnvironment = activeEnvironment.value === 'all' || toggle.environment === activeEnvironment.value
    const matchStatus = activeStatus.value === 'all' || toggle.status === activeStatus.value
    const matchTag = activeTag.value === 'all' || toggle.tag === activeTag.value
    const ruleText = toggle.rules.map((rule) => rule.condition).join(' ')
    const matchKeyword = !q || `${toggle.name} ${toggle.key} ${toggle.description || ''} ${ruleText} ${toggle.prerequisite} ${getAppName(toggle.appId)}`.toLowerCase().includes(q)
    return matchEnvironment && matchStatus && matchTag && matchKeyword
  })
})

function getAppName (appId) {
  const app = apps.find((item) => item.id === appId)
  return app ? `${app.name} ${app.platform}` : '未关联应用'
}

function getStatusTone (status) {
  return flagStatusOptions.find((item) => item.value === status)?.tone || 'default'
}

function getStatusTheme (status) {
  const tone = getStatusTone(status)
  if (tone === 'success') return 'success'
  if (tone === 'warning' || tone === 'processing') return 'warning'
  return 'default'
}

function getStatusLabel (status) {
  if (status === '开启') return '生效'
  if (status === '关闭') return '未生效'
  return status
}

function getFlagType (toggle) {
  const value = toggle.defaultValue || toggle.variations?.[0]?.value
  if (typeof value === 'boolean') return 'boolean'
  if (!Number.isNaN(Number(value)) && String(value).trim() !== '') return 'number'
  return toggle.variations?.length > 2 ? 'string' : 'boolean'
}

function getDefaultDescription (toggle) {
  const rule = toggle.rules?.[0]?.condition
  return rule && rule !== 'default' ? rule : `${getAppName(toggle.appId)} 的特性开关配置`
}

function getUpdatedText (updatedAt) {
  if (!updatedAt) return '6 天前'
  return String(updatedAt).includes('2026-05-2') ? '6 天前' : updatedAt
}

function handleRowClick ({ row }) {
  router.push({ name: 'mobile-app-flag-configs', params: { id: row.id } })
}
</script>
