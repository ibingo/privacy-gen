<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="AI 翻译来源"
    :summary-text="`共 ${filteredRows.length} 项`"
    primary-action="添加来源"
    :columns="columns"
    :data="filteredRows"
    search-placeholder="搜索服务名称、模型或接口地址"
    @primary="openDrawer()"
  >
    <template #filters>
      <t-select v-model="providerFilter" class="starter-list-filter-select" placeholder="服务商">
        <t-option value="all" label="全部服务商" />
        <t-option v-for="provider in aiProviderOptions" :key="provider.value" :value="provider.value" :label="provider.label" />
      </t-select>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option value="enabled" label="启用" />
        <t-option value="disabled" label="停用" />
      </t-select>
    </template>

    <template #name="{ row }">
      <div class="system-manage-name-cell">
        <strong>{{ row.name }}</strong>
        <small>{{ row.endpoint }}</small>
      </div>
    </template>

    <template #provider="{ row }">
      <t-tag variant="light">{{ getProviderLabel(row.provider) }}</t-tag>
    </template>

    <template #status="{ row }">
      <t-tag :theme="row.status === 'enabled' ? 'success' : 'default'" variant="light">
        {{ row.status === 'enabled' ? '启用' : '停用' }}
      </t-tag>
    </template>

    <template #operation="{ row }">
      <t-space size="small">
        <t-button theme="primary" variant="text" @click.stop="openDrawer(row)">编辑</t-button>
        <t-popconfirm
          content="确认删除该 AI 翻译来源？"
          theme="danger"
          placement="top-right"
          confirm-btn="删除"
          cancel-btn="取消"
          @confirm="handleRemove(row.id)"
        >
          <t-button theme="danger" variant="text" @click.stop>删除</t-button>
        </t-popconfirm>
      </t-space>
    </template>
  </starter-list-page>

  <ai-translation-service-drawer
    v-model:visible="drawerVisible"
    :service="editingService"
    @saved="handleSaved"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Button as TButton,
  MessagePlugin,
  Option as TOption,
  Popconfirm as TPopconfirm,
  Select as TSelect,
  Space as TSpace,
  Tag as TTag
} from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'
import AiTranslationServiceDrawer from '../../components/AiTranslationServiceDrawer.vue'
import {
  aiProviderOptions,
  readAiTranslationServices,
  removeAiTranslationService,
  upsertAiTranslationService
} from '../../config/aiTranslationServices'

const keyword = ref('')
const providerFilter = ref('all')
const statusFilter = ref('all')
const rows = ref(readAiTranslationServices())
const drawerVisible = ref(false)
const editingService = ref(null)

const columns = [
  { colKey: 'name', title: '服务名称', minWidth: 280 },
  { colKey: 'provider', title: '服务商', width: 130 },
  { colKey: 'model', title: '模型', minWidth: 180 },
  { colKey: 'maxRequestsPerSecond', title: '每秒请求数', width: 120 },
  { colKey: 'maxTextLength', title: '文本长度', width: 110 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'updatedAt', title: '更新时间', width: 170 },
  { colKey: 'operation', title: '操作', width: 130, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.model} ${item.endpoint}`.toLowerCase().includes(q)
    const matchProvider = providerFilter.value === 'all' || item.provider === providerFilter.value
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    return matchKeyword && matchProvider && matchStatus
  })
})

function openDrawer (service) {
  editingService.value = service || null
  drawerVisible.value = true
}

function handleSaved (service) {
  const isEditing = rows.value.some((item) => item.id === service.id)
  rows.value = upsertAiTranslationService(service)
  editingService.value = null
  MessagePlugin.success(isEditing ? 'AI 翻译来源已保存' : 'AI 翻译来源已创建')
}

function handleRemove (id) {
  rows.value = removeAiTranslationService(id)
  MessagePlugin.success('AI 翻译来源已删除')
}

function getProviderLabel (value) {
  return aiProviderOptions.find((item) => item.value === value)?.label || value
}
</script>
