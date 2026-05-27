<template>
  <starter-list-page
    v-model:keyword="keyword"
    title="国际化文案"
    :total-text="`共 ${filteredRows.length} 项`"
    :summary-text="`已选 ${selectedRowKeys.length} 项`"
    primary-action="新建文案"
    :columns="columns"
    :data="filteredRows"
    :selected-row-keys="selectedRowKeys"
    @select-change="selectedRowKeys = $event"
  >
    <template #filters>
      <t-select v-model="statusFilter" class="starter-list-filter-select" placeholder="状态">
        <t-option value="all" label="全部状态" />
        <t-option v-for="status in statusOptions" :key="status" :value="status" :label="status" />
      </t-select>
      <t-select v-model="localeFilter" class="starter-list-filter-select" placeholder="默认语言">
        <t-option value="all" label="全部语言" />
        <t-option v-for="locale in localeOptions" :key="locale" :value="locale" :label="locale" />
      </t-select>
    </template>
    <template #status="{ row }">
      <t-tag :theme="getStatusTheme(row.statusTone)" variant="light">{{ row.status }}</t-tag>
    </template>
    <template #operation>
      <t-space size="small">
        <t-button theme="primary" variant="text">详情</t-button>
        <t-button theme="danger" variant="text">删除</t-button>
      </t-space>
    </template>
  </starter-list-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Button as TButton, Option as TOption, Select as TSelect, Space as TSpace, Tag as TTag } from 'tdesign-vue-next'
import StarterListPage from '../../components/StarterListPage.vue'

const keyword = ref('')
const statusFilter = ref('all')
const localeFilter = ref('all')

const rows = [
  { id: 'i18n-001', name: 'privacy.title', status: '已完成', statusTone: 'success', locale: 'zh-CN', coverage: '8', updatedAt: '2026-05-08 10:40', checked: true },
  { id: 'i18n-002', name: 'agreement.export.button', status: '待发布', statusTone: 'warning', locale: 'en-US', coverage: '6', updatedAt: '2026-05-08 09:18', checked: true },
  { id: 'i18n-003', name: 'project.empty.description', status: '审核中', statusTone: 'processing', locale: 'zh-CN', coverage: '5', updatedAt: '2026-05-07 20:06', checked: true },
  { id: 'i18n-004', name: 'policy.form.sdk.label', status: '已完成', statusTone: 'success', locale: 'ja-JP', coverage: '8', updatedAt: '2026-05-07 16:11', checked: false },
  { id: 'i18n-005', name: 'layout.notification.empty', status: '审核失败', statusTone: 'danger', locale: 'zh-CN', coverage: '3', updatedAt: '2026-05-06 14:25', checked: false }
]
const selectedRowKeys = ref(rows.filter((item) => item.checked).map((item) => item.id))
const statusOptions = [...new Set(rows.map((item) => item.status))]
const localeOptions = [...new Set(rows.map((item) => item.locale))]
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 48 },
  { colKey: 'name', title: '文案 Key', minWidth: 240 },
  { colKey: 'status', title: '状态', width: 110 },
  { colKey: 'locale', title: '默认语言', width: 120 },
  { colKey: 'coverage', title: '覆盖语言数', width: 120 },
  { colKey: 'updatedAt', title: '最近更新', width: 170 },
  { colKey: 'operation', title: '操作', width: 120, fixed: 'right' }
]

const filteredRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return rows.filter((item) => {
    const matchKeyword = !q || `${item.name} ${item.locale}`.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchLocale = localeFilter.value === 'all' || item.locale === localeFilter.value
    return matchKeyword && matchStatus && matchLocale
  })
})

const getStatusTheme = (tone) => {
  const themeMap = {
    success: 'success',
    warning: 'warning',
    processing: 'primary',
    danger: 'danger'
  }
  return themeMap[tone] || 'default'
}
</script>
